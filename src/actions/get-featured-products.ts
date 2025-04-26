'use server';

import { db } from '@/db';
import { products, categories, images, productsToColors, productsToSizes } from '@/db/schema';
import { Product } from '@/lib/types';
import { eq, and, desc } from 'drizzle-orm';

/**
 * 获取特色商品列表
 * @param limit 返回的商品数量，默认为4个
 * @returns 特色商品列表
 */
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    // 从数据库获取特色商品
    const featuredProducts = await db.query.products.findMany({
      where: and(eq(products.isFeatured, true), eq(products.isArchived, false)),
      orderBy: [desc(products.createdAt)],
      limit,
      with: {
        category: true,
        images: true,
      },
    });

    // 获取每个商品的关联数据
    const productsWithRelations = await Promise.all(
      featuredProducts.map(async (product) => {
        // 获取分类
        const categoryResult = await db
          .select({
            name: categories.name,
          })
          .from(categories)
          .where(eq(categories.id, product.categoryId))
          .limit(1);

        // 获取图片
        const imageResult = await db
          .select({
            url: images.url,
          })
          .from(images)
          .where(eq(images.productId, product.id));

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: imageResult.map((img) => img.url),
          category: categoryResult.length ? categoryResult[0].name : '',
          inStock: true, // 假设所有商品都有库存
          rating: 5, // 默认评分
          reviews: 0, // 默认评论数
          discount: 0, // 默认无折扣
          freeShipping: false, // 默认不提供免费配送
        };
      })
    );

    return productsWithRelations;
  } catch (error) {
    console.error('获取特色商品失败:', error);
    return [];
  }
}
