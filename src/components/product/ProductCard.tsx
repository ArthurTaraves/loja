import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { formatBRL } from '../../utils/currency';

export function ProductCard({ product }: { product: Product }) {
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;
  const cover = product.images[0]?.url;

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-secondary/20 bg-background transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-secondary/10">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary">Sem foto</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-text">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="text-base font-semibold text-primary">{formatBRL(product.promoPrice!)}</span>
              <span className="text-xs text-secondary line-through">{formatBRL(product.price)}</span>
            </>
          ) : (
            <span className="text-base font-semibold text-primary">{formatBRL(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
