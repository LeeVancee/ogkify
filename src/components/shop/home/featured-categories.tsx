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
    <section className="container px-4 md:px-6">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Browse our product categories to find what you want</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories?category=${category.name}`}
              className="group relative overflow-hidden rounded-lg border"
            >
              <div className="aspect-square w-full overflow-hidden">
                <Image
                  src={category.imageUrl || '/placeholder.svg'}
                  alt={category.name}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <h3 className="font-medium">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
