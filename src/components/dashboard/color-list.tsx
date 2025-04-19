'use client';

import { useState } from 'react';
import { deleteColor } from '@/actions/colors';
import { toast } from 'sonner';
import { ColorCard } from './color-card';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Color = {
  id: string;
  name: string;
  value: string;
};

interface ColorListProps {
  initialColors: Color[];
}

export function ColorList({ initialColors }: ColorListProps) {
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColors = colors.filter(
    (color) =>
      color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDelete(id: string) {
    try {
      const result = await deleteColor(id);
      if (result.success) {
        toast.success('删除成功');
        setColors(colors.filter((c) => c.id !== id));
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
            placeholder="搜索颜色..."
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
          <Link href="/dashboard/colors/new">
            <Plus className="mr-2 h-4 w-4" />
            添加颜色
          </Link>
        </Button>
      </div>

      {filteredColors.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">未找到颜色</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? '没有与您的搜索条件匹配的颜色。请尝试使用不同的搜索词。'
                : '您尚未添加任何颜色。点击上方按钮添加颜色。'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredColors.map((color) => (
            <ColorCard key={color.id} color={color} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
