import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductBySlug } from '../services/products';
import type { Product } from '../types';
import { ProductGallery } from '../components/product/ProductGallery';
import { VariationSelector } from '../components/product/VariationSelector';
import { useCart } from '../hooks/useCart';
import type { VariationSelection } from '../contexts/CartContext';
import { formatBRL } from '../utils/currency';

function stockFor(product: Product, selected: VariationSelection): number | null {
  if (!product.variations || product.variations.length === 0) {
    return product.stock ?? 0;
  }
  const allSelected = product.variations.every((group) => selected[group.name]);
  if (!allSelected) return null;
  const stocks = product.variations.map((group) => {
    const option = group.options.find((o) => o.label === selected[group.name]);
    return option?.stock ?? 0;
  });
  return Math.min(...stocks);
}

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VariationSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then(setProduct)
      .catch((error) => console.error('Falha ao carregar produto:', error))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="mx-auto max-w-5xl px-4 py-10 text-secondary sm:px-6">Carregando...</p>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-secondary">Produto não encontrado.</p>
        <Link to="/produtos" className="text-primary underline">
          Voltar para produtos
        </Link>
      </div>
    );
  }

  const stockAvailable = stockFor(product, selected);
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;
  const needsSelection = (product.variations?.length ?? 0) > 0 && stockAvailable === null;
  const canAdd = !needsSelection && (stockAvailable ?? 0) > 0 && quantity <= (stockAvailable ?? 0);

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(product.id, quantity, product.variations?.length ? selected : undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-6 sm:grid-cols-2 sm:px-6">
      <ProductGallery images={product.images} productName={product.name} />

      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-text">{product.name}</h1>

        <div className="flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="text-2xl font-bold text-primary">{formatBRL(product.promoPrice!)}</span>
              <span className="text-base text-secondary line-through">{formatBRL(product.price)}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">{formatBRL(product.price)}</span>
          )}
        </div>

        {product.description && <p className="whitespace-pre-line text-sm text-secondary">{product.description}</p>}

        {product.variations && product.variations.length > 0 && (
          <VariationSelector
            variations={product.variations}
            selected={selected}
            onChange={(group, label) => setSelected((s) => ({ ...s, [group]: label }))}
          />
        )}

        <div className="text-sm">
          {needsSelection ? (
            <span className="text-secondary">Selecione as opções para ver o estoque.</span>
          ) : (stockAvailable ?? 0) > 0 ? (
            <span className="text-green-700">Em estoque ({stockAvailable} disponíveis)</span>
          ) : (
            <span className="text-red-600">Esgotado</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded border border-secondary/30"
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center rounded border border-secondary/30"
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}
