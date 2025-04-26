'use server';
import { db } from '@/db';
import { colors } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// 颜色相关操作
export async function getColors() {
  try {
    const result = await db
      .select({
        id: colors.id,
        name: colors.name,
        value: colors.value,
      })
      .from(colors)
      .orderBy(colors.name);

    return result;
  } catch (error) {
    console.error('获取颜色失败:', error);
    return [];
  }
}

export async function getColor(id: string) {
  try {
    const result = await db
      .select({
        id: colors.id,
        name: colors.name,
        value: colors.value,
      })
      .from(colors)
      .where(eq(colors.id, id))
      .limit(1);

    const color = result[0];

    if (!color) {
      return { success: false, error: '颜色不存在' };
    }

    return {
      success: true,
      color,
    };
  } catch (error) {
    console.error('获取颜色失败:', error);
    return { success: false, error: '获取颜色失败' };
  }
}

export async function createColor(data: { name: string; value: string }) {
  try {
    const [color] = await db
      .insert(colors)
      .values({
        name: data.name,
        value: data.value,
      })
      .returning();

    revalidatePath('/dashboard/colors');
    return { success: true, data: color };
  } catch (error) {
    return { success: false, error: '创建颜色失败' };
  }
}

export async function updateColor(id: string, data: { name: string; value: string }) {
  try {
    const [color] = await db
      .update(colors)
      .set({
        name: data.name,
        value: data.value,
      })
      .where(eq(colors.id, id))
      .returning();

    revalidatePath('/dashboard/colors');
    return { success: true, data: color };
  } catch (error) {
    return { success: false, error: '更新颜色失败' };
  }
}

export async function deleteColor(id: string) {
  try {
    await db.delete(colors).where(eq(colors.id, id));

    revalidatePath('/dashboard/colors');
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除颜色失败' };
  }
}
