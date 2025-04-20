'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateOrderStatus } from '@/actions/orders';
import { Loader2 } from 'lucide-react';

// 定义订单类型
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
}

// 定义订单状态类型 - 与Prisma模型对应
type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

// 定义订单状态选项 - 与实际UI显示对应
const orderStatusOptions = [
  { value: 'PENDING', label: '待处理' },
  { value: 'PROCESSING', label: '处理中' }, // 前端显示为"处理中"，但会映射到PAID
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

// 定义组件props
interface UpdateOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onStatusUpdated: () => void;
}

export function UpdateOrderStatusDialog({ open, onOpenChange, order, onStatusUpdated }: UpdateOrderStatusDialogProps) {
  const router = useRouter();

  // 初始状态，将PAID映射为PROCESSING以便UI显示
  const initialStatus = order.status === 'PAID' ? 'PROCESSING' : (order.status as OrderStatus);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleUpdate() {
    if (!order.id) return;

    setIsUpdating(true);
    try {
      // 调用更新订单状态API
      const result = await updateOrderStatus(order.id, status);

      if (result.success) {
        toast.success('订单状态已更新');
        onOpenChange(false);

        // 使用Next.js的刷新机制刷新页面数据，而不是调用callback
        router.refresh();
      } else {
        toast.error(result.error || '更新订单状态失败');
      }
    } catch (error) {
      console.error('更新订单状态失败:', error);
      toast.error('更新订单状态失败');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新订单状态</DialogTitle>
          <DialogDescription>订单号: {order.orderNumber}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
            {orderStatusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              '更新状态'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
