import { useEffect, useState } from 'react';
import { listActiveBanners } from '../../services/banners';
import type { Banner } from '../../types';

function BannerSlide({ banner }: { banner: Banner }) {
  const image = (
    <picture>
      {banner.imageMobileUrl && <source media="(max-width: 640px)" srcSet={banner.imageMobileUrl} />}
      <img src={banner.imageDesktopUrl} alt="" className="h-full w-full object-cover" />
    </picture>
  );
  if (banner.link) {
    return (
      <a href={banner.link} className="block h-full w-full">
        {image}
      </a>
    );
  }
  return image;
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    listActiveBanners()
      .then(setBanners)
      .catch((error) => console.error('Falha ao carregar banners:', error));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative aspect-[16/6] w-full overflow-hidden bg-secondary/10 sm:aspect-[16/5]">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <BannerSlide banner={banner} />
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Ir para banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
