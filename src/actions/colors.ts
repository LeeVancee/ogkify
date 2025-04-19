'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 颜色相关操作
export async function getColors() {
  try {
    const colors = await prisma.color.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return colors.map((color) => ({
      id: color.id,
      name: color.name,
      value: color.value,
    }));
  } catch (error) {
    console.error('获取颜色失败:', error);
    return [];
  }
}

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
