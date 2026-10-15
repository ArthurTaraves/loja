import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/product/ProductCard';

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('categoria') ?? '';
  const [search, setSearch] = useState('');

  const { categories } = useCategories();
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const { products, loading } = useProducts(activeCategory?.id);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  const selectCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ categoria: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-xl font-semibold text-primary">Produtos</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-secondary/30 px-3 py-2 text-sm sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={`rounded-full border px-3 py-1 text-xs ${
              !activeCategory ? 'border-primary bg-primary text-white' : 'border-secondary/30 text-text'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.slug)}
              className={`rounded-full border px-3 py-1 text-xs ${
                activeCategory?.id === category.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-secondary/30 text-text'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-secondary">Carregando produtos...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-secondary">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
