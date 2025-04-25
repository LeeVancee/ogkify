import { notFound } from 'next/navigation';
import { EditProductForm } from '@/components/dashboard/product/edit-product-form';

import { getProduct, getCategories, getColors, getSizes } from '@/actions/products';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [product, categories, colors, sizes] = await Promise.all([
    getProduct(params.id),
    getCategories(),
    getColors(),
    getSizes(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      </div>
      <div className="rounded-xl border p-6">
        <EditProductForm product={product} categories={categories} colors={colors} sizes={sizes} />
      </div>
    </div>
  );
}
