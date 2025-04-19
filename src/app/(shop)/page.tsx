import { HeroSection } from '@/components/shop/home/hero-section';
import { FeaturedCategories } from '@/components/shop/home/featured-categories';
import { getFeaturedProducts } from '@/actions/get-featured-products';
import { FeaturedProducts } from '@/components/shop/home/featured-products';
import Container from '../container';

export default async function Home() {
  // 获取特色商品，限制为8个
  const featuredProducts = await getFeaturedProducts(8);

  return (
    <Container>
      <div className="space-y-16 pb-16">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts initialProducts={featuredProducts} />
      </div>
    </Container>
  );
}
