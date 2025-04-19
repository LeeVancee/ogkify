import type React from 'react';
import { getSizes } from '@/actions/sizes';
import { SizeForm } from '../../../components/dashboard/size-form';
import { SizeList } from '../../../components/dashboard/size-list';

export default async function SizesPage() {
  const sizes = await getSizes();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">尺码管理</h1>
      </div>
      <div className="grid gap-6">
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">尺码列表</h2>
          <SizeList initialSizes={sizes} />
        </div>
      </div>
    </div>
  );
}
