'use client';

import { NoOrders } from '@/components/cart/empty-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, CheckCircle, AlertCircle, Clock, ShoppingBag, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { getUserOrders, getUnpaidOrders } from '@/actions/orders';
import { PayOrderButton } from '@/components/shop/orders/pay-order-button';
import { DeleteOrderButton } from '@/components/shop/orders/delete-order-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

// 定义类型
interface OrderItem {
  id: string;
  productId: string;
  productName: string | undefined;
  quantity: number;
  price: number;
  imageUrl: string | null;
  color?: { name: string; value: string } | null;
  size?: { name: string; value: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: OrderItem[];
  firstItemImage: string | null;
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const [allResponse, unpaidResponse] = await Promise.all([getUserOrders(), getUnpaidOrders()]);

      setAllOrders(allResponse.success ? (allResponse.orders as Order[]) : []);
      setUnpaidOrders(unpaidResponse.success ? (unpaidResponse.orders as Order[]) : []);
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // 处理订单删除后的刷新
  const handleOrderDeleted = () => {
    loadOrders();
  };

  // 获取订单状态图标
  function getOrderStatusIcon(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'CANCELLED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'UNPAID':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  }

  // 获取订单状态名称（中文）
  function getOrderStatusName(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'PROCESSING':
        return 'Processing';
      case 'PENDING':
        return 'Pending';
      case 'CANCELLED':
        return 'Cancelled';
      case 'UNPAID':
        return 'Unpaid';
      default:
        return 'Unknown Status';
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-10">
        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>
        <div className="flex justify-center py-10">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (allOrders.length === 0 && unpaidOrders.length === 0) {
    return (
      <div className="containermx-auto  max-w-5xl py-10">
        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>
        <NoOrders
          icon={<ShoppingBag className="h-10 w-10" />}
          title="You have no orders yet."
          description="Start shopping, and your orders will appear here."
          buttonText="Browse Products"
          buttonHref="/categories"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-10">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all">
            All Orders
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{allOrders.length}</span>
          </TabsTrigger>
          <TabsTrigger value="unpaid">
            Unpaid Orders
            <span className="ml-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 px-2 py-0.5 text-xs">
              {unpaidOrders.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {allOrders.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No orders</h3>
              <p className="text-muted-foreground">You have no orders yet.</p>
            </div>
          ) : (
            <OrdersList
              orders={allOrders}
              showPayButton={false}
              showDeleteButton={false}
              getOrderStatusIcon={getOrderStatusIcon}
              getOrderStatusName={getOrderStatusName}
              onOrderDeleted={handleOrderDeleted}
            />
          )}
        </TabsContent>

        <TabsContent value="unpaid" className="mt-6">
          {unpaidOrders.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No unpaid orders</h3>
              <p className="text-muted-foreground">You have no unpaid orders.</p>
            </div>
          ) : (
            <OrdersList
              orders={unpaidOrders}
              showPayButton={true}
              showDeleteButton={true}
              getOrderStatusIcon={getOrderStatusIcon}
              getOrderStatusName={getOrderStatusName}
              onOrderDeleted={handleOrderDeleted}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 订单列表组件
interface OrdersListProps {
  orders: Order[];
  showPayButton: boolean;
  showDeleteButton: boolean;
  getOrderStatusIcon: (status: string) => React.ReactNode;
  getOrderStatusName: (status: string) => string;
  onOrderDeleted: () => void;
}

function OrdersList({
  orders,
  showPayButton,
  showDeleteButton,
  getOrderStatusIcon,
  getOrderStatusName,
  onOrderDeleted,
}: OrdersListProps) {
  return (
    <div className="grid gap-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">Order Number: {order.orderNumber}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  {order.paymentStatus === 'UNPAID' ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-700 dark:text-amber-400">Unpaid</span>
                    </>
                  ) : (
                    <>
                      {getOrderStatusIcon(order.status)}
                      <span>{getOrderStatusName(order.status)}</span>
                    </>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.imageUrl && (
                          <div className="h-12 w-12 overflow-hidden rounded-md">
                            <img
                              src={item.imageUrl}
                              alt={item.productName || '未命名商品'}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div>{item.productName || '未命名商品'}</div>
                          {item.color && <div className="text-xs text-muted-foreground">Color: {item.color.name}</div>}
                          {item.size && <div className="text-xs text-muted-foreground">Size: {item.size.name}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
            <div className="flex gap-2">
              {showPayButton && order.paymentStatus === 'UNPAID' && <PayOrderButton orderId={order.id} />}
              {showDeleteButton && order.paymentStatus === 'UNPAID' && (
                <DeleteOrderButton orderId={order.id} orderNumber={order.orderNumber} onDeleted={onOrderDeleted} />
              )}
              <Link href={`/categories`}>
                <Button variant="ghost">Continue Shopping</Button>
              </Link>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-xl font-semibold">{formatPrice(order.totalAmount)}</div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
