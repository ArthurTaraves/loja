import { useEffect, useState } from 'react';
import { deleteProduct, listAllProducts } from '../../services/products';
import { listAllCategories } from '../../services/categories';
import type { Category, Product } from '../../types';
import { formatBRL } from '../../utils/currency';
import { optimizedImageUrl } from '../../utils/cloudinaryUrl';
import { ProductForm } from './ProductForm';

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const reload = () => {
    setLoading(true);
    Promise.all([listAllProducts(), listAllCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((error) => console.error('Falha ao carregar produtos:', error))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const remove = async (product: Product) => {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      reload();
    } catch (error) {
      console.error('Falha ao excluir produto:', error);
    }
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';

  if (editing) {
    return (
      <ProductForm
        initial={editing === 'new' ? undefined : editing}
        categories={categories}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Produtos</h2>
        <button
          type="button"
          onClick={() => setEditing('new')}
          disabled={categories.length === 0}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Novo produto
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <p className="text-sm text-amber-700">Cadastre ao menos uma categoria antes de criar produtos.</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum produto cadastrado.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 rounded-md border border-gray-200">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-3 py-2">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                {product.images[0] && (
                  <img
                    src={optimizedImageUrl(product.images[0].url, 100)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${product.active ? 'text-gray-900' : 'text-gray-400'}`}>{product.name}</p>
                <p className="text-xs text-gray-500">
                  {categoryName(product.categoryId)} · {formatBRL(product.promoPrice ?? product.price)}
                  {product.featured ? ' · Destaque' : ''}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(product)} className="text-xs text-gray-600 underline">
                Editar
              </button>
              <button type="button" onClick={() => remove(product)} className="text-xs text-red-600 underline">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
