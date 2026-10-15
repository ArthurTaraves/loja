import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../types';

const productsRef = () => collection(db, 'products');

function toProduct(d: { id: string; data: () => unknown }): Product {
  return { id: d.id, ...(d.data() as object) } as Product;
}

export async function listActiveProducts(): Promise<Product[]> {
  const q = query(productsRef(), where('active', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toProduct);
}

export async function listActiveProductsByCategory(categoryId: string): Promise<Product[]> {
  const q = query(
    productsRef(),
    where('active', '==', true),
    where('categoryId', '==', categoryId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toProduct);
}

export async function listFeaturedProducts(): Promise<Product[]> {
  const q = query(
    productsRef(),
    where('active', '==', true),
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(productsRef(), where('active', '==', true), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return toProduct(snapshot.docs[0]);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Usado só para hidratar o carrinho (preço/estoque atuais). Mantém o filtro
 * active==true porque as regras do Firestore recusam a query inteira se ela não
 * provar, pelo próprio filtro, que só retorna documentos públicos — um produto
 * desativado depois de adicionado ao carrinho some da lista em vez de travar.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];
  const idChunks = chunk(uniqueIds, 10);
  const results = await Promise.all(
    idChunks.map(async (idChunk) => {
      const q = query(productsRef(), where(documentId(), 'in', idChunk), where('active', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(toProduct);
    }),
  );
  return results.flat();
}

export async function listAllProducts(): Promise<Product[]> {
  const q = query(productsRef(), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toProduct);
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const now = Date.now();
  await addDoc(productsRef(), { ...data, createdAt: now, updatedAt: now });
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: Date.now() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

/**
 * Calcula o novo estoque de um produto ao debitar (delta -1) ou devolver (delta +1)
 * a quantidade de um item de pedido. Se o produto tem variações, ajusta só a opção
 * selecionada; senão, ajusta o campo stock. Nunca deixa o estoque negativo.
 */
export function applyStockDelta(
  product: Product,
  variations: Record<string, string> | undefined,
  quantity: number,
  delta: 1 | -1,
): Partial<Pick<Product, 'stock' | 'variations'>> {
  if (product.variations && product.variations.length > 0) {
    const updatedGroups = product.variations.map((group) => {
      const selectedLabel = variations?.[group.name];
      if (!selectedLabel) return group;
      return {
        ...group,
        options: group.options.map((option) =>
          option.label === selectedLabel
            ? { ...option, stock: Math.max(0, option.stock + delta * quantity) }
            : option,
        ),
      };
    });
    return { variations: updatedGroups };
  }
  return { stock: Math.max(0, (product.stock ?? 0) + delta * quantity) };
}
