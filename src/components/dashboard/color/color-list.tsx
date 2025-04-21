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
        toast.success('Color deleted successfully');
        setColors(colors.filter((c) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete color');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for colors..."
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
          <Link href="/dashboard/colors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Color
          </Link>
        </Button>
      </div>

      {filteredColors.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No colors found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? 'No colors match your search criteria. Please try using different search terms.'
                : 'You have not added any colors yet. Click the button above to add a color.'}
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
