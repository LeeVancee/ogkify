'use client';

import { useCart } from '@/components/shop/cart/cart-context';
import { CartItem } from '@/components/shop/cart/cart-item';
import { CartSummary } from '@/components/shop/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, isEmpty } = useCart();

  if (isEmpty) {
    return (
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
