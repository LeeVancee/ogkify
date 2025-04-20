import { getSize } from '@/actions/sizes';
import { SizeEditForm } from '@/components/dashboard/size/size-edit-form';
import { notFound } from 'next/navigation';

interface SizeEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SizeEditPage(props: SizeEditPageProps) {
  const params = await props.params;
  const { id } = params;
  const response = await getSize(id);

  if (!response.success || !response.size) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">编辑尺寸</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">尺寸详情</h2>
            <SizeEditForm size={response.size} />
          </div>
        </div>
      </div>
    </div>
  );
}
