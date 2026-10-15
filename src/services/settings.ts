import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { StoreSettings } from '../types';

const SETTINGS_DOC_PATH = ['settings', 'store'] as const;

export function subscribeToStoreSettings(
  onChange: (settings: StoreSettings | null) => void,
  onError: (error: Error) => void,
) {
  const ref = doc(db, ...SETTINGS_DOC_PATH);
  return onSnapshot(
    ref,
    (snapshot) => {
      onChange(snapshot.exists() ? (snapshot.data() as StoreSettings) : null);
    },
    onError,
  );
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const ref = doc(db, ...SETTINGS_DOC_PATH);
  await setDoc(ref, { ...settings, updatedAt: Date.now() }, { merge: true });
}

/**
 * Atualiza só uma seção de nível superior de settings/store (ex: 'colors', 'whatsapp'),
 * sem tocar nas demais — evita que uma aba do admin sobrescreva o que outra aba salvou.
 */
export async function updateStoreSettingsSection<K extends keyof StoreSettings>(
  section: K,
  data: StoreSettings[K],
): Promise<void> {
  const ref = doc(db, ...SETTINGS_DOC_PATH);
  await updateDoc(ref, { [section]: data, updatedAt: Date.now() });
}
