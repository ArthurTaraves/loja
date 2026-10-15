import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category } from '../types';

const categoriesRef = () => collection(db, 'categories');

export async function listActiveCategories(): Promise<Category[]> {
  const q = query(categoriesRef(), where('active', '==', true), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function listAllCategories(): Promise<Category[]> {
  const q = query(categoriesRef(), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(categoriesRef(), { ...data, createdAt: Date.now() });
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'categories', id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

export async function swapCategoryOrder(a: Category, b: Category): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'categories', a.id), { order: b.order });
  batch.update(doc(db, 'categories', b.id), { order: a.order });
  await batch.commit();
}
