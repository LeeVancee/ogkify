'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setIsLoading(true);

    try {
      // 调用结账 API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '结账过程中发生错误');
      }

      // 如果成功，重定向到 Stripe 支付页面
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }

      toast.error('无法创建结账会话');
    } catch (error) {
      console.error('结账错误:', error);
      toast.error(error instanceof Error ? error.message : '结账过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleCheckout} className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          处理中...
        </>
      ) : (
        '结算'
      )}
    </Button>
  );
}
