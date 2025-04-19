'use client';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    async function handleCancelledOrder() {
      if (!orderId) {
        setIsProcessing(false);
        return;
      }

      try {
        // 这里可以实现一个用于处理取消订单的 API 调用
        // 例如将订单状态改为已取消
        const delay = new Promise((resolve) => setTimeout(resolve, 1000));
        await delay;

        setIsProcessing(false);
      } catch (error) {
        console.error('处理取消的订单失败:', error);
        setIsProcessing(false);
      }
    }

    handleCancelledOrder();
  }, [orderId]);

  if (isProcessing) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <h1 className="mb-2 text-2xl font-bold">正在处理...</h1>
        <p className="text-center text-muted-foreground">请稍候，我们正在处理您的请求。</p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center py-16">
      <XCircle className="mb-4 h-16 w-16 text-red-500" />
      <h1 className="mb-2 text-2xl font-bold">支付已取消</h1>
      <p className="mb-8 text-center text-muted-foreground">
        您的支付已被取消。您的购物车内容仍然保留，您可以随时继续结账。
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/cart">返回购物车</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">继续购物</Link>
        </Button>
      </div>
    </div>
  );
}
