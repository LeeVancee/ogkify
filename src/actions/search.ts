'use server';

import { db } from '@/db';
import { products, categories, images } from '@/db/schema';
import { like, or, eq } from 'drizzle-orm';

export async function searchProducts(query: string) {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    const searchPattern = `%${query}%`;

    const productsData = await db.query.products.findMany({
      where: or(like(products.name, searchPattern), like(products.description, searchPattern)),
      with: {
        category: true,
        images: true,
      },
    });

    return productsData;
  } catch (error) {
    console.error('搜索产品时出错:', error);
    throw new Error('搜索产品时出错');
  }
}
