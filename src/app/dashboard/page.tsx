import type React from 'react';
export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Products" value="128" />
        <DashboardCard title="Total Categories" value="12" />
        <DashboardCard title="Pending Orders" value="8" />
        <DashboardCard title="Completed Orders" value="64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border p-4">
          <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
          <div className="rounded-md border">
            {/* Order table would go here */}
            <div className="p-8 text-center text-muted-foreground">No recent orders</div>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border p-4">
          <h2 className="mb-4 text-lg font-semibold">Popular Products</h2>
          <div className="rounded-md border">
            {/* Products list would go here */}
            <div className="p-8 text-center text-muted-foreground">No products data</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
