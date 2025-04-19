'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { updateCartItemQuantity, removeFromCart } from '@/actions/cart';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    colorId?: string | null;
    colorName?: string | null;
    colorValue?: string | null;
    sizeId?: string | null;
    sizeName?: string | null;
    sizeValue?: string | null;
  };
}

export function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === quantity || newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);
    try {
      const result = await updateCartItemQuantity(item.id, newQuantity);
      if (result.success) {
        setQuantity(newQuantity);
        // 无需显示成功消息，避免频繁提示打扰用户
      } else {
        toast.error(result.error || '更新数量失败');
        setQuantity(item.quantity); // 恢复原有数量
      }
    } catch (error) {
      toast.error('更新数量失败');
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      const result = await removeFromCart(item.id);
      if (result.success) {
        toast.success('商品已从购物车中移除');
        // 刷新页面以反映更改
        window.location.reload();
      } else {
        toast.error(result.error || '移除商品失败');
      }
    } catch (error) {
      toast.error('移除商品失败');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="grid grid-cols-[80px_1fr] gap-4 border-b p-4 last:border-0 sm:grid-cols-[100px_1fr] md:grid-cols-[120px_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Link href={`/products/${item.productId}`}>
          <Image
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 80px, 120px"
            className="object-cover"
          />
        </Link>
      </div>
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
              {item.name}
            </Link>

            {/* 显示颜色和尺寸信息 */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {item.colorName} / {item.sizeName}
            </p>
            {/*   <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {item.colorName && (
                <div className="flex items-center gap-1">
                  <span>颜色:</span>
                  <div className="flex items-center gap-1">
                    {item.colorValue && (
                      <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: item.colorValue }} />
                    )}
                    <span>{item.colorName}</span>
                  </div>
                </div>
              )}

              {item.sizeName && (
                <div className="flex items-center gap-1">
                  <span>{item.sizeName}</span>
                </div>
              )}
            </div> */}
          </div>
          <div className="font-medium">{formatPrice(item.price)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
            >
              <MinusIcon className="h-3 w-3" />
              <span className="sr-only">减少数量</span>
            </Button>
            <div className="w-8 text-center">{quantity}</div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
            >
              <PlusIcon className="h-3 w-3" />
              <span className="sr-only">增加数量</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
            <span className="sr-only">移除</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
