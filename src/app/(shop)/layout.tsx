import Footer from '@/components/shop/layout/footer';
import Header from '@/components/shop/layout/header';

import React from 'react';
import Container from '../container';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-screen">
      <Header />
      <Container>
        <main className="flex-1">{children}</main>
      </Container>
      <Footer />
    </div>
  );
}
