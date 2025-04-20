import { getUserOrders } from '@/actions/orders';
import { OrderManagement } from '@/components/dashboard/order/order-management';

export default async function OrdersPage() {
  // 在服务器端获取订单数据
  const response = await getUserOrders();
  const initialOrders = response.success ? response.orders : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <OrderManagement initialOrders={initialOrders as any} />
    </div>
  );
}
