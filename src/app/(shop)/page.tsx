import { ProductGrid } from '@/components/shop/product/product-grid';
import { HeroSection } from '@/components/shop/home/hero-section';
import { FeaturedCategories } from '@/components/shop/home/featured-categories';
import { getProducts } from '@/lib/products';

export default async function Home() {
  const products = await getProducts({ featured: true });

  return (
    <div className="space-y-16 pb-16">
      <HeroSection />
      <FeaturedCategories />
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground">Discover our handpicked selection of featured products</p>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
