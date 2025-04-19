import { ProductGrid } from '@/components/shop/product/product-grid';
import { ProductFilters } from '@/components/shop/product/product-filters';
import { ProductSort } from '@/components/shop/product/product-sort';

import { Suspense } from 'react';
import { ProductsLoading } from '@/components/shop/product/products-loading';
import { getCategories } from '@/actions/categories';
import { getFilteredProducts } from '@/actions/get-filtered-products';
import { getColors } from '@/actions/colors';
import { getSizes } from '@/actions/sizes';
import { ProductPagination } from '@/components/shop/product/product-pagination';

export default async function ProductsPage(props: {
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

  // 获取所有分类、颜色和尺寸数据用于筛选器
  const categories = await getCategories();
  const allColors = await getColors();
  const allSizes = await getSizes();

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid min-h-[800px]  grid-cols-1 gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="h-full">
          <ProductFilters
            categories={categories}
            colors={allColors}
            sizes={allSizes}
            maxPrice={5000} // 设置最大价格筛选范围
          />
        </div>
        <div className="flex h-full flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">所有商品</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">总共 {total} 件产品</p>
              <ProductSort />
            </div>
          </div>
          <Suspense fallback={<ProductsLoading />}>
            {products.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-12">
                <h3 className="text-lg font-semibold">未找到商品</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  没有找到符合当前筛选条件的商品，请尝试调整筛选条件。
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
      </div>
    </div>
  );
}
