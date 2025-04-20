'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Order {
  id: string;
  orderNumber: string;
  date: string | Date;
  customerName: string;
  status: string;
  paymentStatus: string;
  amount: number;
  itemsCount: number;
}

interface RecentSalesProps {
  recentOrders: Order[];
}

export function RecentSales({ recentOrders = [] }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {recentOrders.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-sm text-muted-foreground">暂无近期订单</p>
        </div>
      ) : (
        recentOrders.map((order) => (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="头像" />
              <AvatarFallback>
                {order.customerName ? order.customerName.substring(0, 2).toUpperCase() : '用户'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{order.customerName || '匿名用户'}</p>
              <p className="text-sm text-muted-foreground">订单 #{order.orderNumber}</p>
            </div>
            <div className="ml-auto font-medium">${order.amount.toFixed(2)}</div>
          </div>
        ))
      )}
    </div>
  );
}
