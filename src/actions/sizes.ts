'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 尺寸相关操作
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
