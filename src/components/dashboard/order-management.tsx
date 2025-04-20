'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowDownUp,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getOrderDetails } from '@/actions/orders';
import { formatPrice } from '@/lib/utils';
import { UpdateOrderStatusDialog } from './update-order-status-dialog';

// 定义订单项类型
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

// 定义订单类型
interface Order {
  id: string;
  orderNumber: string;
  customer?: string;
  email?: string;
  createdAt: string;
  createdAtFormatted?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalAmountFormatted?: string;
  totalItems: number;
  shippingAddress?: string;
  phone?: string;
  items: OrderItem[];
  firstItemImage?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// 过滤表单类型
interface FilterForm {
  searchQuery: string;
  statusFilter: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

interface OrderManagementProps {
  initialOrders: Order[];
}

export function OrderManagement({ initialOrders }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用react-hook-form管理过滤表单
  const { register, watch, setValue, handleSubmit } = useForm<FilterForm>({
    defaultValues: {
      searchQuery: '',
      statusFilter: 'all',
    },
  });

  // 监听表单值变化
  const searchQuery = watch('searchQuery');
  const statusFilter = watch('statusFilter');

  // 清除搜索
  const clearSearch = () => {
    setValue('searchQuery', '');
  };

  // 刷新订单列表
  async function refreshOrders() {
    setIsLoading(true);
    try {
      // 使用浏览器重新加载页面以获取新数据
      window.location.reload();
    } catch (error) {
      console.error('刷新订单失败:', error);
      setError('刷新订单失败');
      setIsLoading(false);
    }
  }

  // 查看订单详情
  async function handleViewDetails(order: Order) {
    try {
      // 先显示基本信息
      setSelectedOrder(order);
      setIsDetailsOpen(true);

      // 然后异步加载详细信息
      const response = await getOrderDetails(order.id);
      if (response.success) {
        setSelectedOrder(response.order as any);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
    }
  }

  // 打开更新状态对话框
  function handleUpdateStatus(order: Order) {
    setSelectedOrder(order);
    setIsStatusUpdateOpen(true);
  }

  // 订单状态更新后的回调
  function handleStatusUpdated() {
    // 关闭状态更新对话框
    setIsStatusUpdateOpen(false);

    // 不再需要手动刷新，因为更新组件现在会使用router.refresh()
    // refreshOrders();
  }

  // 过滤订单
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.orderNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.user?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && order.paymentStatus === 'PAID') ||
      (statusFilter === 'unpaid' && order.paymentStatus === 'UNPAID') ||
      (statusFilter === 'processing' && order.status === 'PROCESSING');

    return matchesSearch && matchesStatus;
  });

  // 获取订单状态图标
  function getOrderStatusIcon(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PAID': // 在Prisma中是"PAID"，表示处理中
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'CANCELLED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  }

  // 获取支付状态图标
  function getPaymentStatusIcon(status: string) {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'UNPAID':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'REFUNDED':
        return <ArrowDownUp className="h-5 w-5 text-blue-500" />;
      default:
        return <X className="h-5 w-5 text-gray-500" />;
    }
  }

  // 获取订单状态名称（中文）
  function getOrderStatusName(status: string) {
    switch (status) {
      case 'COMPLETED':
        return '已完成';
      case 'PAID': // 在Prisma中是"PAID"，表示处理中
        return '处理中';
      case 'PENDING':
        return '待处理';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知状态';
    }
  }

  // 获取支付状态名称（中文）
  function getPaymentStatusName(status: string) {
    switch (status) {
      case 'PAID':
        return '已支付';
      case 'UNPAID':
        return '未支付';
      case 'REFUNDED':
        return '已退款';
      case 'FAILED':
        return '支付失败';
      default:
        return '未知状态';
    }
  }

  // 过滤状态选项
  const statusOptions = [
    { value: 'ALL', label: '全部' },
    { value: 'PENDING', label: '待处理' },
    { value: 'PAID', label: '处理中' }, // 更新为"PAID"状态
    { value: 'COMPLETED', label: '已完成' },
    { value: 'CANCELLED', label: '已取消' },
  ];

  // 处理表单提交
  const onSubmit = (data: FilterForm) => {
    console.log('Filter form submitted:', data);
    // 可以进行更复杂的过滤操作
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">订单管理</h1>
          <p className="text-muted-foreground">管理和跟踪客户订单</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshOrders} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="all" value={statusFilter} onValueChange={(value) => setValue('statusFilter', value)}>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">全部订单</TabsTrigger>
              <TabsTrigger value="paid">已支付</TabsTrigger>
              <TabsTrigger value="unpaid">未支付</TabsTrigger>
              <TabsTrigger value="processing">处理中</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索订单..."
                  className="pl-8 w-full md:w-[250px]"
                  {...register('searchQuery')}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">清除搜索</span>
                  </Button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    筛选
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>筛选条件</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    日期范围
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowDownUp className="mr-2 h-4 w-4" />
                    金额
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="all" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              getOrderStatusIcon={getOrderStatusIcon}
              getPaymentStatusIcon={getPaymentStatusIcon}
              getOrderStatusName={getOrderStatusName}
              getPaymentStatusName={getPaymentStatusName}
            />
          </TabsContent>
          <TabsContent value="paid" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              getOrderStatusIcon={getOrderStatusIcon}
              getPaymentStatusIcon={getPaymentStatusIcon}
              getOrderStatusName={getOrderStatusName}
              getPaymentStatusName={getPaymentStatusName}
            />
          </TabsContent>
          <TabsContent value="unpaid" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              getOrderStatusIcon={getOrderStatusIcon}
              getPaymentStatusIcon={getPaymentStatusIcon}
              getOrderStatusName={getOrderStatusName}
              getPaymentStatusName={getPaymentStatusName}
            />
          </TabsContent>
          <TabsContent value="processing" className="mt-4">
            <OrdersTable
              orders={filteredOrders}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              getOrderStatusIcon={getOrderStatusIcon}
              getPaymentStatusIcon={getPaymentStatusIcon}
              getOrderStatusName={getOrderStatusName}
              getPaymentStatusName={getPaymentStatusName}
            />
          </TabsContent>
        </Tabs>
      </form>

      {/* 订单详情对话框 */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
          {selectedOrder && (
            <>
              <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl">订单详情 #{selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription className="text-base">
                  创建于 {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="space-y-3 p-4 rounded-lg border">
                  <h3 className="font-medium text-lg">订单信息</h3>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium min-w-[80px]">订单状态:</span>
                      <div className="flex items-center gap-1">
                        {getOrderStatusIcon(selectedOrder.status)}
                        <span>{getOrderStatusName(selectedOrder.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium min-w-[80px]">支付状态:</span>
                      <div className="flex items-center gap-1">
                        {getPaymentStatusIcon(selectedOrder.paymentStatus)}
                        <span>{getPaymentStatusName(selectedOrder.paymentStatus)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium min-w-[80px]">总金额:</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium min-w-[80px]">商品数量:</span>
                      <span>{selectedOrder.totalItems}</span>
                    </div>
                    {(selectedOrder.customer || selectedOrder.user?.name) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-[80px]">客户:</span>
                        <span>{selectedOrder.customer || selectedOrder.user?.name}</span>
                      </div>
                    )}
                    {(selectedOrder.email || selectedOrder.user?.email) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-[80px]">邮箱:</span>
                        <span>{selectedOrder.email || selectedOrder.user?.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg border">
                  <h3 className="font-medium text-lg">收货信息</h3>
                  <div className="text-sm space-y-2">
                    {selectedOrder.shippingAddress ? (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-[80px]">收货地址:</span>
                          <span className="flex-1">{selectedOrder.shippingAddress}</span>
                        </div>
                        {selectedOrder.phone && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium min-w-[80px]">联系电话:</span>
                            <span>{selectedOrder.phone}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">暂无收货信息</div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-lg mb-3">订单商品</h3>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[240px]">商品</TableHead>
                      <TableHead className="text-right">单价</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">小计</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.imageUrl && (
                              <div className="h-16 w-16 overflow-hidden rounded-md">
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.color && `颜色: ${item.color.name}`}
                                {item.color && item.size && ' | '}
                                {item.size && `尺寸: ${item.size.name}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter className="mt-8 pt-4 border-t">
                <div className="mr-auto text-xl font-bold">总计: {formatPrice(selectedOrder.totalAmount)}</div>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  关闭
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleUpdateStatus(selectedOrder);
                  }}
                >
                  更新状态
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 更新订单状态对话框 */}
      {selectedOrder && (
        <UpdateOrderStatusDialog
          open={isStatusUpdateOpen}
          onOpenChange={setIsStatusUpdateOpen}
          order={selectedOrder}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}

// 订单表格组件
interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
  getOrderStatusIcon: (status: string) => React.ReactNode;
  getPaymentStatusIcon: (status: string) => React.ReactNode;
  getOrderStatusName: (status: string) => string;
  getPaymentStatusName: (status: string) => string;
}

function OrdersTable({
  orders,
  isLoading,
  onViewDetails,
  onUpdateStatus,
  getOrderStatusIcon,
  getPaymentStatusIcon,
  getOrderStatusName,
  getPaymentStatusName,
}: OrdersTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead className="hidden md:table-cell">日期</TableHead>
              <TableHead>客户</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead>订单状态</TableHead>
              <TableHead>支付状态</TableHead>
              <TableHead className="hidden md:table-cell">商品数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <div className="mt-2 text-muted-foreground">加载订单数据...</div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  没有找到订单。请尝试调整筛选条件。
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer || order.user?.name || '未知用户'}</div>
                      <div className="text-sm text-muted-foreground hidden md:block">
                        {order.email || order.user?.email || '无邮箱信息'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getOrderStatusIcon(order.status)}
                      <span>{getOrderStatusName(order.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getPaymentStatusIcon(order.paymentStatus)}
                      <span>{getPaymentStatusName(order.paymentStatus)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{order.totalItems}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">操作</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          更新状态
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
