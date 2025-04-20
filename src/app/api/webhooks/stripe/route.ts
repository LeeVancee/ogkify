import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountFromStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// 解析请求体为文本
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: '缺少Stripe签名' }, { status: 400 });
    }

    // 确保 Webhook 密钥已设置
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('缺少 STRIPE_WEBHOOK_SECRET 环境变量');
      return NextResponse.json({ error: 'Webhook 配置错误' }, { status: 500 });
    }

    // 验证 Webhook 签名
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      console.error(`Webhook 签名验证失败: ${errorMessage}`);
      return NextResponse.json({ error: `Webhook 签名验证失败: ${errorMessage}` }, { status: 400 });
    }

    // 根据事件类型处理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // 从元数据中获取订单 ID
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.error('找不到订单 ID');
          return NextResponse.json({ error: '找不到订单 ID' }, { status: 400 });
        }

        // 获取地址信息
        const address = session.customer_details?.address;
        const addressComponents = [
          address?.line1,
          address?.line2,
          address?.city,
          address?.state,
          address?.postal_code,
          address?.country,
        ];
        const addressString = addressComponents.filter((c) => c !== null).join(', ');

        // 更新订单状态和地址信息
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentStatus: 'PAID',
            phone: session.customer_details?.phone || null,
            shippingAddress: addressString,
          },
        });

        // 清空用户购物车
        const userId = session.metadata?.userId;
        if (userId) {
          const cart = await prisma.cart.findFirst({
            where: { userId },
          });

          if (cart) {
            // 删除购物车项
            await prisma.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
          }
        }

        const amountShipping = formatAmountFromStripe(session.shipping_cost?.amount_total || 0, 'usd');
        const amount = formatAmountFromStripe(session.amount_total || 0, 'usd');

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // 尝试通过 metadata 获取订单 ID
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          // 更新订单状态
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED',
            },
          });
        } else {
          // 注意：我们需要先确保数据库中有 paymentIntent 字段
          // 这里不再通过 paymentIntent 字段查询，因为模式中可能还没有
          console.log('无法通过 paymentIntent 更新订单状态，需要更新数据库模式');
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        // 尝试获取关联的付款意图
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const orderId = paymentIntent.metadata?.orderId;

          if (orderId) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'REFUNDED',
              },
            });
          }
        }

        console.log('收到退款事件');
        break;
      }

      default:
        console.log(`未处理的事件类型: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook 错误:', error);
    return NextResponse.json({ error: '处理 webhook 时发生错误' }, { status: 500 });
  }
}

// 配置 Next.js 请求处理，禁用正文解析
export const config = {
  api: {
    bodyParser: false,
  },
};
