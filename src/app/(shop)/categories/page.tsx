import { getFilteredProducts } from '@/actions/get-filtered-products';
import { ProductGrid } from '@/components/shop/product/product-grid';
import { ProductPagination } from '@/components/shop/product/product-pagination';
import { ProductSort } from '@/components/shop/product/product-sort';
import { ProductsLoading } from '@/components/shop/product/products-loading';
import React, { Suspense } from 'react';

// 确保此页面是服务器组件
export const dynamic = 'force-dynamic';

export default async function CategoriesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // 解析搜索参数 - 直接使用名称作为参数
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const featured = searchParams.featured === 'true';

  // 价格范围
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;

  // 颜色和尺寸 - 直接使用名称而不是ID
  const colors = Array.isArray(searchParams.color)
    ? searchParams.color
    : typeof searchParams.color === 'string'
    ? [searchParams.color]
    : [];

  const sizes = Array.isArray(searchParams.size)
    ? searchParams.size
    : typeof searchParams.size === 'string'
    ? [searchParams.size]
    : [];

  // 分页
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

  // 获取过滤后的产品数据 - 所有参数都使用名称而不是ID
  const { products, total } = await getFilteredProducts({
    category,
    sort,
    search,
    featured,
    minPrice,
    maxPrice,
    colors,
    sizes,
    page,
    limit: 12,
  });

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Total {total} products</p>
          <Suspense fallback={<div className="w-[180px] h-9 animate-pulse bg-muted rounded-md" />}>
            <ProductSort />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<ProductsLoading />}>
        {products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <h3 className="text-lg font-semibold">No Products Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No products matching your current filter criteria were found. Please try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <ProductGrid products={products} />
            <ProductPagination currentPage={page} totalPages={Math.ceil(total / 12)} />
          </>
        )}
      </Suspense>
    </div>
  );
}
