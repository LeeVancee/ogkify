'use server';

import { db } from '@/db';
import { products, categories, images, colors, sizes, productsToColors, productsToSizes } from '@/db/schema';
import { Product } from '@/lib/types';
import { and, eq, gte, lte, desc, asc, or, like, inArray } from 'drizzle-orm';

export interface FilterOptions {
  category?: string;
  featured?: boolean;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  page?: number;
  limit?: number;
}

/**
 * 获取并过滤商品列表的服务器操作
 * @param options 过滤选项
 * @returns 过滤后的商品列表和总商品数
 */
export async function getFilteredProducts(
  options: FilterOptions = {}
): Promise<{ products: Product[]; total: number }> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 12;
    const skip = (page - 1) * limit;

    // 构建产品查询
    let productsData = await db.query.products.findMany({
      where: eq(products.isArchived, false),
      with: {
        category: true,
        images: true,
        colors: {
          with: {
            color: true,
          },
        },
        sizes: {
          with: {
            size: true,
          },
        },
      },
    });

    // 应用过滤条件

    // 1. 过滤特色商品
    if (options.featured) {
      productsData = productsData.filter((p) => p.isFeatured);
    }

    // 2. 过滤价格范围
    if (options.minPrice !== undefined) {
      productsData = productsData.filter((p) => p.price >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      productsData = productsData.filter((p) => p.price <= options.maxPrice!);
    }

    // 3. 搜索
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      productsData = productsData.filter(
        (p) => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower)
      );
    }

    // 4. 分类过滤
    if (options.category) {
      // 获取分类ID
      const categoryResult = await db.select().from(categories).where(eq(categories.name, options.category)).limit(1);

      if (categoryResult.length > 0) {
        const categoryId = categoryResult[0].id;
        productsData = productsData.filter((p) => p.categoryId === categoryId);
      }
    }

    // 5. 颜色过滤
    if (options.colors && options.colors.length > 0) {
      // 获取颜色ID
      const colorResults = await db.select().from(colors).where(inArray(colors.name, options.colors));

      if (colorResults.length > 0) {
        const colorIds = colorResults.map((c) => c.id);

        // 获取拥有这些颜色的产品ID
        const productsWithColors = await db
          .select()
          .from(productsToColors)
          .where(inArray(productsToColors.colorId, colorIds));

        const productIdsWithColors = new Set(productsWithColors.map((p) => p.productId));

        // 过滤产品
        productsData = productsData.filter((p) => productIdsWithColors.has(p.id));
      }
    }

    // 6. 尺寸过滤
    if (options.sizes && options.sizes.length > 0) {
      // 获取尺寸ID
      const sizeResults = await db.select().from(sizes).where(inArray(sizes.value, options.sizes));

      if (sizeResults.length > 0) {
        const sizeIds = sizeResults.map((s) => s.id);

        // 获取拥有这些尺寸的产品ID
        const productsWithSizes = await db
          .select()
          .from(productsToSizes)
          .where(inArray(productsToSizes.sizeId, sizeIds));

        const productIdsWithSizes = new Set(productsWithSizes.map((p) => p.productId));

        // 过滤产品
        productsData = productsData.filter((p) => productIdsWithSizes.has(p.id));
      }
    }

    // 7. 排序
    if (options.sort) {
      switch (options.sort) {
        case 'price-asc':
          productsData = productsData.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          productsData = productsData.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          productsData = productsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
          productsData = productsData.sort((a, b) => {
            // 特色商品优先
            if (a.isFeatured !== b.isFeatured) {
              return a.isFeatured ? -1 : 1;
            }
            // 然后按创建时间降序
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          break;
        default:
          // 默认按创建时间降序
          productsData = productsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      // 默认按创建时间降序
      productsData = productsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 获取总数
    const total = productsData.length;

    // 分页
    const paginatedProducts = productsData.slice(skip, skip + limit);

    // 获取每个产品的附加信息
    const formattedProducts = await Promise.all(
      paginatedProducts.map(async (product) => {
        // 获取分类
        const categoryResult = await db
          .select({
            name: categories.name,
          })
          .from(categories)
          .where(eq(categories.id, product.categoryId))
          .limit(1);

        // 获取图片
        const imageResults = await db
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
          images: imageResults.map((img) => img.url),
          category: categoryResult.length ? categoryResult[0].name : '',
          inStock: true, // 假设所有商品都有库存
          rating: 5, // 默认评分
          reviews: 0, // 默认评论数
          discount: 0, // 默认无折扣
          freeShipping: false, // 默认不提供免费配送
        };
      })
    );

    return {
      products: formattedProducts,
      total,
    };
  } catch (error) {
    console.error('获取筛选商品失败:', error);
    return { products: [], total: 0 };
  }
}
