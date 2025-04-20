import { getColor } from '@/actions/colors';
import { ColorEditForm } from '@/components/dashboard/color/color-edit-form';
import { notFound } from 'next/navigation';

interface ColorEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ColorEditPage(props: ColorEditPageProps) {
  const params = await props.params;
  const { id } = params;
  const response = await getColor(id);

  if (!response.success || !response.color) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">编辑颜色</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">颜色详情</h2>
            <ColorEditForm color={response.color} />
          </div>
        </div>
      </div>
    </div>
  );
}
