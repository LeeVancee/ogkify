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

    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(or(like(products.name, searchPattern), like(products.description, searchPattern)));

    // 获取每个产品的附加信息
    const productsWithRelations = await Promise.all(
      productsData.map(async (product) => {
        // 获取分类
        const categoryResult = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);

        // 获取图片
        const imagesResult = await db
          .select({
            url: images.url,
          })
          .from(images)
          .where(eq(images.productId, product.id));

        return {
          ...product,
          category: categoryResult[0] || null,
          images: imagesResult,
        };
      })
    );

    return productsWithRelations;
  } catch (error) {
    console.error('搜索产品时出错:', error);
    throw new Error('搜索产品时出错');
  }
}
