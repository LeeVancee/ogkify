'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

// 简化的产品类型
export interface SimpleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  discount?: number;
  freeShipping?: boolean;
}

interface ProductGridProps {
  products: SimpleProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group overflow-hidden rounded-lg border bg-background p-3 transition-colors hover:bg-accent/50"
        >
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="font-medium">{product.name}</h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="font-medium">{formatPrice(product.price)}</div>
            {product.discount ? (
              <span className="text-xs font-medium text-green-600">{product.discount}% Discount</span>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
