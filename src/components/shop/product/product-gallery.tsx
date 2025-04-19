'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0] || '/placeholder.svg');

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-lg border bg-muted">
        <div className="relative aspect-square">
          <Image
            src={mainImage}
            alt="Product image"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                'relative h-20 w-20 overflow-hidden rounded-lg border bg-muted',
                mainImage === image && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => setMainImage(image)}
            >
              <Image src={image} alt={`Product image ${index + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
