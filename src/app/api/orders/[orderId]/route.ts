import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/actions/getSession';
import { prisma } from '@/lib/prisma';

// 获取单个订单详情
export async function GET(request: NextRequest, props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    const orderId = params.orderId;

    // 检查用户是否已登录
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 查询订单，确保订单属于当前登录用户
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        shippingAddress: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: '找不到订单' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}
