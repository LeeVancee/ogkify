'use client';
import { useState } from 'react';
import { Product, Image as PrismaImage, Color, Size } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ProductWithRelations = Product & {
  category: { name: string };
  images: PrismaImage[];
  colors: Color[];
  sizes: Size[];
};

interface ProductsViewProps {
  products: ProductWithRelations[];
}

export function ProductsView({ products }: ProductsViewProps) {
  const [productsState, setProductsState] = useState(products);

  // 处理删除商品
  const handleDelete = (id: string) => {
    // 这里可以添加删除逻辑，比如调用API
    setProductsState(productsState.filter((product) => product.id !== id));
  };

  if (!productsState || productsState.length === 0) {
    return (
      <div className="flex h-full items-center justify-center min-h-[200px]">
        <div className="text-center bg-muted/30 rounded-lg p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-muted-foreground">暂无商品</h2>
          <p className="text-muted-foreground text-sm">点击"添加商品"按钮创建您的第一个商品。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {productsState.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md w-full"
        >
          <div className="relative aspect-square group overflow-hidden">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <p className="text-xs text-muted-foreground">无图片</p>
              </div>
            )}
            <div className="absolute right-1.5 top-1.5 flex gap-1 z-10">
              {product.isFeatured && (
                <Badge variant="secondary" className="bg-white/90 text-[0.65rem] px-1.5 py-0.5 shadow-sm">
                  精选
                </Badge>
              )}
              {product.isArchived && (
                <Badge variant="destructive" className="bg-white/90 text-[0.65rem] px-1.5 py-0.5 shadow-sm">
                  已归档
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-2.5 flex-grow">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 mr-2">
                <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{product.category.name}</p>
              </div>
              <p className="text-sm font-bold text-primary whitespace-nowrap">¥{product.price.toFixed(2)}</p>
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">{product.description}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {product.colors.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs font-medium text-muted-foreground mr-1.5">颜色:</span>
                  <div className="flex flex-wrap gap-1">
                    {product.colors.map((color) => (
                      <div
                        key={color.id}
                        className="h-3.5 w-3.5 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs font-medium text-muted-foreground mr-1.5">尺寸:</span>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((size) => (
                      <Badge
                        key={size.id}
                        variant="outline"
                        className="text-[0.6rem] px-1.5 py-0 h-4.5 shadow-sm hover:bg-secondary/50 transition-colors"
                      >
                        {size.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-between p-1.5 bg-muted/5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-xs hover:bg-secondary/50 transition-colors"
              asChild
            >
              <Link href={`/dashboard/products/${product.id}`} className="flex items-center">
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                编辑
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => handleDelete(product.id)}
            >
              <Trash className="mr-1.5 h-3.5 w-3.5" />
              删除
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
