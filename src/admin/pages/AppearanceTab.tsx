import { useEffect, useRef, useState } from 'react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { updateStoreSettingsSection } from '../../services/settings';
import { ColorPicker } from '../../components/common/ColorPicker';
import { ImageUploader } from '../../components/common/ImageUploader';
import type { HeaderMode, StoreColors, StoreHeader, StoreIdentity } from '../../types';

export function AppearanceTab() {
  const { settings, loading } = useStoreSettings();
  const [identity, setIdentity] = useState<StoreIdentity>(settings.identity);
  const [colors, setColors] = useState<StoreColors>(settings.colors);
  const [header, setHeader] = useState<StoreHeader>(settings.header);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!loading && !initialized.current) {
      setIdentity(settings.identity);
      setColors(settings.colors);
      setHeader(settings.header);
      initialized.current = true;
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreSettingsSection('identity', identity);
      await updateStoreSettingsSection('colors', colors);
      await updateStoreSettingsSection('header', header);
      setSavedAt(Date.now());
    } catch (error) {
      console.error('Falha ao salvar aparência:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Carregando...</p>;

  const setHeaderMode = (mode: HeaderMode) => setHeader((h) => ({ ...h, mode }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Aparência</h2>
        <p className="text-sm text-gray-500">Identidade e cores aplicadas no site inteiro.</p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-gray-900">Identidade</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Nome da loja
            <input
              type="text"
              value={identity.storeName}
              onChange={(e) => setIdentity((i) => ({ ...i, storeName: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Slogan
            <input
              type="text"
              value={identity.slogan}
              onChange={(e) => setIdentity((i) => ({ ...i, slogan: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6">
          <ImageUploader
            label="Logo"
            recommendedSize="400x400px, fundo transparente (PNG)"
            value={identity.logoUrl ? { url: identity.logoUrl, publicId: identity.logoPublicId } : null}
            onChange={(result) =>
              setIdentity((i) => ({
                ...i,
                logoUrl: result?.url ?? '',
                logoPublicId: result?.publicId ?? '',
              }))
            }
          />
          <ImageUploader
            label="Favicon"
            recommendedSize="64x64px"
            value={identity.faviconUrl ? { url: identity.faviconUrl, publicId: identity.faviconPublicId } : null}
            onChange={(result) =>
              setIdentity((i) => ({
                ...i,
                faviconUrl: result?.url ?? '',
                faviconPublicId: result?.publicId ?? '',
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ColorPicker label="Primária" value={colors.primary} onChange={(v) => setColors((c) => ({ ...c, primary: v }))} />
        <ColorPicker
          label="Secundária"
          value={colors.secondary}
          onChange={(v) => setColors((c) => ({ ...c, secondary: v }))}
        />
        <ColorPicker
          label="Fundo"
          value={colors.background}
          onChange={(v) => setColors((c) => ({ ...c, background: v }))}
        />
        <ColorPicker label="Texto" value={colors.text} onChange={(v) => setColors((c) => ({ ...c, text: v }))} />
      </div>

      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.secondary }}
      >
        <p className="text-xs uppercase tracking-wide" style={{ color: colors.secondary }}>
          Prévia ao vivo
        </p>
        <p className="mt-1 text-lg font-semibold" style={{ color: colors.primary }}>
          {identity.storeName}
        </p>
        <button
          type="button"
          className="mt-3 rounded-md px-3 py-1.5 text-sm text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Botão de exemplo
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-900">Modo do cabeçalho</h3>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={header.mode === 'default'} onChange={() => setHeaderMode('default')} />
            Padrão (logo + nome + menu gerado pelo site)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={header.mode === 'image'} onChange={() => setHeaderMode('image')} />
            Imagem pronta (cabeçalho customizado)
          </label>
        </div>

        {header.mode === 'image' && (
          <div className="mt-4 flex flex-wrap gap-6">
            <ImageUploader
              label="Cabeçalho (desktop)"
              recommendedSize="1920x300px"
              value={header.imageUrl ? { url: header.imageUrl, publicId: header.imagePublicId } : null}
              onChange={(result) =>
                setHeader((h) => ({ ...h, imageUrl: result?.url ?? '', imagePublicId: result?.publicId ?? '' }))
              }
            />
            <ImageUploader
              label="Cabeçalho (mobile, opcional)"
              recommendedSize="800x300px"
              value={
                header.imageMobileUrl ? { url: header.imageMobileUrl, publicId: header.imageMobilePublicId } : null
              }
              onChange={(result) =>
                setHeader((h) => ({
                  ...h,
                  imageMobileUrl: result?.url ?? '',
                  imageMobilePublicId: result?.publicId ?? '',
                }))
              }
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        {savedAt && <span className="text-xs text-green-700">Salvo!</span>}
      </div>
    </div>
  );
}
