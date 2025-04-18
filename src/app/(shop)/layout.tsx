import { CartProvider } from '@/components/shop/cart/cart-context';
import Footer from '@/components/shop/layout/footer';
import Header from '@/components/shop/layout/header';
import React from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
