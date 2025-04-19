import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { getSession } from '@/actions/getSession';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // 检查用户是否已登录
    if (!session?.user?.id) {
      return NextResponse.json({ error: '必须登录才能结账' }, { status: 401 });
    }

    // 获取用户的购物车
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            color: true,
            size: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: '购物车为空' }, { status: 400 });
    }

    // 计算总金额
    const amount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    // 构建行项目
    const lineItems = cart.items.map((item) => {
      const productName = item.product.name;
      const colorName = item.color?.name || '';
      const sizeName = item.size?.name || '';
      const variantInfo = [colorName, sizeName].filter(Boolean).join(', ');

      return {
        price_data: {
          currency: 'cny',
          product_data: {
            name: productName,
            description: variantInfo ? `${variantInfo}` : undefined,
            images: item.product.images && item.product.images.length > 0 ? [item.product.images[0]?.url] : undefined,
          },
          unit_amount: formatAmountForStripe(item.product.price),
        },
        quantity: item.quantity,
      };
    });

    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        totalAmount: amount,
        status: 'PENDING',
        paymentStatus: 'UNPAID', // 明确设置支付状态
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            colorId: item.colorId,
            sizeId: item.sizeId,
          })),
        },
      },
    });

    // 创建 Stripe 结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${
        order.id
      }`,
      cancel_url: `${req.headers.get('origin')}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      billing_address_collection: 'required', // 必须收集账单地址
      shipping_address_collection: {
        allowed_countries: ['CN', 'US', 'CA', 'JP', 'SG', 'HK', 'TW', 'MO'], // 允许的收货国家地区
      },
      phone_number_collection: {
        enabled: true, // 启用电话号码收集
      },
    });

    // 更新订单，添加 Stripe 会话 ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: 'Stripe',
        paymentIntent: checkoutSession.id,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('结账错误:', error);
    return NextResponse.json({ error: '创建结账会话失败' }, { status: 500 });
  }
}
