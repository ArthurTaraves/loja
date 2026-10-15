import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const BOOTSTRAP_DOC = ['system', 'bootstrap'] as const;

export async function checkBootstrapDone(): Promise<boolean> {
  const snapshot = await getDoc(doc(db, ...BOOTSTRAP_DOC));
  return snapshot.exists() && snapshot.data().done === true;
}

export async function checkIsAdmin(uid: string): Promise<boolean> {
  const snapshot = await getDoc(doc(db, 'admins', uid));
  return snapshot.exists();
}

/**
 * Cria o primeiro admin. admins/{uid} e system/bootstrap são gravados no
 * mesmo batch; as firestore.rules exigem que os dois existam juntos
 * (existsAfter/getAfter), então essa chamada só é aceita uma única vez.
 */
export async function bootstrapFirstAdmin(uid: string, email: string): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, 'admins', uid), { email, createdAt: Date.now() });
  batch.set(doc(db, ...BOOTSTRAP_DOC), { done: true, createdAt: Date.now() });
  await batch.commit();
}
