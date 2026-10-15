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
import type { Banner } from '../types';

const bannersRef = () => collection(db, 'banners');

export async function listActiveBanners(): Promise<Banner[]> {
  const q = query(bannersRef(), where('active', '==', true), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Banner);
}

export async function listAllBanners(): Promise<Banner[]> {
  const q = query(bannersRef(), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Banner);
}

export async function createBanner(data: Omit<Banner, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(bannersRef(), { ...data, createdAt: Date.now() });
}

export async function updateBanner(id: string, data: Partial<Omit<Banner, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'banners', id), data);
}

export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(db, 'banners', id));
}

export async function swapBannerOrder(a: Banner, b: Banner): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'banners', a.id), { order: b.order });
  batch.update(doc(db, 'banners', b.id), { order: a.order });
  await batch.commit();
}
