import { addDoc, collection, doc, getDocs, orderBy, query, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { applyStockDelta } from './products';
import type { Order, OrderStatus } from '../types';
import type { Product } from '../types';

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

/**
 * Muda o status do pedido. Ao entrar em 'confirmado' (pela primeira vez) debita o
 * estoque dos itens; ao cancelar um pedido que já tinha debitado, devolve o estoque.
 * Tudo roda numa transação para não haver corrida com outras confirmações simultâneas.
 */
export async function updateOrderStatus(order: Order, newStatus: OrderStatus): Promise<void> {
  const orderRef = doc(db, 'orders', order.id);
  const decrementing = newStatus === 'confirmado' && !order.stockDecremented;
  const restoring = newStatus === 'cancelado' && order.stockDecremented;

  if (!decrementing && !restoring) {
    await updateDoc(orderRef, { status: newStatus, updatedAt: Date.now() });
    return;
  }

  const delta: 1 | -1 = decrementing ? -1 : 1;

  await runTransaction(db, async (tx) => {
    const productRefs = order.items.map((item) => doc(db, 'products', item.productId));
    const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    snaps.forEach((snap, i) => {
      if (!snap.exists()) return; // produto excluído desde o pedido; segue sem travar a transação
      const product = { id: snap.id, ...snap.data() } as Product;
      const item = order.items[i];
      const updatedFields = applyStockDelta(product, item.variations, item.quantity, delta);
      tx.update(productRefs[i], updatedFields);
    });

    tx.update(orderRef, {
      status: newStatus,
      stockDecremented: decrementing,
      updatedAt: Date.now(),
    });
  });
}
