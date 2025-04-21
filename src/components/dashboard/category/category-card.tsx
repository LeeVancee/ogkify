'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { DeleteDialog } from '../delete-dialog';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onDelete }: CategoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="group relative rounded-lg border">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={category.imageUrl || '/placeholder.svg'}
            alt={category.name}
            width={400}
            height={400}
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium">{category.name}</h3>
          <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="secondary" size="icon" className="h-8 w-8" asChild>
              <Link href={`/dashboard/categories/${category.id}`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete(category.id);
          setShowDeleteDialog(false);
        }}
        title={`Are you sure you want to delete the category "${category.name}"?`}
      />
    </>
  );
}
