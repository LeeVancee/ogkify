'use client';

import { useState } from 'react';
import { useCart } from '@/components/shop/cart/cart-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState('1');
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg?height=100&width=100',
      quantity: Number.parseInt(quantity, 10),
    });

    toast.success(`${product.name} (${quantity}) has been added to your cart.`);
  };

  const handleAddToWishlist = () => {
    toast.success(`${product.name} has been added to your wishlist.`);
  };

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < product.rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
        </div>
      </div>

      <div className="text-3xl font-bold">{formatPrice(product.price)}</div>

      {product.discount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(product.price / (1 - product.discount / 100))}
          </span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
            {product.discount}% OFF
          </span>
        </div>
      )}

      <div className="grid gap-2">
        <div className="font-medium">Description</div>
        <p className="text-muted-foreground">{product.description}</p>
      </div>

      {product.options && product.options.length > 0 && (
        <div className="grid gap-4">
          {product.options.map((option) => (
            <div key={option.name} className="grid gap-2">
              <div className="font-medium">{option.name}</div>
              <Select defaultValue={option.values[0]}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${option.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {option.values.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2">
        <div className="font-medium">Quantity</div>
        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Quantity" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }).map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="sm:flex-1" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
        <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
          <Heart className="mr-2 h-5 w-5" />
          Add to Wishlist
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {product.inStock ? (
          <span className="text-green-600">In Stock</span>
        ) : (
          <span className="text-red-600">Out of Stock</span>
        )}
        {product.freeShipping && <span className="ml-4">Free Shipping</span>}
      </div>
    </div>
  );
}
