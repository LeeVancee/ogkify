'use server';

import { db } from '@/db';
import { products, categories, colors, sizes, images, productsToColors, productsToSizes } from '@/db/schema';
import { eq, and, not, inArray } from 'drizzle-orm';

export async function getProduct(id: string) {
  try {
    // 获取产品基本信息
    const productResult = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!productResult.length) {
      return null;
    }

    const product = productResult[0];

    // 获取分类
    const categoryResult = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);

    // 获取颜色
    const colorIds = await db
      .select({
        colorId: productsToColors.colorId,
      })
      .from(productsToColors)
      .where(eq(productsToColors.productId, id));

    const colorData =
      colorIds.length > 0
        ? await db
            .select()
            .from(colors)
            .where(
              inArray(
                colors.id,
                colorIds.map((c) => c.colorId)
              )
            )
        : [];

    // 获取尺寸
    const sizeIds = await db
      .select({
        sizeId: productsToSizes.sizeId,
      })
      .from(productsToSizes)
      .where(eq(productsToSizes.productId, id));

    const sizeData =
      sizeIds.length > 0
        ? await db
            .select()
            .from(sizes)
            .where(
              inArray(
                sizes.id,
                sizeIds.map((s) => s.sizeId)
              )
            )
        : [];

    // 获取图片
    const imageData = await db
      .select({
        url: images.url,
      })
      .from(images)
      .where(eq(images.productId, id));

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: categoryResult.length ? categoryResult[0].name : '',
      categoryId: product.categoryId,
      colors: colorData.map((color) => ({
        id: color.id,
        name: color.name,
        value: color.value,
      })),
      sizes: sizeData.map((size) => ({
        id: size.id,
        name: size.name,
        value: size.value,
      })),
      images: imageData.map((image) => image.url),
      inStock: true, // 这里可以根据实际情况设置
      freeShipping: product.price > 200, // 假设价格高于200免运费
      isFeatured: product.isFeatured,
    };
  } catch (error) {
    console.error('获取产品详情失败:', error);
    return null;
  }
}

export async function getRelatedProducts(productId: string, category: string) {
  try {
    // 获取同类别的产品，排除当前产品
    const relatedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
      })
      .from(products)
      .where(and(eq(products.categoryId, category), not(eq(products.id, productId)), eq(products.isArchived, false)))
      .limit(4);

    // 获取每个产品的图片
    const productsWithImages = await Promise.all(
      relatedProducts.map(async (product) => {
        const imageResult = await db
          .select({
            url: images.url,
          })
          .from(images)
          .where(eq(images.productId, product.id));

        return {
          ...product,
          images: imageResult.map((img) => img.url),
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('获取相关产品失败:', error);
    return [];
  }
}
