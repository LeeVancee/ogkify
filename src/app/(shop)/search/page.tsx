import { ProductGrid } from '@/components/shop/product/product-grid';
import { getProducts } from '@/lib/products';
import { SearchForm } from '@/components/shop/search/search-form';
import { Suspense } from 'react';
import { ProductsLoading } from '@/components/shop/product/products-loading';

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;
  const query = typeof q === 'string' ? q : '';

  const products = query ? await getProducts({ search: query }) : [];

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <SearchForm defaultValue={query} />
      </div>

      {query ? (
        <>
          <h1 className="mb-4 text-2xl font-bold">
            Search results for: <span className="font-normal text-muted-foreground">{query}</span>
          </h1>
          <p className="mb-8 text-muted-foreground">
            {products.length} product{products.length === 1 ? '' : 's'} found
          </p>
          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid products={products} />
          </Suspense>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="mb-4 text-2xl font-bold">Search for products</h1>
          <p className="mb-8 text-center text-muted-foreground max-w-md">
            Enter a search term above to find products in our store.
          </p>
        </div>
      )}
    </div>
  );
}
