import type React from 'react';
import Link from 'next/link';
import { ProductsView } from '../../../components/products-view';
import { Button } from '@/components/ui/button';

import { Plus } from 'lucide-react';
import { getProducts } from '@/actions/product';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">商品列表</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" /> 添加商品
          </Link>
        </Button>
      </div>
      <ProductsView products={products} />
    </div>
  );
}
