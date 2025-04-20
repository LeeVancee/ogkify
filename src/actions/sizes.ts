'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 尺寸相关操作
export async function getSizes() {
  try {
    const sizes = await prisma.size.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return sizes.map((size) => ({
      id: size.id,
      name: size.name,
      value: size.value,
    }));
  } catch (error) {
    console.error('获取尺寸失败:', error);
    return [];
  }
}

export async function getSize(id: string) {
  try {
    const size = await prisma.size.findUnique({
      where: { id },
    });

    if (!size) {
      return { success: false, error: '尺寸不存在' };
    }

    return {
      success: true,
      size: {
        id: size.id,
        name: size.name,
        value: size.value,
      },
    };
  } catch (error) {
    console.error('获取尺寸失败:', error);
    return { success: false, error: '获取尺寸失败' };
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
