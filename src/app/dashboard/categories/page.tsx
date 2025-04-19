import type React from 'react';
import { getCategories } from '@/actions/categories';
import { CategoryForm } from '../../../components/dashboard/category-form';
import { CategoryList } from '../../../components/dashboard/category-list';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">分类管理</h1>
      </div>
      <div className="grid gap-6">
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">分类列表</h2>
          <CategoryList initialCategories={categories} />
        </div>
      </div>
    </div>
  );
}
