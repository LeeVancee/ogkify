'use client';

import { ProductGrid } from '@/components/shop/product/product-grid';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface FeaturedProductsProps {
  initialProducts: Product[];
  title?: string;
  description?: string;
}

export function FeaturedProducts({
  initialProducts,
  title = '特色商品',
  description = '探索我们精心挑选的优质商品',
}: FeaturedProductsProps) {
  const [products] = useState(initialProducts);

  return (
    <section className="container px-4 md:px-6">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <Button variant="link" asChild className="hidden md:flex items-center gap-1">
            <Link href="/categories?featured=true">
              浏览全部特色商品
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={products} />
        <div className="flex justify-center md:hidden">
          <Button asChild variant="outline">
            <Link href="/categories?featured=true">浏览更多商品</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
