import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getProductsByIds } from '../services/products';
import type { Product } from '../types';

export type VariationSelection = Record<string, string>;

interface CartItemRaw {
  productId: string;
  variations?: VariationSelection;
  quantity: number;
}

export interface CartLine {
  key: string;
  product: Product;
  variations?: VariationSelection;
  variationSummary?: string;
  quantity: number;
  unitPrice: number;
  stockAvailable: number;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, quantity: number, variations?: VariationSelection) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'loja:cart';

function canonicalVariations(variations?: VariationSelection): string {
  if (!variations) return '';
  return Object.entries(variations)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, label]) => `${name}=${label}`)
    .join('|');
}

function lineKey(productId: string, variations?: VariationSelection): string {
  return `${productId}::${canonicalVariations(variations)}`;
}

function variationSummary(variations?: VariationSelection): string | undefined {
  if (!variations) return undefined;
  const entries = Object.entries(variations);
  if (entries.length === 0) return undefined;
  return entries.map(([name, label]) => `${name}: ${label}`).join(', ');
}

function readRawCart(): CartItemRaw[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItemRaw[]) : [];
  } catch {
    return [];
  }
}

function writeRawCart(items: CartItemRaw[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage indisponível (modo privado, quota cheia); carrinho segue só em memória.
  }
}

function stockForSelection(product: Product, variations?: VariationSelection): number {
  const groups = product.variations;
  if (!groups || groups.length === 0) {
    return product.stock ?? 0;
  }
  if (!variations) return 0;
  const stocks = groups.map((group) => {
    const selectedLabel = variations[group.name];
    const option = selectedLabel ? group.options.find((o) => o.label === selectedLabel) : undefined;
    return option?.stock ?? 0;
  });
  return Math.min(...stocks);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [rawItems, setRawItems] = useState<CartItemRaw[]>(() => readRawCart());
  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    writeRawCart(rawItems);
  }, [rawItems]);

  const idsKey = useMemo(
    () => [...new Set(rawItems.map((item) => item.productId))].sort().join(','),
    [rawItems],
  );

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey ? idsKey.split(',') : [];
    if (ids.length === 0) {
      setProductsById({});
      setLoading(false);
      return;
    }
    setLoading(true);
    getProductsByIds(ids)
      .then((products) => {
        if (cancelled) return;
        const map: Record<string, Product> = {};
        products.forEach((p) => {
          map[p.id] = p;
        });
        setProductsById(map);
      })
      .catch((error) => {
        console.error('Falha ao carregar produtos do carrinho:', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const lines = useMemo<CartLine[]>(() => {
    return rawItems
      .map((item): CartLine | null => {
        const product = productsById[item.productId];
        if (!product) return null;
        const unitPrice = product.promoPrice ?? product.price;
        return {
          key: lineKey(item.productId, item.variations),
          product,
          variations: item.variations,
          variationSummary: variationSummary(item.variations),
          quantity: item.quantity,
          unitPrice,
          stockAvailable: stockForSelection(product, item.variations),
          lineTotal: unitPrice * item.quantity,
        };
      })
      .filter((line): line is CartLine => line !== null);
  }, [rawItems, productsById]);

  const addItem = (productId: string, quantity: number, variations?: VariationSelection) => {
    setRawItems((current) => {
      const key = lineKey(productId, variations);
      const existing = current.find((item) => lineKey(item.productId, item.variations) === key);
      if (existing) {
        return current.map((item) =>
          lineKey(item.productId, item.variations) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { productId, variations, quantity }];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    setRawItems((current) =>
      current
        .map((item) => (lineKey(item.productId, item.variations) === key ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (key: string) => {
    setRawItems((current) => current.filter((item) => lineKey(item.productId, item.variations) !== key));
  };

  const clearCart = () => setRawItems([]);

  const itemCount = rawItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const value: CartContextValue = {
    lines,
    loading,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext deve ser usado dentro de CartProvider');
  }
  return context;
}
