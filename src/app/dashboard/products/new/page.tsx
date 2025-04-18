import { ProductForm } from '../../../../components/product-form';
import { getCategories, getColors, getSizes } from '@/actions/product';

export default async function NewProductPage() {
  const [categories, colors, sizes] = await Promise.all([getCategories(), getColors(), getSizes()]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
      </div>
      <div className="rounded-xl border p-6">
        <ProductForm categories={categories} colors={colors} sizes={sizes} />
      </div>
    </div>
  );
}
