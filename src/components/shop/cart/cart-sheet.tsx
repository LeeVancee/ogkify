'use client';

import type React from 'react';

import { useCart } from '@/components/shop/cart/cart-context';
import { CartItem } from '@/components/shop/cart/cart-item';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, totalItems, totalPrice, isEmpty } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Your Cart ({totalItems})</SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-medium">Your cart is empty</div>
            <p className="text-center text-sm text-muted-foreground">Add items to your cart to see them here.</p>
            <SheetTrigger asChild>
              <Button asChild className="mt-4">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <SheetFooter className="flex flex-col gap-2 sm:flex-row">
                <SheetTrigger asChild>
                  <Button variant="outline" className="">
                    Continue Shopping
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button asChild className="">
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
