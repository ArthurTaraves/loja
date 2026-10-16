import { useState } from 'react';
import type { ProductImage } from '../../types';
import { IMAGE_WIDTH, optimizedImageUrl } from '../../utils/cloudinaryUrl';

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-secondary/10 text-secondary">
        Sem foto
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary/10">
        {/* Imagem principal do produto: normalmente acima da dobra na página, não é lazy. */}
        <img
          src={optimizedImageUrl(active.url, IMAGE_WIDTH.galleryMain)}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((image, index) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                index === activeIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={optimizedImageUrl(image.url, IMAGE_WIDTH.galleryThumb)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
