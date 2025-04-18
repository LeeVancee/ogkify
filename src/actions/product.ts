'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true,
      },
    });

    if (!product) {
      return null;
    }

    return {
      ...product,
      price: product.price.toString(),
      colorIds: product.colors.map((color) => color.id),
      sizeIds: product.sizes.map((size) => size.id),
      images: product.images.map((image) => image.url),
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
    const { name, description, price, categoryId, colorIds, sizeIds, images, isFeatured, isArchived } =
      validatedFields.data;

    // 查找现有的图片
    const existingImages = await prisma.image.findMany({
      where: { productId: id },
    });

    // 删除不再使用的图片
    const imagesToDelete = existingImages.filter((image) => !images.includes(image.url));
    for (const image of imagesToDelete) {
      await prisma.image.delete({
        where: { id: image.id },
      });
    }

    // 添加新图片
    const existingUrls = existingImages.map((image) => image.url);
    const newImages = images.filter((url) => !existingUrls.includes(url));

    // 更新商品
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        isFeatured,
        isArchived,
        colors: {
          set: [], // 先清空关联
          connect: colorIds.map((id) => ({ id })),
        },
        sizes: {
          set: [], // 先清空关联
          connect: sizeIds.map((id) => ({ id })),
        },
        images: {
          create: newImages.map((url) => ({ url })),
        },
      },
    });

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
  } catch (error) {
    return {
      error: '更新商品失败。请稍后重试。',
    };
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

export async function getColors() {
  try {
    return await prisma.color.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('获取颜色失败:', error);
    return [];
  }
}

export async function getSizes() {
  try {
    return await prisma.size.findMany({
      orderBy: {
        name: 'asc',
      },
    });
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
    const { name, description, price, categoryId, colorIds, sizeIds, images, isFeatured, isArchived } =
      validatedFields.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        isFeatured,
        isArchived,
        colors: {
          connect: colorIds.map((id) => ({ id })),
        },
        sizes: {
          connect: sizeIds.map((id) => ({ id })),
        },
        images: {
          create: images.map((url) => ({ url })),
        },
      },
    });

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
  } catch (error) {
    return {
      error: '创建商品失败。请稍后重试。',
    };
  }
}
