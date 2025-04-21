import HeroSection from '@/components/shop/home/hero-section';
import { FeaturedCategories } from '@/components/shop/home/featured-categories';
import { getFeaturedProducts } from '@/actions/get-featured-products';
import { FeaturedProducts } from '@/components/shop/home/featured-products';
import Container from '../container';

export default async function Home() {
  // 获取特色商品，限制为4个
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <div className="">
      <HeroSection />
      <div className=" mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        <FeaturedProducts initialProducts={featuredProducts} />
        <h2 className="text-3xl font-bold text-center mt-16 mb-8">Shop by Category</h2>
        <FeaturedCategories />
      </div>
    </div>
  );
}
