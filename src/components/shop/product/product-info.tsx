'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductColor {
  id: string;
  name: string;
  value: string;
}

interface ProductSize {
  id: string;
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  images: string[];
  inStock?: boolean;
  freeShipping?: boolean;
}

interface ProductInfoProps {
  product: Product;
  addToCartAction: (formData: FormData) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export function ProductInfo({ product, addToCartAction }: ProductInfoProps) {
  const [quantity, setQuantity] = useState('1');
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0].id : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes.length > 0 ? product.sizes[0].id : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToCart = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('productId', product.id);
    formData.append('quantity', quantity);

    if (selectedColor) {
      formData.append('colorId', selectedColor);
    }

    if (selectedSize) {
      formData.append('sizeId', selectedSize);
    }

    try {
      const result = await addToCartAction(formData);

      if (result.success) {
        toast.success(result.message || `${product.name} 已添加到购物车`);
      } else {
        toast.error(result.error || '添加到购物车失败');
      }
    } catch (error) {
      toast.error('添加到购物车失败');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToWishlist = () => {
    toast.success(`${product.name} 已添加到收藏夹`);
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
      </div>

      <div className="text-3xl font-bold">{formatPrice(product.price)}</div>

      {product.colors.length > 0 && (
        <div className="grid gap-2">
          <div className="font-medium">颜色</div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                className={cn(selectedColor === color.id && 'border-primary')}
                title={color.name}
                onClick={() => setSelectedColor(color.id)}
              >
                {color.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="grid gap-2">
          <div className="font-medium">尺寸</div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <Button
                key={size.id}
                variant="outline"
                className={cn(selectedSize === size.id && 'border-primary')}
                onClick={() => setSelectedSize(size.id)}
              >
                {size.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <div className="font-medium">数量</div>
        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="数量" />
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
        <Button size="lg" className="sm:flex-1" onClick={handleAddToCart} disabled={isSubmitting}>
          {isSubmitting ? (
            '添加中...'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              加入购物车
            </>
          )}
        </Button>
        <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
          <Heart className="mr-2 h-5 w-5" />
          收藏
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {product.inStock ? <span className="text-green-600">有库存</span> : <span className="text-red-600">缺货</span>}
        {product.freeShipping && <span className="ml-4">免运费</span>}
      </div>
    </div>
  );
}
