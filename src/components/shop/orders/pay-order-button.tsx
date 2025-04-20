'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPaymentSession } from '@/actions/orders';

interface PayOrderButtonProps {
  orderId: string;
}

export function PayOrderButton({ orderId }: PayOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handlePayment() {
    setIsLoading(true);

    try {
      const result = await createPaymentSession(orderId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment session');
      }

      // 如果成功，重定向到 Stripe 支付页面
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
        return;
      }

      toast.error('Failed to create payment session');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment process failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay Now'
      )}
    </Button>
  );
}
