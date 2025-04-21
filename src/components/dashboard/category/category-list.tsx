'use client';

import { useState } from 'react';
import { deleteCategory } from '@/actions/categories';
import { toast } from 'sonner';
import { CategoryCard } from './category-card';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

interface CategoryListProps {
  initialCategories: Category[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.imageUrl?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDelete(id: string) {
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success('Category deleted successfully');
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for categories..."
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
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? 'No categories match your search criteria. Please try using different search terms.'
                : 'You have not added any categories yet. Click the button above to add a category.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
