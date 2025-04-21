'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '../delete-dialog';

interface SizeCardProps {
  size: {
    id: string;
    name: string;
    value: string;
  };
  onDelete: (id: string) => void;
}

export function SizeCard({ size, onDelete }: SizeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="group relative rounded-lg border p-6">
        <div className="mb-2 text-2xl font-semibold">{size.value}</div>
        <div>
          <h3 className="font-medium">{size.name}</h3>
        </div>
        <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="secondary" size="icon" className="h-8 w-8" asChild>
            <Link href={`/dashboard/sizes/${size.id}`}>
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

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete(size.id);
          setShowDeleteDialog(false);
        }}
        title={`Are you sure you want to delete the size "${size.name}"?`}
      />
    </>
  );
}
