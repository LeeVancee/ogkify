'use client';

import Link from 'next/link';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: { id: string; name: string };
  colors: Array<{ id: string; name: string; value: string }>;
  sizes: Array<{ id: string; name: string; value: string }>;
  images: string[];
}

interface ProductCardProps {
  product: Product;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
          </div>
          <div className="text-right">
            <div className="font-medium">￥{product.price}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="mb-1 text-xs font-medium">颜色</p>
            <div className="flex flex-wrap gap-1">
              {product.colors.map((color) => (
                <div
                  key={color.id}
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium">尺寸</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <Badge key={size.id} variant="outline" className="text-xs">
                  {size.value}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/products/${product.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            详情
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">更多选项</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/${product.id}`} className="flex w-full cursor-pointer items-center">
                <Edit className="mr-2 h-4 w-4" />
                详情
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(product.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
