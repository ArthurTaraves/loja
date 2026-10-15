import { BannerCarousel } from '../components/home/BannerCarousel';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { CategoryGrid } from '../components/home/CategoryGrid';

export function Home() {
  return (
    <div>
      <BannerCarousel />
      <FeaturedProducts />
      <CategoryGrid />
    </div>
  );
}
