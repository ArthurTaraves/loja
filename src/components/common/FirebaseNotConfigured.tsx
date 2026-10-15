export function FirebaseNotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Configuração necessária</h1>
        <p className="mt-3 text-gray-600">
          Este site ainda não está conectado a um projeto Firebase. Copie{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.env.example</code> para{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.env</code> e preencha as
          variáveis <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">VITE_FIREBASE_*</code>{' '}
          com os dados do seu projeto no Firebase.
        </p>
        <p className="mt-3 text-gray-600">
          Depois de preencher o <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.env</code>
          , reinicie o servidor (<code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">npm run dev</code>
          ). Veja o passo a passo completo no README do projeto.
        </p>
      </div>
    </div>
  );
}
