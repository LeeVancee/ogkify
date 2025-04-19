'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from './getSession';
import { cookies } from 'next/headers';

export interface CartItemData {
  productId: string;
  quantity: number;
  colorId?: string;
  sizeId?: string;
}

// 将商品添加到购物车
export async function addToCart(data: CartItemData) {
  try {
    const session = await getSession();

    // 检查用户是否登录
    if (!session?.user?.id) {
      console.error('添加到购物车失败: 用户未登录');
      return { error: '用户未登录，请先登录', success: false };
    }

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      console.error('添加到购物车失败: 商品不存在', data.productId);
      return { error: '商品不存在', success: false };
    }

    console.log('尝试为用户添加商品到购物车:', session.user.id, data.productId);

    // 检查用户是否已有购物车
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
    });

    // 如果没有购物车，创建一个新的
    if (!cart) {
      console.log('用户没有购物车，创建新购物车');
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // 检查购物车中是否已有该商品
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        colorId: data.colorId,
        sizeId: data.sizeId,
      },
    });

    if (existingItem) {
      console.log('购物车中已有该商品，更新数量');
      // 更新现有商品数量
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity },
      });
    } else {
      console.log('添加新商品到购物车');
      // 添加新商品到购物车
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity,
          colorId: data.colorId,
          sizeId: data.sizeId,
        },
      });
    }

    revalidatePath('/cart');
    return { success: true, message: '商品已添加到购物车' };
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return { error: '添加到购物车失败，服务器错误', success: false };
  }
}

// 处理表单提交的服务器操作
export async function handleAddToCartFormAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const colorId = (formData.get('colorId') as string) || undefined;
  const sizeId = (formData.get('sizeId') as string) || undefined;

  console.log('服务器端接收到购物车请求:', { productId, quantity, colorId, sizeId });

  return addToCart({
    productId,
    quantity,
    colorId,
    sizeId,
  });
}

// 获取用户购物车
export async function getUserCart() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { items: [], totalItems: 0 };
    }

    // 使用Prisma一次性查询购物车，包括所有关联数据
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            color: true,
            size: true,
          },
        },
      },
    });

    if (!cart || !cart.items.length) {
      return { items: [], totalItems: 0 };
    }

    // 格式化购物车数据
    const formattedItems = cart.items.map((item) => {
      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]?.url || '/placeholder.svg',
        colorId: item.colorId,
        colorName: item.color?.name || null,
        colorValue: item.color?.value || null,
        sizeId: item.sizeId,
        sizeName: item.size?.name || null,
        sizeValue: item.size?.value || null,
      };
    });

    return {
      items: formattedItems,
      totalItems: formattedItems.length,
    };
  } catch (error) {
    console.error('获取购物车失败:', error);
    return { items: [], totalItems: 0 };
  }
}

// 从购物车移除商品
export async function removeFromCart(cartItemId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '用户未登录', success: false };
    }

    // 验证这个购物车项属于当前用户
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      return { error: '无权操作此购物车项', success: false };
    }

    // 删除购物车项
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath('/cart');
    return { success: true, message: '商品已从购物车移除' };
  } catch (error) {
    console.error('从购物车移除失败:', error);
    return { error: '从购物车移除失败', success: false };
  }
}

// 更新购物车商品数量
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '用户未登录', success: false };
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    // 验证这个购物车项属于当前用户
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      return { error: '无权操作此购物车项', success: false };
    }

    // 更新数量
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath('/cart');
    return { success: true, message: '购物车已更新' };
  } catch (error) {
    console.error('更新购物车数量失败:', error);
    return { error: '更新购物车数量失败', success: false };
  }
}

// 清空购物车
export async function clearCart() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: '用户未登录', success: false };
    }

    // 获取用户的购物车
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return { success: true, message: '购物车已经是空的' };
    }

    // 删除购物车中的所有商品
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath('/cart');
    revalidatePath('/checkout');

    return { success: true, message: '购物车已清空' };
  } catch (error) {
    console.error('清空购物车失败:', error);
    return { error: '清空购物车失败', success: false };
  }
}
