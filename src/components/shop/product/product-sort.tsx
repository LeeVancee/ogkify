'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Suspense } from 'react';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

function ProductSortContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  // 创建查询参数字符串，保留现有参数
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }

    return newSearchParams.toString();
  };

  const handleSortChange = (value: string) => {
    // 更新URL，不重新加载页面
    router.push(`/categories?${createQueryString({ sort: value })}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort-select" className="text-sm font-medium">
        Sort by:
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-select" className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProductSort() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-select" className="text-sm font-medium">
            Sort by:
          </Label>
          <div className="w-[180px] h-9 rounded-md border bg-background px-3 py-2 animate-pulse">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      }
    >
      <ProductSortContent />
    </Suspense>
  );
}
