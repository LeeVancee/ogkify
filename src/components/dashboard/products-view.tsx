'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Grid, List, Search, X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteProductDialog } from './delete-product-dialog';
import { ProductCard } from './product-card';

// 定义产品类型
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: { id: string; name: string };
  colors: Array<{ id: string; name: string; value: string }>;
  sizes: Array<{ id: string; name: string; value: string }>;
  images: Array<{ id: string; url: string }>;
  isFeatured: boolean;
  isArchived: boolean;
}

interface ProductsViewProps {
  products: Product[];
}

export function ProductsView({ products: initialProducts }: ProductsViewProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'table' | 'grid'>('table');

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索商品..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">清除搜索</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue={viewType} onValueChange={(value) => setViewType(value as 'table' | 'grid')}>
            <TabsList>
              <TabsTrigger value="table">
                <List className="mr-2 h-4 w-4" />
                表格
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid className="mr-2 h-4 w-4" />
                网格
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">未找到商品</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? '没有与您的搜索条件匹配的商品。请尝试使用不同的搜索词。'
                : '您尚未添加任何商品。点击下方按钮添加商品。'}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  添加商品
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : viewType === 'table' ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>图片</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="hidden md:table-cell">分类</TableHead>
                <TableHead className="hidden md:table-cell">价格</TableHead>
                <TableHead className="hidden lg:table-cell">颜色</TableHead>
                <TableHead className="hidden lg:table-cell">尺寸</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 overflow-hidden rounded-md border">
                      <img
                        src={product.images[0]?.url || '/placeholder.svg'}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="hidden text-sm text-muted-foreground sm:block">
                      {truncateText(product.description, 50)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.category.name}</TableCell>
                  <TableCell className="hidden md:table-cell">￥{product.price}</TableCell>
                  <TableCell className="hidden lg:table-cell">
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
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((size) => (
                        <Badge key={size.id} variant="outline" className="text-xs">
                          {size.value}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">编辑</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">删除</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                category: product.category,
                colors: product.colors,
                sizes: product.sizes,
                images: product.images.map((img) => img.url),
              }}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteProductDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} productId={productToDelete} />
    </div>
  );
}
