'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
}

function ProductPaginationContent({ currentPage, totalPages }: ProductPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(`/products?${createQueryString({ page: page.toString() })}`);
  };

  // 显示最多5个页码按钮
  const getPageNumbers = () => {
    const pages = [];
    const leftOffset = Math.min(2, currentPage - 1);
    const rightOffset = Math.min(2, totalPages - currentPage);
    const startPage = Math.max(1, currentPage - leftOffset);
    const endPage = Math.min(totalPages, currentPage + rightOffset);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProductPagination(props: ProductPaginationProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-1 mt-8">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            ...
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <ProductPaginationContent {...props} />
    </Suspense>
  );
}
