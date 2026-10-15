import { useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { bootstrapFirstAdmin } from '../services/admins';
import { saveStoreSettings } from '../services/settings';
import { DEFAULT_STORE_SETTINGS } from '../types';
import { useAuth } from '../hooks/useAuth';
import { isValidWhatsappPhone } from '../utils/validators';

export function InitialSetup() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (phone && !isValidWhatsappPhone(phone)) {
      setError('Número de WhatsApp inválido. Use o formato com DDI, ex: 5511999998888.');
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await bootstrapFirstAdmin(credential.user.uid, email);
      await saveStoreSettings({
        ...DEFAULT_STORE_SETTINGS,
        identity: { ...DEFAULT_STORE_SETTINGS.identity, storeName: storeName || DEFAULT_STORE_SETTINGS.identity.storeName },
        whatsapp: { ...DEFAULT_STORE_SETTINGS.whatsapp, phone },
        seo: { ...DEFAULT_STORE_SETTINGS.seo, title: storeName || DEFAULT_STORE_SETTINGS.seo.title },
      });
      await refresh();
    } catch (err) {
      console.error('Falha na configuração inicial:', err);
      setError(err instanceof Error ? err.message : 'Falha ao configurar a loja.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Configuração inicial</h1>
        <p className="mt-1 text-sm text-gray-600">
          Nenhum admin foi configurado ainda. Crie a primeira conta para administrar esta loja.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Nome da loja
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Minha Loja"
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            WhatsApp (com DDI)
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5511999998888"
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          <hr className="border-gray-200" />

          <label className="flex flex-col gap-1 text-sm">
            Seu e-mail (login do admin)
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Configurando...' : 'Criar loja'}
          </button>
        </div>
      </form>
    </div>
  );
}
