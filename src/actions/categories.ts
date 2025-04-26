'use server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// 分类相关操作
export async function getCategories() {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .orderBy(categories.createdAt);

    return result;
  } catch (error) {
    return [];
  }
}

export async function getCategory(id: string) {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    const category = result[0];

    if (!category) {
      return { success: false, error: '分类不存在' };
    }

    return { success: true, category };
  } catch (error) {
    console.error('获取分类失败:', error);
    return { success: false, error: '获取分类失败' };
  }
}

interface CreateCategoryInput {
  name: string;
  imageUrl: string;
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    const [category] = await db
      .insert(categories)
      .values({
        name: input.name,
        imageUrl: input.imageUrl,
      })
      .returning();

    revalidatePath('/dashboard/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('创建分类失败:', error);
    return { success: false, error: '创建分类失败' };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const [category] = await db.update(categories).set({ name }).where(eq(categories.id, id)).returning();

    revalidatePath('/dashboard/categories');
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: '更新分类失败' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除分类失败' };
  }
}

export async function getCategoriesCount() {
  try {
    const result = await db.select({ count: categories.id }).from(categories).limit(1);

    return result[0]?.count ? 1 : 0;
  } catch (error) {
    console.error('获取分类数量失败:', error);
    return 0;
  }
}
