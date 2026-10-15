import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '../services/firebase';
import { checkBootstrapDone, checkIsAdmin } from '../services/admins';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  bootstrapDone: boolean | null;
  bootstrapLoading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [bootstrapDone, setBootstrapDone] = useState<boolean | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);

  const refreshBootstrap = async () => {
    setBootstrapLoading(true);
    try {
      const done = await checkBootstrapDone();
      setBootstrapDone(done);
    } catch (error) {
      console.error('Falha ao verificar bootstrap do admin:', error);
      setBootstrapDone(null);
    } finally {
      setBootstrapLoading(false);
    }
  };

  const refresh = async () => {
    await refreshBootstrap();
    if (auth.currentUser) {
      const admin = await checkIsAdmin(auth.currentUser.uid);
      setIsAdmin(admin);
    }
  };

  useEffect(() => {
    refreshBootstrap();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const admin = await checkIsAdmin(firebaseUser.uid);
          setIsAdmin(admin);
        } catch (error) {
          console.error('Falha ao verificar permissão de admin:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    isAdmin,
    authLoading,
    bootstrapDone,
    bootstrapLoading,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }
  return context;
}
