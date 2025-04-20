'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// 订单类型定义
interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string | null;
  phone: string | null;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId || !orderId) {
        setIsVerifying(false);
        return;
      }

      try {
        // 等待一小段时间，以确保 webhook 处理完成
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 从服务器获取订单信息
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error('无法获取订单信息');
        }

        const data = await response.json();
        setOrderData(data.order);
      } catch (error) {
        console.error('验证支付失败:', error);
        setError(error instanceof Error ? error.message : '获取订单信息失败');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyPayment();
  }, [sessionId, orderId]);

  if (isVerifying) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
        <h1 className="mb-2 text-2xl font-bold">正在确认您的订单...</h1>
        <p className="text-center text-muted-foreground">请稍候，我们正在处理您的支付。</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h1 className="mb-4 text-2xl font-bold">获取订单信息失败</h1>
        <p className="mb-8 text-center text-muted-foreground">
          {error || '无法获取订单详情，但您的支付可能已经处理。请查看您的邮箱或联系客服。'}
        </p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container flex flex-col items-center justify-center py-16">
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-2xl font-bold">订单确认</h1>
        <p className="mb-6 text-center text-muted-foreground">感谢您的购买！您的订单已成功处理。</p>

        <div className="mb-8 w-full max-w-md rounded-lg border bg-card p-6">
          <div className="mb-4">
            <p className="mb-1 text-sm text-muted-foreground">订单号:</p>
            <p className="text-xl font-semibold">{orderData.orderNumber}</p>
          </div>

          {orderData.shippingAddress && (
            <div className="mb-4">
              <p className="mb-1 text-sm text-muted-foreground">送货地址:</p>
              <p className="text-sm">{orderData.shippingAddress}</p>
            </div>
          )}

          {orderData.phone && (
            <div className="mb-4">
              <p className="mb-1 text-sm text-muted-foreground">联系电话:</p>
              <p className="text-sm">{orderData.phone}</p>
            </div>
          )}

          <div>
            <p className="mb-1 text-sm text-muted-foreground">订单状态:</p>
            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              已支付
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/products">继续购物</Link>
          </Button>
          <Button asChild>
            <Link href="/myorders">查看我的订单</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
          <h1 className="mb-2 text-2xl font-bold">正在加载...</h1>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
