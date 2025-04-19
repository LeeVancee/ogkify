import { getUserCart } from '@/actions/cart';
import { CartItem } from '@/components/shop/cart/cart-item';
import { CartSummary } from '@/components/shop/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { CheckoutButton } from '@/components/shop/cart/checkout-button';

export default async function CartPage() {
  const { items, totalItems } = await getUserCart();
  const isEmpty = items.length === 0;

  // 计算总价
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 20; // 满200元免运费
  const total = subtotal + shipping;

  if (isEmpty) {
    return (
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">购物车是空的</h1>
        <p className="mb-8 text-center text-muted-foreground">看起来您还没有添加任何商品到购物车。</p>
        <Button asChild>
          <Link href="/products">浏览商品</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">您的购物车</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">订单摘要</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">商品小计（{totalItems}件）</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">运费</span>
              <span>{shipping === 0 ? '免费' : formatPrice(shipping)}</span>
            </div>
            <div className="my-4 border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>订单总计</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <CheckoutButton />
            <div className="mt-4 text-center text-xs text-muted-foreground">税费将在结算时计算</div>
          </div>
        </div>
      </div>
    </div>
  );
}
