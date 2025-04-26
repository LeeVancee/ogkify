'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db';
import { products, categories, colors, sizes, images, productsToColors, productsToSizes } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

const productFormSchema = z.object({
  name: z.string().min(1, {
    message: '商品名称至少需要1个字符。',
  }),
  description: z.string().min(1, {
    message: '商品描述至少需要1个字符。',
  }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: '价格必须是有效的数字。',
  }),
  categoryId: z.string({
    required_error: '请选择一个分类。',
  }),
  colorIds: z.array(z.string()).min(1, {
    message: '请至少选择一种颜色。',
  }),
  sizeIds: z.array(z.string()).min(1, {
    message: '请至少选择一种尺寸。',
  }),
  images: z.array(z.string()).min(1, {
    message: '请至少上传一张商品图片。',
  }),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export type ProductFormType = z.infer<typeof productFormSchema>;

export async function getProduct(id: string) {
  try {
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        isFeatured: products.isFeatured,
        isArchived: products.isArchived,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product || product.length === 0) {
      return null;
    }

    const productData = product[0];

    // 获取分类信息
    const categoryData = await db.select().from(categories).where(eq(categories.id, productData.categoryId)).limit(1);

    // 获取图片
    const imageData = await db
      .select({
        id: images.id,
        url: images.url,
      })
      .from(images)
      .where(eq(images.productId, id));

    // 获取颜色
    const colorIds = await db
      .select({
        colorId: productsToColors.colorId,
      })
      .from(productsToColors)
      .where(eq(productsToColors.productId, id));

    const colorData = await db
      .select()
      .from(colors)
      .where(
        colorIds.length > 0
          ? inArray(
              colors.id,
              colorIds.map((c) => c.colorId)
            )
          : undefined
      );

    // 获取尺寸
    const sizeIds = await db
      .select({
        sizeId: productsToSizes.sizeId,
      })
      .from(productsToSizes)
      .where(eq(productsToSizes.productId, id));

    const sizeData = await db
      .select()
      .from(sizes)
      .where(
        sizeIds.length > 0
          ? inArray(
              sizes.id,
              sizeIds.map((s) => s.sizeId)
            )
          : undefined
      );

    return {
      ...productData,
      price: productData.price.toString(),
      category: categoryData[0] || null,
      images: imageData.map((img) => img.url),
      colors: colorData,
      sizes: sizeData,
      colorIds: colorData.map((color) => color.id),
      sizeIds: sizeData.map((size) => size.id),
    };
  } catch (error) {
    console.error('获取商品失败:', error);
    return null;
  }
}

export async function updateProduct(id: string, data: ProductFormType) {
  const validatedFields = productFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: '表单验证失败' };
  }

  try {
    const {
      name,
      description,
      price,
      categoryId,
      colorIds,
      sizeIds,
      images: imageUrls,
      isFeatured,
      isArchived,
    } = validatedFields.data;

    // 查找现有的图片
    const existingImages = await db
      .select({
        id: images.id,
        url: images.url,
      })
      .from(images)
      .where(eq(images.productId, id));

    // 更新商品基本信息
    await db
      .update(products)
      .set({
        name,
        description,
        price: parseFloat(price),
        categoryId,
        isFeatured,
        isArchived,
      })
      .where(eq(products.id, id));

    // 删除不再使用的图片
    const imagesToDelete = existingImages.filter((image) => !imageUrls.includes(image.url));
    for (const image of imagesToDelete) {
      await db.delete(images).where(eq(images.id, image.id));
    }

    // 添加新图片
    const existingUrls = existingImages.map((image) => image.url);
    const newImages = imageUrls.filter((url) => !existingUrls.includes(url));

    for (const url of newImages) {
      await db.insert(images).values({
        productId: id,
        url,
      });
    }

    // 更新颜色关联
    await db.delete(productsToColors).where(eq(productsToColors.productId, id));

    for (const colorId of colorIds) {
      await db.insert(productsToColors).values({
        productId: id,
        colorId,
      });
    }

    // 更新尺寸关联
    await db.delete(productsToSizes).where(eq(productsToSizes.productId, id));

    for (const sizeId of sizeIds) {
      await db.insert(productsToSizes).values({
        productId: id,
        sizeId,
      });
    }

    return { success: true };
  } catch (error) {
    return {
      error: '更新商品失败。请稍后重试。',
    };
  }
}

export async function getProducts() {
  try {
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        isFeatured: products.isFeatured,
        isArchived: products.isArchived,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

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

        // 获取颜色
        const colorIds = await db
          .select({
            colorId: productsToColors.colorId,
          })
          .from(productsToColors)
          .where(eq(productsToColors.productId, product.id));

        const colorsResult =
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
          .where(eq(productsToSizes.productId, product.id));

        const sizesResult =
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

        return {
          ...product,
          category: categoryResult[0] || null,
          images: imagesResult,
          colors: colorsResult,
          sizes: sizesResult,
        };
      })
    );

    return productsWithRelations;
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await db.select().from(categories).orderBy(categories.name);
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

export async function getColors() {
  try {
    return await db.select().from(colors).orderBy(colors.name);
  } catch (error) {
    console.error('获取颜色失败:', error);
    return [];
  }
}

export async function getSizes() {
  try {
    return await db.select().from(sizes).orderBy(sizes.name);
  } catch (error) {
    console.error('获取尺寸失败:', error);
    return [];
  }
}

export async function createProduct(data: ProductFormType) {
  const validatedFields = productFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: '表单验证失败' };
  }

  try {
    const {
      name,
      description,
      price,
      categoryId,
      colorIds,
      sizeIds,
      images: imageUrls,
      isFeatured,
      isArchived,
    } = validatedFields.data;

    // 创建商品
    const [product] = await db
      .insert(products)
      .values({
        name,
        description,
        price: parseFloat(price),
        categoryId,
        isFeatured,
        isArchived,
      })
      .returning({ id: products.id });

    // 添加图片
    for (const url of imageUrls) {
      await db.insert(images).values({
        productId: product.id,
        url,
      });
    }

    // 添加颜色关联
    for (const colorId of colorIds) {
      await db.insert(productsToColors).values({
        productId: product.id,
        colorId,
      });
    }

    // 添加尺寸关联
    for (const sizeId of sizeIds) {
      await db.insert(productsToSizes).values({
        productId: product.id,
        sizeId,
      });
    }

    return { success: true, productId: product.id };
  } catch (error) {
    console.error('创建商品失败:', error);
    return { error: '创建商品失败' };
  }
}

export async function deleteProduct(id: string) {
  try {
    // 删除相关联的图片
    await db.delete(images).where(eq(images.productId, id));

    // 删除颜色关联
    await db.delete(productsToColors).where(eq(productsToColors.productId, id));

    // 删除尺寸关联
    await db.delete(productsToSizes).where(eq(productsToSizes.productId, id));

    // 删除商品
    await db.delete(products).where(eq(products.id, id));

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('删除商品失败:', error);
    return { success: false, error: '删除商品失败' };
  }
}

export async function getProductsCount() {
  try {
    const result = await db.select({ count: products.id }).from(products);

    return result.length;
  } catch (error) {
    console.error('获取商品数量失败:', error);
    return 0;
  }
}

export async function getPopularProducts(limit = 5) {
  try {
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
      })
      .from(products)
      .where(and(eq(products.isArchived, false), eq(products.isFeatured, true)))
      .limit(limit);

    // 获取每个产品的图片
    const productsWithImages = await Promise.all(
      productsData.map(async (product) => {
        const imagesResult = await db
          .select({
            url: images.url,
          })
          .from(images)
          .where(eq(images.productId, product.id));

        return {
          ...product,
          images: imagesResult,
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('获取热门商品失败:', error);
    return [];
  }
}
