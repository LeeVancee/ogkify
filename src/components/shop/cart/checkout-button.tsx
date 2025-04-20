'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // 如果成功，重定向到 Stripe 支付页面
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }

      toast.error('Failed to create checkout session');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout process failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleCheckout} className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Checkout'
      )}
    </Button>
  );
}
