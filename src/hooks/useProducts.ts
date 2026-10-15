import { useEffect, useState } from 'react';
import { listActiveProducts, listActiveProductsByCategory } from '../services/products';
import type { Product } from '../types';

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetcher = categoryId ? listActiveProductsByCategory(categoryId) : listActiveProducts();
    fetcher
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((error) => {
        console.error('Falha ao carregar produtos:', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return { products, loading };
}
