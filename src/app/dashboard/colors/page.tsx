import type React from 'react';
import { getColors } from '@/actions/colors';
import { ColorForm } from '@/components/dashboard/color/color-form';
import { ColorList } from '@/components/dashboard/color/color-list';

export default async function ColorsPage() {
  const colors = await getColors();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Colors</h1>
      </div>
      <div className="grid gap-6">
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Colors List</h2>
          <ColorList initialColors={colors} />
        </div>
      </div>
    </div>
  );
}
