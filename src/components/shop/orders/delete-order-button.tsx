'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteUnpaidOrder } from '@/actions/orders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber: string;
  onDeleted?: () => void;
}

export function DeleteOrderButton({ orderId, orderNumber, onDeleted }: DeleteOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    setIsLoading(true);

    try {
      const result = await deleteUnpaidOrder(orderId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete order');
      }

      toast.success('Order deleted successfully');
      setIsOpen(false);

      // 通知父组件订单已被删除，可以刷新列表
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete order');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete order #{orderNumber}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
            className="bg-destructive "
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Order'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
