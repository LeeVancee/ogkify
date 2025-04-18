import { ProductGrid } from '@/components/shop/product/product-grid';
import { ProductFilters } from '@/components/shop/product/product-filters';
import { getProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import { Suspense } from 'react';
import { ProductsLoading } from '@/components/shop/product/products-loading';

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { category, sort, search } = searchParams;

  // Convert to expected types
  const categoryFilter = typeof category === 'string' ? category : undefined;
  const sortFilter = typeof sort === 'string' ? sort : undefined;
  const searchFilter = typeof search === 'string' ? search : undefined;

  const products = await getProducts({
    category: categoryFilter,
    sort: sortFilter,
    search: searchFilter,
  });

  const categories = await getCategories();

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <div>
          <ProductFilters categories={categories} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} product{products.length === 1 ? '' : 's'}
            </p>
          </div>
          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid products={products} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
