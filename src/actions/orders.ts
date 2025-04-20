'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './getSession';
import { formatPrice } from '@/lib/utils';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { OrderStatus } from '@prisma/client';

// 获取用户所有订单
export async function getUserOrders() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '未授权', success: false, orders: [] };
    }

    // 查询用户的所有订单，按创建时间倒序排列
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
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
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 格式化订单数据，添加更多可读信息
    const formattedOrders = orders.map((order) => {
      // 计算总商品数量
      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

      // 获取第一个商品的图片URL作为订单缩略图
      const firstItemImage = order.items[0]?.product.images[0]?.url || null;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.name,
        email: order.user.email,
        createdAt: order.createdAt.toISOString(),
        createdAtFormatted: new Date(order.createdAt).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        totalAmountFormatted: formatPrice(order.totalAmount),
        totalItems,
        shippingAddress: order.shippingAddress,
        phone: order.phone,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          priceFormatted: formatPrice(item.price),
          totalPrice: item.price * item.quantity,
          totalPriceFormatted: formatPrice(item.price * item.quantity),
          imageUrl: item.product.images[0]?.url || null,
          color: item.color
            ? {
                name: item.color.name,
                value: item.color.value,
              }
            : null,
          size: item.size
            ? {
                name: item.size.name,
                value: item.size.value,
              }
            : null,
        })),
        firstItemImage,
        user: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
        },
      };
    });

    return {
      success: true,
      orders: formattedOrders,
    };
  } catch (error) {
    console.error('获取订单失败:', error);
    return { error: '获取订单失败', success: false, orders: [] };
  }
}

// 获取订单详情
export async function getOrderDetails(orderId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '未授权', success: false };
    }

    // 查询订单，确保订单属于当前登录用户
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
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

    if (!order) {
      return { error: '找不到订单', success: false };
    }

    // 格式化订单详情
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      createdAtFormatted: new Date(order.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: order.status,
      statusText: getOrderStatusText(order.status),
      paymentStatus: order.paymentStatus,
      paymentStatusText: getPaymentStatusText(order.paymentStatus),
      totalAmount: order.totalAmount,
      totalAmountFormatted: formatPrice(order.totalAmount),
      totalItems,
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productDescription: item.product.description,
        quantity: item.quantity,
        price: item.price,
        priceFormatted: formatPrice(item.price),
        totalPrice: item.price * item.quantity,
        totalPriceFormatted: formatPrice(item.price * item.quantity),
        imageUrl: item.product.images[0]?.url || null,
        color: item.color
          ? {
              name: item.color.name,
              value: item.color.value,
            }
          : null,
        size: item.size
          ? {
              name: item.size.name,
              value: item.size.value,
            }
          : null,
      })),
    };

    return {
      success: true,
      order: formattedOrder,
    };
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return { error: '获取订单详情失败', success: false };
  }
}

// 获取订单状态的中文描述
function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: '待处理',
    PAID: '已支付',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return statusMap[status] || status;
}

// 获取支付状态的中文描述
function getPaymentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    UNPAID: '未支付',
    PAID: '已支付',
    REFUNDED: '已退款',
    FAILED: '支付失败',
  };
  return statusMap[status] || status;
}

// 获取用户未支付的订单
export async function getUnpaidOrders() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '未授权', success: false, orders: [] };
    }

    // 查询用户的未支付订单
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        paymentStatus: 'UNPAID',
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 使用与getUserOrders相同的格式化逻辑
    const formattedOrders = orders.map((order) => {
      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
      const firstItemImage = order.items[0]?.product.images[0]?.url || null;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        createdAtFormatted: new Date(order.createdAt).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        totalAmountFormatted: formatPrice(order.totalAmount),
        totalItems,
        shippingAddress: order.shippingAddress,
        phone: order.phone,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          priceFormatted: formatPrice(item.price),
          totalPrice: item.price * item.quantity,
          totalPriceFormatted: formatPrice(item.price * item.quantity),
          imageUrl: item.product.images[0]?.url || null,
          color: item.color
            ? {
                name: item.color.name,
                value: item.color.value,
              }
            : null,
          size: item.size
            ? {
                name: item.size.name,
                value: item.size.value,
              }
            : null,
        })),
        firstItemImage,
      };
    });

    return {
      success: true,
      orders: formattedOrders,
    };
  } catch (error) {
    console.error('获取未支付订单失败:', error);
    return { error: '获取未支付订单失败', success: false, orders: [] };
  }
}

// 为未支付订单创建新的支付会话
export async function createPaymentSession(orderId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '未授权', success: false };
    }

    // 获取订单信息
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
        paymentStatus: 'UNPAID', // 确保只能为未支付订单创建支付会话
      },
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

    if (!order) {
      return { error: '找不到未支付的订单', success: false };
    }

    // 构建行项目
    const lineItems = order.items.map((item) => {
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
          unit_amount: formatAmountForStripe(item.price),
        },
        quantity: item.quantity,
      };
    });

    // 使用绝对URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 创建Stripe结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CN', 'US', 'CA', 'JP', 'SG', 'HK', 'TW', 'MO'],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    // 更新订单的支付意向ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: 'Stripe',
        paymentIntent: checkoutSession.id,
      },
    });

    return {
      success: true,
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    };
  } catch (error) {
    console.error('创建支付会话失败:', error);
    return { error: '创建支付会话失败', success: false };
  }
}

// 更新订单状态
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '未授权', success: false };
    }

    // 将字符串转换为OrderStatus枚举类型
    let orderStatus: OrderStatus;

    switch (status) {
      case 'PENDING':
        orderStatus = OrderStatus.PENDING;
        break;
      case 'PROCESSING':
        orderStatus = OrderStatus.PAID; // 在模型中，PAID对应处理中状态
        break;
      case 'COMPLETED':
        orderStatus = OrderStatus.COMPLETED;
        break;
      case 'CANCELLED':
        orderStatus = OrderStatus.CANCELLED;
        break;
      default:
        return { error: '无效的订单状态', success: false };
    }

    // 查询订单，确保订单存在
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return { error: '找不到订单', success: false };
    }

    // 更新订单状态 - 现在使用枚举类型
    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
    });

    return {
      success: true,
      message: '订单状态已更新',
    };
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return { error: '更新订单状态失败', success: false };
  }
}
