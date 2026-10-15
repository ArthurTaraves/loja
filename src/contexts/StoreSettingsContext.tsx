import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { subscribeToStoreSettings } from '../services/settings';
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from '../types';

interface StoreSettingsContextValue {
  settings: StoreSettings;
  loading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextValue | undefined>(undefined);

function mergeWithDefaults(partial: StoreSettings | null): StoreSettings {
  if (!partial) return DEFAULT_STORE_SETTINGS;
  return {
    identity: { ...DEFAULT_STORE_SETTINGS.identity, ...partial.identity },
    colors: { ...DEFAULT_STORE_SETTINGS.colors, ...partial.colors },
    header: { ...DEFAULT_STORE_SETTINGS.header, ...partial.header },
    whatsapp: { ...DEFAULT_STORE_SETTINGS.whatsapp, ...partial.whatsapp },
    social: { ...DEFAULT_STORE_SETTINGS.social, ...partial.social },
    footer: { ...DEFAULT_STORE_SETTINGS.footer, ...partial.footer },
    seo: { ...DEFAULT_STORE_SETTINGS.seo, ...partial.seo },
    updatedAt: partial.updatedAt,
  };
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToStoreSettings(
      (loaded) => {
        setSettings(mergeWithDefaults(loaded));
        setLoading(false);
      },
      (error) => {
        console.error('Falha ao carregar settings/store, usando valores padrão:', error);
        setSettings(DEFAULT_STORE_SETTINGS);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', settings.colors.primary);
    root.style.setProperty('--color-secondary', settings.colors.secondary);
    root.style.setProperty('--color-background', settings.colors.background);
    root.style.setProperty('--color-text', settings.colors.text);
  }, [settings.colors]);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettingsContext(): StoreSettingsContextValue {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettingsContext deve ser usado dentro de StoreSettingsProvider');
  }
  return context;
}
