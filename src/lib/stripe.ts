import Stripe from 'stripe';

// 确保环境变量已设置
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY 环境变量未设置');
}

// 创建 Stripe 实例
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil', // 使用您的 Stripe 库支持的 API 版本
  typescript: true,
});

// 货币格式化函数，转换为 Stripe 使用的最小单位（例如，将元转换为分）
export function formatAmountForStripe(amount: number, currency: string = 'cny'): number {
  const currencies: Record<string, number> = {
    usd: 100, // $1.00 = 100 cents
    eur: 100, // €1.00 = 100 cents
    gbp: 100, // £1.00 = 100 pence
    cny: 100, // ¥1.00 = 100 分
  };

  const multiplier = currencies[currency.toLowerCase()] || 100;
  return Math.round(amount * multiplier);
}

// 从 Stripe 最小单位转换回普通金额
export function formatAmountFromStripe(amount: number, currency: string = 'cny'): number {
  const currencies: Record<string, number> = {
    usd: 100,
    eur: 100,
    gbp: 100,
    cny: 100,
  };

  const divider = currencies[currency.toLowerCase()] || 100;
  return amount / divider;
}
