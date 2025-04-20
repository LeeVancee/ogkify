'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { CartItem } from '@/components/shop/cart/cart-item';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getUserCart } from '@/actions/cart';

interface CartItemType {
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
}

export function CartSheet({ children }: { children: React.ReactNode }) {
  const [cartData, setCartData] = useState<{
    items: CartItemType[];
    totalItems: number;
  }>({ items: [], totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // 当侧边栏打开时获取最新的购物车数据
  useEffect(() => {
    if (isOpen) {
      fetchCartData();
    }
  }, [isOpen]);

  const fetchCartData = async () => {
    setIsLoading(true);
    try {
      const data = await getUserCart();
      setCartData(data);
    } catch (error) {
      console.error('获取购物车数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 计算总价
  const subtotal = cartData.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const isEmpty = cartData.items.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>{isLoading ? '加载中...' : `购物车 (${cartData.totalItems})`}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-center text-sm text-muted-foreground">正在加载购物车...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-medium">购物车是空的</div>
            <p className="text-center text-sm text-muted-foreground">添加商品到购物车以在此处查看。</p>
            <SheetTrigger asChild>
              <Button asChild className="mt-4">
                <Link href="/products">继续购物</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {cartData.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">商品小计</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between font-medium">
                  <span>总计</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <SheetFooter className="flex flex-col gap-2 sm:flex-row">
                <SheetTrigger asChild>
                  <Button variant="outline">继续购物</Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button asChild>
                    <Link href="/cart">查看购物车</Link>
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
