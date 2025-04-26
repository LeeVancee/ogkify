'use server';

import { db } from '@/db';
import { orders, orderItems, products, user, colors, sizes, images } from '@/db/schema';
import { getSession } from './getSession';
import { formatPrice } from '@/lib/utils';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { eq, desc, and, gte, lt } from 'drizzle-orm';

// 获取用户所有订单
export async function getUserOrders() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, orders: [] };
    }

    // 获取用户订单
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt));

    // 格式化订单以及获取关联数据
    const formattedOrders = await Promise.all(
      userOrders.map(async (order) => {
        // 获取订单项
        const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

        // 获取用户信息
        const userData = await db.select().from(user).where(eq(user.id, order.userId)).limit(1);

        // 获取订单项的详细信息
        const itemsWithDetails = await Promise.all(
          orderItemsData.map(async (item) => {
            // 获取产品信息
            const productData = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);

            if (!productData.length) {
              return null;
            }

            // 获取产品图片
            const productImages = await db
              .select({
                url: images.url,
              })
              .from(images)
              .where(eq(images.productId, item.productId));

            // 获取颜色信息
            let colorData = null;
            if (item.colorId) {
              const colorResult = await db.select().from(colors).where(eq(colors.id, item.colorId)).limit(1);

              if (colorResult.length) {
                colorData = colorResult[0];
              }
            }

            // 获取尺寸信息
            let sizeData = null;
            if (item.sizeId) {
              const sizeResult = await db.select().from(sizes).where(eq(sizes.id, item.sizeId)).limit(1);

              if (sizeResult.length) {
                sizeData = sizeResult[0];
              }
            }

            return {
              id: item.id,
              productId: item.productId,
              productName: productData[0]?.name,
              quantity: item.quantity,
              price: item.price,
              imageUrl: productImages[0]?.url || null,
              color: colorData
                ? {
                    name: colorData.name,
                    value: colorData.value,
                  }
                : null,
              size: sizeData
                ? {
                    name: sizeData.name,
                    value: sizeData.value,
                  }
                : null,
            };
          })
        );

        // 过滤掉空值
        const validItems = itemsWithDetails.filter(Boolean) as {
          id: string;
          productId: string;
          productName: string | undefined;
          quantity: number;
          price: number;
          imageUrl: string | null;
          color: { name: string; value: string } | null;
          size: { name: string; value: string } | null;
        }[];

        // 获取第一个商品图片（如果有）
        const firstItemImage = validItems.length > 0 && validItems[0] ? validItems[0].imageUrl : null;

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: userData[0]?.name,
          email: userData[0]?.email,
          createdAt: order.createdAt.toISOString(),
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
          firstItemImage,
          items: validItems,
        };
      })
    );

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
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
      .limit(1);

    if (!orderResult.length) {
      return { error: '找不到订单', success: false };
    }

    const order = orderResult[0];

    // 获取订单项
    const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // 获取每个订单项的详细信息
    const formattedItems = await Promise.all(
      orderItemsData.map(async (item) => {
        // 获取产品信息
        const productData = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);

        if (!productData.length) {
          return null;
        }

        // 获取产品图片
        const productImages = await db
          .select({
            url: images.url,
          })
          .from(images)
          .where(eq(images.productId, item.productId));

        // 获取颜色信息
        let colorData = null;
        if (item.colorId) {
          const colorResult = await db.select().from(colors).where(eq(colors.id, item.colorId)).limit(1);

          if (colorResult.length) {
            colorData = colorResult[0];
          }
        }

        // 获取尺寸信息
        let sizeData = null;
        if (item.sizeId) {
          const sizeResult = await db.select().from(sizes).where(eq(sizes.id, item.sizeId)).limit(1);

          if (sizeResult.length) {
            sizeData = sizeResult[0];
          }
        }

        return {
          id: item.id,
          productId: item.productId,
          productName: productData[0].name,
          productDescription: productData[0].description,
          quantity: item.quantity,
          price: item.price,
          priceFormatted: formatPrice(item.price),
          totalPrice: item.price * item.quantity,
          totalPriceFormatted: formatPrice(item.price * item.quantity),
          imageUrl: productImages[0]?.url || null,
          color: colorData
            ? {
                name: colorData.name,
                value: colorData.value,
              }
            : null,
          size: sizeData
            ? {
                name: sizeData.name,
                value: sizeData.value,
              }
            : null,
        };
      })
    );

    // 过滤掉空值
    const validItems = formattedItems.filter(Boolean) as {
      id: string;
      productId: string;
      productName: string;
      productDescription: string;
      quantity: number;
      price: number;
      priceFormatted: string;
      totalPrice: number;
      totalPriceFormatted: string;
      imageUrl: string | null;
      color: { name: string; value: string } | null;
      size: { name: string; value: string } | null;
    }[];

    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

    // 格式化订单详情
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
      items: validItems,
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

    // 获取用户未支付订单
    const unpaidOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, session.user.id), eq(orders.paymentStatus, 'UNPAID')))
      .orderBy(desc(orders.createdAt));

    // 格式化订单以及获取关联数据
    const formattedOrders = await Promise.all(
      unpaidOrders.map(async (order) => {
        // 获取订单项
        const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

        // 获取订单项的详细信息
        const itemsWithDetails = await Promise.all(
          orderItemsData.map(async (item) => {
            // 获取产品信息
            const productData = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);

            if (!productData.length) {
              return null;
            }

            // 获取产品图片
            const productImages = await db
              .select({
                url: images.url,
              })
              .from(images)
              .where(eq(images.productId, item.productId));

            // 获取颜色信息
            let colorData = null;
            if (item.colorId) {
              const colorResult = await db.select().from(colors).where(eq(colors.id, item.colorId)).limit(1);

              if (colorResult.length) {
                colorData = colorResult[0];
              }
            }

            // 获取尺寸信息
            let sizeData = null;
            if (item.sizeId) {
              const sizeResult = await db.select().from(sizes).where(eq(sizes.id, item.sizeId)).limit(1);

              if (sizeResult.length) {
                sizeData = sizeResult[0];
              }
            }

            return {
              id: item.id,
              productId: item.productId,
              productName: productData[0]?.name,
              quantity: item.quantity,
              price: item.price,
              imageUrl: productImages[0]?.url || null,
              color: colorData
                ? {
                    name: colorData.name,
                    value: colorData.value,
                  }
                : null,
              size: sizeData
                ? {
                    name: sizeData.name,
                    value: sizeData.value,
                  }
                : null,
            };
          })
        );

        // 过滤掉空值
        const validItems = itemsWithDetails.filter(Boolean);

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt.toISOString(),
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          firstItemImage: validItems.length > 0 && validItems[0] ? validItems[0].imageUrl : null,
          items: validItems,
        };
      })
    );

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
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id), eq(orders.paymentStatus, 'UNPAID')))
      .limit(1);

    if (!orderResult.length) {
      return { error: '找不到未支付的订单', success: false };
    }

    const order = orderResult[0];

    // 获取订单项
    const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // 获取每个订单项的详细信息以构建行项目
    const lineItems = await Promise.all(
      orderItemsData.map(async (item) => {
        // 获取产品信息
        const productData = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);

        // 获取产品图片
        const productImages = await db
          .select({
            url: images.url,
          })
          .from(images)
          .where(eq(images.productId, item.productId));

        // 获取颜色信息
        let colorName = '';
        if (item.colorId) {
          const colorResult = await db.select().from(colors).where(eq(colors.id, item.colorId)).limit(1);

          if (colorResult.length) {
            colorName = colorResult[0].name;
          }
        }

        // 获取尺寸信息
        let sizeName = '';
        if (item.sizeId) {
          const sizeResult = await db.select().from(sizes).where(eq(sizes.id, item.sizeId)).limit(1);

          if (sizeResult.length) {
            sizeName = sizeResult[0].name;
          }
        }

        const productName = productData[0]?.name || 'Unknown Product';
        const variantInfo = [colorName, sizeName].filter(Boolean).join(', ');

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: variantInfo ? `${variantInfo}` : undefined,
              images: productImages.length > 0 ? [productImages[0].url] : undefined,
            },
            unit_amount: formatAmountForStripe(item.price),
          },
          quantity: item.quantity,
        };
      })
    );

    // 使用绝对URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
    await db
      .update(orders)
      .set({
        paymentMethod: 'Stripe',
        paymentIntent: checkoutSession.id,
      })
      .where(eq(orders.id, order.id));

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
    let orderStatus: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
    switch (status) {
      case 'PENDING':
        orderStatus = 'PENDING';
        break;
      case 'PROCESSING':
        orderStatus = 'PAID'; // 在模型中，PAID对应处理中状态
        break;
      case 'COMPLETED':
        orderStatus = 'COMPLETED';
        break;
      case 'CANCELLED':
        orderStatus = 'CANCELLED';
        break;
      default:
        return { error: '无效的订单状态', success: false };
    }

    // 查询订单，确保订单存在
    const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!orderResult.length) {
      return { error: '找不到订单', success: false };
    }

    // 更新订单状态
    await db.update(orders).set({ status: orderStatus }).where(eq(orders.id, orderId));

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
    const pendingOrdersResult = await db.select().from(orders).where(eq(orders.status, 'PENDING'));

    const pendingOrders = pendingOrdersResult.length;

    // 获取已完成订单数量
    const completedOrdersResult = await db.select().from(orders).where(eq(orders.status, 'COMPLETED'));

    const completedOrders = completedOrdersResult.length;

    // 获取已支付订单
    const paidOrdersResult = await db
      .select({
        totalAmount: orders.totalAmount,
      })
      .from(orders)
      .where(eq(orders.paymentStatus, 'PAID'));

    // 计算总收入
    const totalRevenue = paidOrdersResult.reduce((total, order) => total + order.totalAmount, 0);

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
    // 获取最近订单
    const recentOrdersResult = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);

    // 获取订单的详细信息
    const formattedOrders = await Promise.all(
      recentOrdersResult.map(async (order) => {
        // 获取用户信息
        const userData = await db
          .select({
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(eq(user.id, order.userId))
          .limit(1);

        // 获取订单项
        const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          customerName: userData[0]?.name || 'Guest',
          status: order.status,
          paymentStatus: order.paymentStatus,
          amount: order.totalAmount,
          itemsCount: orderItemsData.length,
        };
      })
    );

    return formattedOrders;
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

      // 查询这个月的已支付订单，使用gte和lt来替代sql标签函数
      const monthlyOrdersResult = await db
        .select({
          totalAmount: orders.totalAmount,
        })
        .from(orders)
        .where(and(eq(orders.paymentStatus, 'PAID'), gte(orders.createdAt, startDate), lt(orders.createdAt, endDate)));

      // 计算月度总收入
      const total = monthlyOrdersResult.reduce((sum, order) => sum + order.totalAmount, 0);

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
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id), eq(orders.paymentStatus, 'UNPAID')))
      .limit(1);

    if (!orderResult.length) {
      return { success: false, error: 'Order not found or not eligible for deletion' };
    }

    // 首先删除所有关联的订单项
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));

    // 然后删除订单本身
    await db.delete(orders).where(eq(orders.id, orderId));

    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    console.error('删除订单失败:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}
