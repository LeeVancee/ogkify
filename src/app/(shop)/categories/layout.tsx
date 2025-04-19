import { getCategories } from '@/actions/categories';
import { getColors } from '@/actions/colors';
import { getSizes } from '@/actions/sizes';
import { ProductFilters } from '@/components/shop/product/product-filters';
import React from 'react';

export default async function CategoriesLayout({ children }: { children: React.ReactNode }) {
  // 获取所有分类、颜色和尺寸数据用于筛选器
  const categories = await getCategories();
  const allColors = await getColors();
  const allSizes = await getSizes();

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 min-h-[800px] gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-8 h-fit">
          <ProductFilters categories={categories} colors={allColors} sizes={allSizes} maxPrice={5000} />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
