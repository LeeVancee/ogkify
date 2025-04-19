import { CategoryForm } from '@/components/dashboard/category-form';
import React from 'react';

export default function page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">分类管理</h1>
      </div>
      <div className="grid gap-6">
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">添加新分类</h2>
          <CategoryForm />
        </div>
      </div>
    </div>
  );
}
