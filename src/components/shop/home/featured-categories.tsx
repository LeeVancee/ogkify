import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });
    return categories;
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

export async function FeaturedCategories() {
  const categories = await getCategories();

  if (!categories.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/products?category=${category.name}`} className="group block">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={category.imageUrl || '/placeholder.svg'}
              alt={category.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-semibold text-white">{category.name}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
