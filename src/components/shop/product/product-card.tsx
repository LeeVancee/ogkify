'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

export default function ProductCard({ product }: { product: any }) {
  return (
    <div
      key={product.id}
      className="group border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
    >
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url || '/placeholder.svg?height=300&width=300'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">无图片</span>
          </div>
        )}
      </Link>
      <div className="p-4 bg-muted">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="flex items-center justify-between">
            <p className="font-semibold">{formatPrice(product.price)}</p>
            {product.discount ? (
              <span className="text-xs font-medium text-green-600">{product.discount}% Off</span>
            ) : null}
          </div>
        </Link>
      </div>
    </div>
  );
}
