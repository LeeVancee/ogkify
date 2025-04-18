'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 分类相关操作
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    });
    return categories;
  } catch (error) {
    return [];
  }
}
export async function createCategory(name: string) {
  try {
    const category = await prisma.category.create({
      data: { name },
    });
    revalidatePath('/dashboard/categories');
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: '创建分类失败' };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    revalidatePath('/dashboard/categories');
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: '更新分类失败' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除分类失败' };
  }
}
