'use client';

import { useCart } from '@/components/shop/cart/cart-context';
import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity, removeItem } = useCart();

  return (
    <div className="flex items-start gap-4 border-b p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.image || '/placeholder.svg?height=80&width=80'}
          alt={item.name}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <Link href={`/products/${item.id}`} className="font-medium hover:underline">
          {item.name}
        </Link>
        <div className="text-sm text-muted-foreground">{formatPrice(item.price)} each</div>

        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>

          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => removeItem(item.id)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
      </div>

      <div className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</div>
    </div>
  );
}
