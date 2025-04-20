'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { CartSheet } from '@/components/shop/cart/cart-sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropDown } from '../DropDown';
import { getUserCart } from '@/actions/cart';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 获取购物车数据
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const { totalItems } = await getUserCart();
        setCartItemCount(totalItems);
      } catch (error) {
        console.error('获取购物车数据失败:', error);
      }
    };

    fetchCartData();

    // 添加事件监听器，当页面获得焦点时刷新购物车数据
    const handleFocus = () => {
      fetchCartData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between max-w-7xl mx-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-lg font-medium transition-colors hover:text-primary',
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">OGKIFY</span>
        </Link>

        <nav className="hidden md:flex md:gap-6 lg:gap-10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {isSearchOpen ? (
            <form action="/search" className="flex items-center" onSubmit={() => setIsSearchOpen(false)}>
              <Input
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full md:w-[200px] lg:w-[300px]"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <DropDown />

          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Open Cart</span>
            </Button>
          </CartSheet>
        </div>
      </div>
    </header>
  );
}
