'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// 分类相关操作
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

// 颜色相关操作
export async function createColor(data: { name: string; value: string }) {
  try {
    const color = await prisma.color.create({
      data: {
        name: data.name,
        value: data.value,
      },
    });
    revalidatePath('/dashboard/colors');
    return { success: true, data: color };
  } catch (error) {
    return { success: false, error: '创建颜色失败' };
  }
}

export async function updateColor(id: string, data: { name: string; value: string }) {
  try {
    const color = await prisma.color.update({
      where: { id },
      data: {
        name: data.name,
        value: data.value,
      },
    });
    revalidatePath('/dashboard/colors');
    return { success: true, data: color };
  } catch (error) {
    return { success: false, error: '更新颜色失败' };
  }
}

export async function deleteColor(id: string) {
  try {
    await prisma.color.delete({
      where: { id },
    });
    revalidatePath('/dashboard/colors');
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除颜色失败' };
  }
}

// 尺寸相关操作
export async function createSize(data: { name: string; value: string }) {
  try {
    const size = await prisma.size.create({
      data: {
        name: data.name,
        value: data.value,
      },
    });
    revalidatePath('/dashboard/sizes');
    return { success: true, data: size };
  } catch (error) {
    return { success: false, error: '创建尺寸失败' };
  }
}

export async function updateSize(id: string, data: { name: string; value: string }) {
  try {
    const size = await prisma.size.update({
      where: { id },
      data: {
        name: data.name,
        value: data.value,
      },
    });
    revalidatePath('/dashboard/sizes');
    return { success: true, data: size };
  } catch (error) {
    return { success: false, error: '更新尺寸失败' };
  }
}

export async function deleteSize(id: string) {
  try {
    await prisma.size.delete({
      where: { id },
    });
    revalidatePath('/dashboard/sizes');
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除尺寸失败' };
  }
}

// 获取列表
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

export async function getColors() {
  try {
    const colors = await prisma.color.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, value: true },
    });
    return colors;
  } catch (error) {
    return [];
  }
}

export async function getSizes() {
  try {
    const sizes = await prisma.size.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, value: true },
    });
    return sizes;
  } catch (error) {
    return [];
  }
}
