import { useEffect, useState } from 'react';
import { listActiveProducts, listActiveProductsByCategory } from '../services/products';
import { logQueryError } from '../utils/logging';
import type { Product } from '../types';

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fetcher = categoryId ? listActiveProductsByCategory(categoryId) : listActiveProducts();
    fetcher
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (cancelled) return;
        logQueryError('produtos', err);
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return { products, loading, error };
}
