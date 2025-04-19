'use client';

import { useState } from 'react';
import { deleteSize } from '@/actions/sizes';
import { toast } from 'sonner';
import { SizeCard } from './size-card';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Size = {
  id: string;
  name: string;
  value: string;
};

interface SizeListProps {
  initialSizes: Size[];
}

export function SizeList({ initialSizes }: SizeListProps) {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSizes = sizes.filter(
    (size) =>
      size.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      size.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDelete(id: string) {
    try {
      const result = await deleteSize(id);
      if (result.success) {
        toast.success('删除成功');
        setSizes(sizes.filter((s) => s.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('删除失败');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索尺寸..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">清除搜索</span>
            </Button>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/sizes/new">
            <Plus className="mr-2 h-4 w-4" />
            添加尺寸
          </Link>
        </Button>
      </div>

      {filteredSizes.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">未找到尺寸</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? '没有与您的搜索条件匹配的尺寸。请尝试使用不同的搜索词。'
                : '您尚未添加任何尺寸。点击上方按钮添加尺寸。'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSizes.map((size) => (
            <SizeCard key={size.id} size={size} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
