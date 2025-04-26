'use server';

import { db } from '@/db';
import { carts, cartItems, products, colors, sizes, images } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { getSession } from './getSession';
import { cookies } from 'next/headers';
import { eq, and } from 'drizzle-orm';

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
      console.error('add to cart failed: user not logged in');
      return { error: 'user not logged in, please login', success: false };
    }

    // 检查商品是否存在
    const productResult = await db
      .select({
        id: products.id,
      })
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    if (!productResult.length) {
      console.error('add to cart failed: product not found', data.productId);
      return { error: 'product not found', success: false };
    }

    console.log('try to add product to cart', session.user.id, data.productId);

    // 检查用户是否已有购物车
    const cartResult = await db
      .select({
        id: carts.id,
      })
      .from(carts)
      .where(eq(carts.userId, session.user.id))
      .limit(1);

    let cartId;

    // 如果没有购物车，创建一个新的
    if (!cartResult.length) {
      console.log('user has no cart, create new cart');
      const [newCart] = await db.insert(carts).values({ userId: session.user.id }).returning({ id: carts.id });

      cartId = newCart.id;
    } else {
      cartId = cartResult[0].id;
    }

    // 检查购物车中是否已有该商品
    const existingItemResult = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, data.productId),
          data.colorId ? eq(cartItems.colorId, data.colorId) : undefined,
          data.sizeId ? eq(cartItems.sizeId, data.sizeId) : undefined
        )
      )
      .limit(1);

    if (existingItemResult.length) {
      console.log('cart already has this product, update quantity');
      // 更新现有商品数量
      await db
        .update(cartItems)
        .set({
          quantity: existingItemResult[0].quantity + data.quantity,
        })
        .where(eq(cartItems.id, existingItemResult[0].id));
    } else {
      console.log('add new product to cart');
      // 添加新商品到购物车
      await db.insert(cartItems).values({
        cartId,
        productId: data.productId,
        quantity: data.quantity,
        colorId: data.colorId,
        sizeId: data.sizeId,
      });
    }

    revalidatePath('/cart');
    return { success: true, message: 'product added to cart' };
  } catch (error) {
    console.error('add to cart failed:', error);
    return { error: 'add to cart failed, server error', success: false };
  }
}

// 处理表单提交的服务器操作
export async function handleAddToCartFormAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const colorId = (formData.get('colorId') as string) || undefined;
  const sizeId = (formData.get('sizeId') as string) || undefined;

  console.log('server received cart request:', { productId, quantity, colorId, sizeId });

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

    // 使用关系查询获取用户购物车
    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, session.user.id),
      with: {
        items: {
          with: {
            product: {
              with: {
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

    // 格式化购物车项
    const formattedItems = cart.items.map((item) => ({
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
    }));

    return {
      items: formattedItems,
      totalItems: formattedItems.length,
    };
  } catch (error) {
    console.error('get cart failed:', error);
    return { items: [], totalItems: 0 };
  }
}

// 从购物车移除商品
export async function removeFromCart(cartItemId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: 'user not logged in', success: false };
    }

    // 验证这个购物车项属于当前用户
    const cartItemResult = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
      })
      .from(cartItems)
      .where(eq(cartItems.id, cartItemId))
      .limit(1);

    if (!cartItemResult.length) {
      return { error: 'cart item not found', success: false };
    }

    const cartResult = await db
      .select({
        userId: carts.userId,
      })
      .from(carts)
      .where(eq(carts.id, cartItemResult[0].cartId))
      .limit(1);

    if (!cartResult.length || cartResult[0].userId !== session.user.id) {
      return { error: 'no permission to operate this cart item', success: false };
    }

    // 删除购物车项
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    revalidatePath('/cart');
    return { success: true, message: 'product removed from cart' };
  } catch (error) {
    console.error('remove from cart failed:', error);
    return { error: 'remove from cart failed', success: false };
  }
}

// 更新购物车商品数量
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: 'user not logged in', success: false };
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    // 验证这个购物车项属于当前用户
    const cartItemResult = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
      })
      .from(cartItems)
      .where(eq(cartItems.id, cartItemId))
      .limit(1);

    if (!cartItemResult.length) {
      return { error: 'cart item not found', success: false };
    }

    const cartResult = await db
      .select({
        userId: carts.userId,
      })
      .from(carts)
      .where(eq(carts.id, cartItemResult[0].cartId))
      .limit(1);

    if (!cartResult.length || cartResult[0].userId !== session.user.id) {
      return { error: 'no permission to operate this cart item', success: false };
    }

    // 更新数量
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));

    revalidatePath('/cart');
    return { success: true, message: 'cart updated' };
  } catch (error) {
    console.error('update cart quantity failed:', error);
    return { error: 'update cart quantity failed', success: false };
  }
}

// 清空购物车
export async function clearCart() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { error: 'user not logged in', success: false };
    }

    // 获取用户的购物车
    const cartResult = await db
      .select({
        id: carts.id,
      })
      .from(carts)
      .where(eq(carts.userId, session.user.id))
      .limit(1);

    if (!cartResult.length) {
      return { success: true, message: 'cart is already empty' };
    }

    // 删除购物车中的所有商品
    await db.delete(cartItems).where(eq(cartItems.cartId, cartResult[0].id));

    revalidatePath('/cart');
    revalidatePath('/checkout');

    return { success: true, message: 'cart cleared' };
  } catch (error) {
    console.error('clear cart failed:', error);
    return { error: 'clear cart failed', success: false };
  }
}
