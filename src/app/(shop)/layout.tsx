import Footer from '@/components/shop/layout/footer';
import Header from '@/components/shop/layout/header';

import React from 'react';
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-screen flex flex-col">
      <Header />
      <main className="flex-1  container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
