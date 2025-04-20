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
          throw new Error('Failed to get order information');
        }

        const data = await response.json();
        setOrderData(data.order);
      } catch (error) {
        console.error('Failed to get order information', error);
        setError(error instanceof Error ? error.message : 'Failed to get order information');
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
        <h1 className="mb-2 text-2xl font-bold">Verifying your order...</h1>
        <p className="text-center text-muted-foreground">Please wait, we are processing your payment.</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h1 className="mb-4 text-2xl font-bold">Failed to get order information</h1>
        <p className="mb-8 text-center text-muted-foreground">
          {error ||
            'Failed to get order details, but your payment may have been processed. Please check your email or contact customer support.'}
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container flex flex-col items-center justify-center py-16">
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-2xl font-bold">Order confirmed</h1>
        <p className="mb-6 text-center text-muted-foreground">
          Thank you for your purchase! Your order has been successfully processed.
        </p>

        <div className="mb-8 w-full max-w-md rounded-lg border bg-card p-6">
          <div className="mb-4">
            <p className="mb-1 text-sm text-muted-foreground">Order Number:</p>
            <p className="text-xl font-semibold">{orderData.orderNumber}</p>
          </div>

          {orderData.shippingAddress && (
            <div className="mb-4">
              <p className="mb-1 text-sm text-muted-foreground">Shipping Address:</p>
              <p className="text-sm">{orderData.shippingAddress}</p>
            </div>
          )}

          {orderData.phone && (
            <div className="mb-4">
              <p className="mb-1 text-sm text-muted-foreground">Phone:</p>
              <p className="text-sm">{orderData.phone}</p>
            </div>
          )}

          <div>
            <p className="mb-1 text-sm text-muted-foreground">Order Status:</p>
            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Paid
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/myorders">View My Orders</Link>
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
          <h1 className="mb-2 text-2xl font-bold">Loading...</h1>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
