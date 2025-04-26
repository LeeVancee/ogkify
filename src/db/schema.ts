import {
  pgTable,
  varchar,
  text,
  uuid,
  pgEnum,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  uniqueIndex,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 枚举定义
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['UNPAID', 'PAID', 'REFUNDED', 'FAILED']);

// 模型定义
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const colors = pgTable('colors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  value: varchar('value').notNull(), // Hex code
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sizes = pgTable('sizes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  value: varchar('value').notNull(), // e.g., "S", "M", "L", etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  role: varchar('role'),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  phone: varchar('phone'),
  shippingAddress: text('shipping_address'),
  paymentMethod: varchar('payment_method'),
  paymentIntent: varchar('payment_intent'),
  paymentStatus: paymentStatusEnum('payment_status').default('UNPAID').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: doublePrecision('price').notNull(), // Price at time of order
  colorId: uuid('color_id').references(() => colors.id),
  sizeId: uuid('size_id').references(() => sizes.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').default(1).notNull(),
  colorId: uuid('color_id').references(() => colors.id),
  sizeId: uuid('size_id').references(() => sizes.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: varchar('impersonated_by'),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: varchar('account_id').notNull(),
  providerId: varchar('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: varchar('identifier').notNull(),
  value: varchar('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 多对多关系表
export const productsToColors = pgTable('products_to_colors', {
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  colorId: uuid('color_id')
    .notNull()
    .references(() => colors.id, { onDelete: 'cascade' }),
});

export const productsToSizes = pgTable('products_to_sizes', {
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sizeId: uuid('size_id')
    .notNull()
    .references(() => sizes.id, { onDelete: 'cascade' }),
});

// 关系定义
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  products: many(productsToColors, { relationName: 'colors_to_products' }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const sizesRelations = relations(sizes, ({ many }) => ({
  products: many(productsToSizes, { relationName: 'sizes_to_products' }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  colors: many(productsToColors, { relationName: 'products_to_colors' }),
  sizes: many(productsToSizes, { relationName: 'products_to_sizes' }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  images: many(images),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [orderItems.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [orderItems.sizeId],
    references: [sizes.id],
  }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  product: one(products, {
    fields: [images.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(user, {
    fields: [carts.userId],
    references: [user.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [cartItems.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [cartItems.sizeId],
    references: [sizes.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  orders: many(orders),
  carts: many(carts),
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountsRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// 连接多对多关系的辅助关系
export const productsToColorsRelations = relations(productsToColors, ({ one }) => ({
  product: one(products, {
    fields: [productsToColors.productId],
    references: [products.id],
    relationName: 'products_to_colors',
  }),
  color: one(colors, {
    fields: [productsToColors.colorId],
    references: [colors.id],
    relationName: 'colors_to_products',
  }),
}));

export const productsToSizesRelations = relations(productsToSizes, ({ one }) => ({
  product: one(products, {
    fields: [productsToSizes.productId],
    references: [products.id],
    relationName: 'products_to_sizes',
  }),
  size: one(sizes, {
    fields: [productsToSizes.sizeId],
    references: [sizes.id],
    relationName: 'sizes_to_products',
  }),
}));
