import { Button } from '@/components/ui/button';
import { ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface NoOrdersProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref?: string;
  icon?: ReactNode;
}

export function NoOrders({
  title,
  description,
  buttonText,
  buttonHref = '/',
  icon = <ShoppingBasket className="h-10 w-10" />,
}: NoOrdersProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border bg-card p-10 text-center animate-in fade-in-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">{icon}</div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link href={buttonHref} className="mt-6">
        <Button>{buttonText}</Button>
      </Link>
    </div>
  );
}

export function EmptyCart() {
  return (
    <NoOrders title="您的购物车是空的" description="浏览我们的商品，将您喜欢的商品添加到购物车" buttonText="继续购物" />
  );
}
