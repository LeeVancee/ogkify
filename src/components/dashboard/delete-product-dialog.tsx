'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { deleteProduct } from '@/actions/products';
import { toast } from 'sonner';
interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
}

export function DeleteProductDialog({ open, onOpenChange, productId }: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!productId) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);

      toast.success('商品删除成功');
      router.refresh();
    } catch (error) {
      toast.error('删除商品时发生错误');
      console.error('删除商品错误:', error);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要删除此商品吗？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作无法撤销。该商品将从您的商品列表中永久删除，且无法恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
          <Button onClick={handleDelete} disabled={isDeleting || !productId} variant="destructive">
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在删除...
              </>
            ) : (
              '删除'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
