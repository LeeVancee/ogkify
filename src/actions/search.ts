'use server';

import { prisma } from '@/lib/prisma';

export async function searchProducts(query: string) {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        images: true,
        category: true,
      },
    });

    return products;
  } catch (error) {
    console.error('搜索产品时出错:', error);
    throw new Error('搜索产品时出错');
  }
}
