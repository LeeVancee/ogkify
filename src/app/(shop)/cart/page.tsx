import { getUserCart } from '@/actions/cart';
import { CartItem } from '@/components/shop/cart/cart-item';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { CheckoutButton } from '@/components/shop/cart/checkout-button';

export default async function CartPage() {
  const { items, totalItems } = await getUserCart();
  const isEmpty = items.length === 0;

  // 计算总价
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (isEmpty) {
    return (
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Button asChild>
          <Link href="/categories">Browse Products</Link>
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
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="my-4 border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <CheckoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
