import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

// getAuth() throws synchronously on an invalid/empty apiKey, which would crash
// the whole module graph (blank page) for anyone who hasn't filled in .env yet.
// Only initialize when the config actually looks complete. App.tsx renders a
// setup screen instead of the real app when isFirebaseConfigured is false, so
// these are never touched in that case.
let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  // ignoreUndefinedProperties: campos opcionais (endereço do pedido, preço
  // promocional, imagem mobile do banner etc.) chegam como `undefined` quando
  // não preenchidos — sem essa opção o SDK rejeita o write inteiro.
  dbInstance = initializeFirestore(app, { ignoreUndefinedProperties: true });
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
export default app;
