import { useEffect, useState } from 'react';
import { listFeaturedProducts } from '../../services/products';
import type { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { DevQueryError } from '../common/DevQueryError';
import { logQueryError } from '../../utils/logging';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    listFeaturedProducts()
      .then(setProducts)
      .catch((err) => {
        logQueryError('produtos em destaque', err);
        setError(err);
      });
  }, []);

  if (error) return <DevQueryError context="produtos em destaque" />;
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h2 className="mb-4 text-lg font-semibold text-primary">Destaques</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
