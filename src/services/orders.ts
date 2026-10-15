import { addDoc, collection, doc, getDocs, orderBy, query, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { applyStockDelta } from './products';
import type { Order, OrderItem, OrderStatus, Product } from '../types';

const ordersRef = () => collection(db, 'orders');

export async function listAllOrders(): Promise<Order[]> {
  const q = query(ordersRef(), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(ordersRef(), { ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

function groupItemsByProduct(items: OrderItem[]): Map<string, OrderItem[]> {
  const map = new Map<string, OrderItem[]>();
  for (const item of items) {
    const list = map.get(item.productId) ?? [];
    list.push(item);
    map.set(item.productId, list);
  }
  return map;
}

/**
 * Muda o status do pedido. Ao entrar em 'confirmado' (pela primeira vez) debita o
 * estoque dos itens; ao cancelar um pedido que já tinha debitado, devolve o estoque.
 * Roda tudo numa transação: o pedido e os produtos são lidos de dentro dela (nunca
 * do objeto em memória) para não haver baixa dupla em cliques repetidos nem corrida
 * com outra confirmação simultânea.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) return;
    const order = { id: orderSnap.id, ...orderSnap.data() } as Order;

    const decrementing = newStatus === 'confirmado' && !order.stockDecremented;
    const restoring = newStatus === 'cancelado' && order.stockDecremented;

    if (!decrementing && !restoring) {
      tx.update(orderRef, { status: newStatus, updatedAt: Date.now() });
      return;
    }

    const delta: 1 | -1 = decrementing ? -1 : 1;

    // Agrupa por produto: um pedido pode ter o mesmo produto mais de uma vez (ex:
    // duas variações diferentes), e cada um precisa acumular sobre o mesmo
    // snapshot antes de um único tx.update por produto — senão o último
    // tx.update sobrescreve o que os anteriores escreveram para esse documento.
    const itemsByProduct = groupItemsByProduct(order.items);
    const productIds = [...itemsByProduct.keys()];
    const productRefs = productIds.map((id) => doc(db, 'products', id));
    const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    snaps.forEach((snap, i) => {
      if (!snap.exists()) return; // produto excluído desde o pedido; segue sem travar a transação
      const product = { id: snap.id, ...snap.data() } as Product;
      const items = itemsByProduct.get(productIds[i])!;

      if (product.variations && product.variations.length > 0) {
        let variations = product.variations;
        for (const item of items) {
          const result = applyStockDelta({ ...product, variations }, item.variations, item.quantity, delta);
          variations = result.variations ?? variations;
        }
        tx.update(productRefs[i], { variations });
      } else {
        let stock = product.stock ?? 0;
        for (const item of items) {
          const result = applyStockDelta({ ...product, stock }, item.variations, item.quantity, delta);
          stock = result.stock ?? stock;
        }
        tx.update(productRefs[i], { stock });
      }
    });

    tx.update(orderRef, {
      status: newStatus,
      stockDecremented: decrementing,
      updatedAt: Date.now(),
    });
  });
}
