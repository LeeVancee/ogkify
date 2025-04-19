'use server';

import { prisma } from '@/lib/prisma';
import { Product } from '@/lib/types';

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
    // 构建查询条件
    const where: any = {
      isArchived: false, // 不包括已归档商品
    };

    // 分类筛选
    if (options.category) {
      where.category = {
        name: options.category, // 通过分类名称筛选而不是ID
      };
    }

    // 特色商品筛选
    if (options.featured) {
      where.isFeatured = true;
    }

    // 价格范围筛选
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};

      if (options.minPrice !== undefined) {
        where.price.gte = options.minPrice;
      }

      if (options.maxPrice !== undefined) {
        where.price.lte = options.maxPrice;
      }
    }

    // 颜色筛选
    if (options.colors && options.colors.length > 0) {
      where.colors = {
        some: {
          name: {
            in: options.colors, // 通过颜色名称筛选而不是ID
          },
        },
      };
    }

    // 尺寸筛选
    if (options.sizes && options.sizes.length > 0) {
      where.sizes = {
        some: {
          value: {
            in: options.sizes, // 通过尺寸值筛选而不是ID
          },
        },
      };
    }

    // 搜索查询
    if (options.search) {
      where.OR = [
        {
          name: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 处理分页
    const page = options.page || 1;
    const limit = options.limit || 12;
    const skip = (page - 1) * limit;

    // 处理排序
    let orderBy: any = { createdAt: 'desc' }; // 默认按创建时间降序

    if (options.sort) {
      switch (options.sort) {
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'featured':
        default:
          // 特色商品优先，然后按创建时间降序
          orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      }
    }

    // 获取商品总数
    const total = await prisma.product.count({ where });

    // 获取商品列表
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // 格式化数据以符合Product接口
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images.map((image) => image.url),
      category: product.category.name,
      inStock: true, // 假设所有商品都有库存
      rating: 5, // 默认评分
      reviews: 0, // 默认评论数
      discount: 0, // 默认无折扣
      freeShipping: false, // 默认不提供免费配送
    }));

    return {
      products: formattedProducts,
      total,
    };
  } catch (error) {
    console.error('获取筛选商品失败:', error);
    return { products: [], total: 0 };
  }
}
