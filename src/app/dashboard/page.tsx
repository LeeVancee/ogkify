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
