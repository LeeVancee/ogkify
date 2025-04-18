import { getProduct, getRelatedProducts } from '@/lib/products';
import { ProductGallery } from '@/components/shop/product/product-gallery';
import { ProductInfo } from '@/components/shop/product/product-info';
import { ProductTabs } from '@/components/shop/product/product-tabs';
import { ProductGrid } from '@/components/shop/product/product-grid';
import { notFound } from 'next/navigation';

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category);

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} />
        <ProductInfo product={product} />
      </div>
      <ProductTabs product={product} />

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
