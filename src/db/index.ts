import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const client = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client, schema });

/* import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 连接参数
const connectionString = process.env.DATABASE_URL!;
// 创建客户端
const client = postgres(connectionString);

// 创建Drizzle实例
export const db = drizzle(client, { schema });
 */
