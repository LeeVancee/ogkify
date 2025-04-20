'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  date: string | Date;
  status: string;
  paymentStatus: string;
  amount: number;
  totalItems: number;
}

interface RecentSalesProps {
  recentOrders: Order[];
}

export function RecentSales({ recentOrders = [] }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {recentOrders.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-sm text-muted-foreground">No recent orders</p>
        </div>
      ) : (
        recentOrders.map((order) => (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>{order.customer ? order.customer.substring(0, 2).toUpperCase() : 'UN'}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{order.customer || 'Anonymous User'}</p>
              <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
            </div>
            <div className="ml-auto font-medium">${order.amount.toFixed(2)}</div>
          </div>
        ))
      )}
    </div>
  );
}
