'use server';
import { db } from '@/db';
import { sizes } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// 尺寸相关操作
export async function getSizes() {
  try {
    const result = await db
      .select({
        id: sizes.id,
        name: sizes.name,
        value: sizes.value,
      })
      .from(sizes)
      .orderBy(sizes.name);

    return result;
  } catch (error) {
    console.error('获取尺寸失败:', error);
    return [];
  }
}

export async function getSize(id: string) {
  try {
    const result = await db
      .select({
        id: sizes.id,
        name: sizes.name,
        value: sizes.value,
      })
      .from(sizes)
      .where(eq(sizes.id, id))
      .limit(1);

    const size = result[0];

    if (!size) {
      return { success: false, error: '尺寸不存在' };
    }

    return {
      success: true,
      size,
    };
  } catch (error) {
    console.error('获取尺寸失败:', error);
    return { success: false, error: '获取尺寸失败' };
  }
}

export async function createSize(data: { name: string; value: string }) {
  try {
    const [size] = await db
      .insert(sizes)
      .values({
        name: data.name,
        value: data.value,
      })
      .returning();

    revalidatePath('/dashboard/sizes');
    return { success: true, data: size };
  } catch (error) {
    return { success: false, error: '创建尺寸失败' };
  }
}

export async function updateSize(id: string, data: { name: string; value: string }) {
  try {
    const [size] = await db
      .update(sizes)
      .set({
        name: data.name,
        value: data.value,
      })
      .where(eq(sizes.id, id))
      .returning();

    revalidatePath('/dashboard/sizes');
    return { success: true, data: size };
  } catch (error) {
    return { success: false, error: '更新尺寸失败' };
  }
}

export async function deleteSize(id: string) {
  try {
    await db.delete(sizes).where(eq(sizes.id, id));

    revalidatePath('/dashboard/sizes');
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除尺寸失败' };
  }
}
