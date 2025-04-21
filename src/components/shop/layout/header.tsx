'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import { CartSheet } from '@/components/shop/cart/cart-sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { DropDown } from '../DropDown';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Categories', href: '/categories' },

  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6">
                <Link href="/" className="text-xl font-bold text-primary" onClick={() => setIsMenuOpen(false)}>
                  OGKIFY
                </Link>
                <div className="grid gap-4">
                  {navigation.map((item) => (
                    <SheetClose key={item.name} asChild>
                      <Link
                        href={item.href}
                        className={cn('text-lg font-medium', pathname === item.href ? 'text-primary' : '')}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="ml-4 md:ml-0 text-xl font-bold text-primary">
            OGKIFY
          </Link>

          <nav className="hidden md:flex ml-10 gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'font-medium hover:text-primary transition-colors',
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-full max-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" name="q" placeholder="Search..." className="pl-8 w-full" form="search-form" />
            <form id="search-form" action="/search" className="hidden"></form>
          </div>

          <DropDown />

          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />

              <span className="sr-only">Open Cart</span>
            </Button>
          </CartSheet>
        </div>
      </div>
    </header>
  );
}
