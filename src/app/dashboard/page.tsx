import { Suspense } from 'react';
import { getOrdersStats, getRecentOrders, getMonthlySalesData } from '@/actions/orders';
import { getProductsCount } from '@/actions/products';
import { getCategoriesCount } from '@/actions/categories';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  // 获取数据
  const productsCount = await getProductsCount();
  const categoriesCount = await getCategoriesCount();
  const { pendingOrders, completedOrders, totalRevenue } = await getOrdersStats();
  const recentOrders = await getRecentOrders();
  const monthlySalesData = await getMonthlySalesData();

  return (
    <DashboardClient
      productsCount={productsCount}
      categoriesCount={categoriesCount}
      pendingOrders={pendingOrders}
      completedOrders={completedOrders}
      totalRevenue={totalRevenue}
      recentOrders={recentOrders}
      popularProducts={[]}
      monthlySalesData={monthlySalesData}
    />
  );
}

export function DashboardCard({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon && <div>{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
