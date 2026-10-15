import { useEffect, useRef, useState } from 'react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { updateStoreSettingsSection } from '../../services/settings';
import type { StoreSocial, StoreWhatsapp } from '../../types';
import { isValidWhatsappPhone } from '../../utils/validators';

export function ContactTab() {
  const { settings, loading } = useStoreSettings();
  const [whatsapp, setWhatsapp] = useState<StoreWhatsapp>(settings.whatsapp);
  const [social, setSocial] = useState<StoreSocial>(settings.social);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!loading && !initialized.current) {
      setWhatsapp(settings.whatsapp);
      setSocial(settings.social);
      initialized.current = true;
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setError(null);
    if (whatsapp.phone && !isValidWhatsappPhone(whatsapp.phone)) {
      setError('Número de WhatsApp inválido. Use o formato com DDI, ex: 5511999998888.');
      return;
    }
    setSaving(true);
    try {
      await updateStoreSettingsSection('whatsapp', whatsapp);
      await updateStoreSettingsSection('social', social);
      setSavedAt(Date.now());
    } catch (err) {
      console.error('Falha ao salvar contato:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Contato e WhatsApp</h2>
        <p className="text-sm text-gray-500">Usado no botão flutuante e na finalização de pedidos.</p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Número do WhatsApp (com DDI)
        <input
          type="text"
          value={whatsapp.phone}
          onChange={(e) => setWhatsapp((w) => ({ ...w, phone: e.target.value }))}
          placeholder="5511999998888"
          className="max-w-xs rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Mensagem padrão (botão flutuante)
        <textarea
          value={whatsapp.defaultMessage}
          onChange={(e) => setWhatsapp((w) => ({ ...w, defaultMessage: e.target.value }))}
          rows={3}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Mensagem modelo do pedido
        <textarea
          value={whatsapp.orderMessageTemplate}
          onChange={(e) => setWhatsapp((w) => ({ ...w, orderMessageTemplate: e.target.value }))}
          rows={5}
          className="rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
        />
        <span className="text-xs text-gray-500">
          Variáveis disponíveis: {'{nome}'}, {'{itens}'}, {'{total}'}, {'{endereco}'}
        </span>
      </label>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-900">Redes sociais (opcional)</h3>
        <div className="flex flex-col gap-3">
          <input
            type="url"
            value={social.instagram ?? ''}
            onChange={(e) => setSocial((s) => ({ ...s, instagram: e.target.value }))}
            placeholder="Link do Instagram"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={social.tiktok ?? ''}
            onChange={(e) => setSocial((s) => ({ ...s, tiktok: e.target.value }))}
            placeholder="Link do TikTok"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={social.facebook ?? ''}
            onChange={(e) => setSocial((s) => ({ ...s, facebook: e.target.value }))}
            placeholder="Link do Facebook"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
