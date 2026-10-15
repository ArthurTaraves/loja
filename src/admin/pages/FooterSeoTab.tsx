import { useEffect, useRef, useState } from 'react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { updateStoreSettingsSection } from '../../services/settings';
import type { StoreFooter, StoreSeo } from '../../types';

export function FooterSeoTab() {
  const { settings, loading } = useStoreSettings();
  const [footer, setFooter] = useState<StoreFooter>(settings.footer);
  const [seo, setSeo] = useState<StoreSeo>(settings.seo);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!loading && !initialized.current) {
      setFooter(settings.footer);
      setSeo(settings.seo);
      initialized.current = true;
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreSettingsSection('footer', footer);
      await updateStoreSettingsSection('seo', seo);
      setSavedAt(Date.now());
    } catch (error) {
      console.error('Falha ao salvar rodapé/SEO:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Rodapé</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Texto livre
            <textarea
              value={footer.text}
              onChange={(e) => setFooter((f) => ({ ...f, text: e.target.value }))}
              rows={2}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Endereço
            <input
              type="text"
              value={footer.address}
              onChange={(e) => setFooter((f) => ({ ...f, address: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Horário de atendimento
            <input
              type="text"
              value={footer.hours}
              onChange={(e) => setFooter((f) => ({ ...f, hours: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">SEO</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Título da página
            <input
              type="text"
              value={seo.title}
              onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Descrição
            <textarea
              value={seo.description}
              onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
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
