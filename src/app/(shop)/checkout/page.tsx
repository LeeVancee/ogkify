'use client';

import { useState } from 'react';
import { useCart } from '@/components/shop/cart/cart-context';
import { CheckoutForm } from '@/components/shop/checkout/checkout-form';
import { CheckoutSummary } from '@/components/shop/checkout/checkout-summary';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, isEmpty, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  if (isEmpty) {
    return (
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-8 text-center text-muted-foreground">
          You need to add items to your cart before checking out.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Success
    toast.success('Order placed successfully!');

    clearCart();
    router.push('/checkout/success');
    setIsSubmitting(false);
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
        <div>
          <CheckoutSummary items={items} />
        </div>
      </div>
    </div>
  );
}
