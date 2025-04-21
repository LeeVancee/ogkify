import { getProduct, getRelatedProducts } from '@/actions/product-shop';
import { ProductInfo } from '@/components/shop/product/product-info';
import { ProductTabs } from '@/components/shop/product/product-tabs';
import { ProductGrid } from '@/components/shop/product/product-grid';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { handleAddToCartFormAction } from '@/actions/cart';

// 为ProductGrid组件的产品类型
interface SimpleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  discount?: number;
  freeShipping?: boolean;
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // 获取相关商品
  const relatedProducts = await getRelatedProducts(product.id, product.categoryId);

  // 添加缺少的字段以匹配 SimpleProduct 类型
  const formattedRelatedProducts: SimpleProduct[] = relatedProducts.map((p) => ({
    ...p,
    category: '',
    inStock: true,
    rating: 5,
    reviews: 0,
    discount: 0,
  }));

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <ProductInfo product={product} addToCartAction={handleAddToCartFormAction} />
      </div>
      <ProductTabs product={product} />

      {formattedRelatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">相关商品</h2>
          <ProductGrid products={formattedRelatedProducts} />
        </div>
      )}
    </div>
  );
}
