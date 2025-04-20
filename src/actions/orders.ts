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
      return { success: false, orders: [] };
    }

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

    // 转换为前端友好的格式
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name,
      email: order.user?.email,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      firstItemImage: order.items[0]?.product?.images[0]?.url || null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
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
    }));

    return { success: true, orders: formattedOrders };
  } catch (error) {
    console.error('获取订单失败:', error);
    return { success: false, orders: [] };
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
      return { success: false, orders: [] };
    }

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

    // 使用相同的转换逻辑
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      firstItemImage: order.items[0]?.product?.images[0]?.url || null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
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
    }));

    return { success: true, orders: formattedOrders };
  } catch (error) {
    console.error('获取未支付订单失败:', error);
    return { success: false, orders: [] };
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
          currency: 'usd',
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

export async function getOrdersStats() {
  try {
    // 获取待处理订单数量
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING',
      },
    });

    // 获取已完成订单数量
    const completedOrders = await prisma.order.count({
      where: {
        status: 'COMPLETED',
      },
    });

    // 获取总收入 (仅计算已支付订单)
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
      },
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = paidOrders.reduce((total, order) => total + order.totalAmount, 0);

    return {
      pendingOrders,
      completedOrders,
      totalRevenue,
    };
  } catch (error) {
    console.error('获取订单统计失败:', error);
    return {
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    };
  }
}

export async function getRecentOrders(limit = 5) {
  try {
    const recentOrders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customerName: order.user?.name || 'Guest',
      status: order.status,
      paymentStatus: order.paymentStatus,
      amount: order.totalAmount,
      itemsCount: order.items.length,
    }));
  } catch (error) {
    console.error('获取最近订单失败:', error);
    return [];
  }
}

// 获取月度销售数据
export async function getMonthlySalesData() {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyData = [];

    // 为每个月份获取销售数据
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      let endDate;

      if (month === 11) {
        endDate = new Date(currentYear + 1, 0, 1);
      } else {
        endDate = new Date(currentYear, month + 1, 1);
      }

      // 查询这个月的订单
      const monthlyOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          paymentStatus: 'PAID',
        },
        select: {
          totalAmount: true,
        },
      });

      // 计算月度总收入
      const total = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // 获取月份名称
      const monthName = `${month + 1}月`;

      monthlyData.push({
        name: monthName,
        total: total,
      });
    }

    return monthlyData;
  } catch (error) {
    console.error('获取月度销售数据失败:', error);
    // 返回默认数据
    return [
      { name: '1月', total: 0 },
      { name: '2月', total: 0 },
      { name: '3月', total: 0 },
      { name: '4月', total: 0 },
      { name: '5月', total: 0 },
      { name: '6月', total: 0 },
      { name: '7月', total: 0 },
      { name: '8月', total: 0 },
      { name: '9月', total: 0 },
      { name: '10月', total: 0 },
      { name: '11月', total: 0 },
      { name: '12月', total: 0 },
    ];
  }
}

// 删除未支付订单
export async function deleteUnpaidOrder(orderId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // 获取订单信息，确保它是用户自己的未支付订单
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
        paymentStatus: 'UNPAID',
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found or not eligible for deletion' };
    }

    // 首先删除所有关联的订单项
    await prisma.orderItem.deleteMany({
      where: {
        orderId,
      },
    });

    // 然后删除订单本身
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    console.error('删除订单失败:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}
