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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

// 定义类型
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
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

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const [allResponse, unpaidResponse] = await Promise.all([getUserOrders(), getUnpaidOrders()]);

        setAllOrders(allResponse.success ? allResponse.orders : []);
        setUnpaidOrders(unpaidResponse.success ? unpaidResponse.orders : []);
      } catch (error) {
        console.error('加载订单失败:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

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
        return '已完成';
      case 'PROCESSING':
        return '处理中';
      case 'PENDING':
        return '待处理';
      case 'CANCELLED':
        return '已取消';
      case 'UNPAID':
        return '未支付';
      default:
        return '未知状态';
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10">
        <h1 className="mb-8 text-3xl font-bold">我的订单</h1>
        <div className="flex justify-center py-10">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const ordersToShow = activeTab === 'all' ? allOrders : unpaidOrders;

  if (allOrders.length === 0 && unpaidOrders.length === 0) {
    return (
      <div className="container max-w-5xl py-10">
        <h1 className="mb-8 text-3xl font-bold">我的订单</h1>
        <NoOrders
          icon={<ShoppingBag className="h-10 w-10" />}
          title="您还没有订单"
          description="开始购物，您的订单将显示在这里"
          buttonText="浏览商品"
          buttonHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10">
      <h1 className="mb-8 text-3xl font-bold">我的订单</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all">
            所有订单
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{allOrders.length}</span>
          </TabsTrigger>
          <TabsTrigger value="unpaid">
            未支付订单
            <span className="ml-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 px-2 py-0.5 text-xs">
              {unpaidOrders.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {allOrders.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">没有订单</h3>
              <p className="text-muted-foreground">您还没有任何订单。</p>
            </div>
          ) : (
            <OrdersList
              orders={allOrders}
              showPayButton={false}
              getOrderStatusIcon={getOrderStatusIcon}
              getOrderStatusName={getOrderStatusName}
            />
          )}
        </TabsContent>

        <TabsContent value="unpaid" className="mt-6">
          {unpaidOrders.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">没有未支付订单</h3>
              <p className="text-muted-foreground">您没有任何待支付的订单。</p>
            </div>
          ) : (
            <OrdersList
              orders={unpaidOrders}
              showPayButton={true}
              getOrderStatusIcon={getOrderStatusIcon}
              getOrderStatusName={getOrderStatusName}
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
  getOrderStatusIcon: (status: string) => React.ReactNode;
  getOrderStatusName: (status: string) => string;
}

function OrdersList({ orders, showPayButton, getOrderStatusIcon, getOrderStatusName }: OrdersListProps) {
  return (
    <div className="grid gap-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">订单号：{order.orderNumber}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  {order.paymentStatus === 'UNPAID' ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-700 dark:text-amber-400">未支付</span>
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
                  <TableHead>商品</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead className="text-right">小计</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.imageUrl && (
                          <div className="h-12 w-12 overflow-hidden rounded-md">
                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div>{item.productName}</div>
                          {item.color && <div className="text-xs text-muted-foreground">颜色: {item.color.name}</div>}
                          {item.size && <div className="text-xs text-muted-foreground">尺寸: {item.size.name}</div>}
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
              <Link href={`/products`}>
                <Button variant="ghost">继续购物</Button>
              </Link>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground">总金额</div>
              <div className="text-xl font-semibold">{formatPrice(order.totalAmount)}</div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
