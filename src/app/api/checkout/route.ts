import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { getSession } from '@/actions/getSession';
import { db } from '@/db';
import { carts, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // 检查用户是否已登录
    if (!session?.user?.id) {
      return NextResponse.json({ error: '必须登录才能结账' }, { status: 401 });
    }

    // 获取用户的购物车
    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, session.user.id),
      with: {
        items: {
          with: {
            product: {
              with: {
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
          currency: 'usd',
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

    // 使用事务创建订单和订单项
    const order = await db.transaction(async (tx) => {
      // 创建订单
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: session.user.id,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          totalAmount: amount,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        })
        .returning();

      // 创建订单项
      if (cart.items.length > 0) {
        await tx.insert(orderItems).values(
          cart.items.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            colorId: item.colorId,
            sizeId: item.sizeId,
          }))
        );
      }

      return newOrder;
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
    await db
      .update(orders)
      .set({
        paymentMethod: 'Stripe',
        paymentIntent: checkoutSession.id,
      })
      .where(eq(orders.id, order.id));

    return NextResponse.json({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('结账错误:', error);
    return NextResponse.json({ error: '创建结账会话失败' }, { status: 500 });
  }
}
