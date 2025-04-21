'use client';

import { useState, useEffect } from 'react';
import { getUserCart, clearCart } from '@/actions/cart';
import { CheckoutForm } from '@/components/shop/checkout/checkout-form';
import { CheckoutSummary } from '@/components/shop/checkout/checkout-summary';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        const { items } = await getUserCart();
        setCartItems(items);
      } catch (error) {
        console.error('获取购物车数据失败:', error);
        toast.error('获取购物车数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);

  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-center text-muted-foreground">正在加载购物车数据...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">购物车是空的</h1>
        <p className="mb-8 text-center text-muted-foreground">您需要先将商品添加到购物车才能结账。</p>
        <Button asChild>
          <Link href="/categories">浏览商品</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 清空购物车
      const result = await clearCart();
      if (!result.success) {
        throw new Error(result.error || '清空购物车失败');
      }

      // 成功处理
      toast.success('订单提交成功！');
      router.push('/checkout/success');
    } catch (error) {
      console.error('提交订单失败:', error);
      toast.error('提交订单失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">结账</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
        <div>
          <CheckoutSummary items={cartItems} />
        </div>
      </div>
    </div>
  );
}
