import type { ReactNode } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/firebase';
import { Loading } from './Loading';
import { AdminLogin } from '../../admin/AdminLogin';
import { InitialSetup } from '../../admin/InitialSetup';

function NotAuthorized() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Sem permissão</h1>
      <p className="max-w-sm text-sm text-gray-600">
        A conta {user?.email} não está autorizada a acessar o painel administrativo.
      </p>
      <button
        type="button"
        onClick={() => signOut(auth)}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
      >
        Sair
      </button>
    </div>
  );
}

function BootstrapCheckError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Não foi possível verificar o painel</h1>
      <p className="max-w-sm text-sm text-gray-600">
        Não conseguimos checar a configuração inicial no Firestore. Confira se o projeto Firebase no{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5">.env</code> está correto e se as regras do
        Firestore (<code className="rounded bg-gray-100 px-1.5 py-0.5">firestore.rules</code>) já foram
        publicadas.
      </p>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authLoading, bootstrapLoading, bootstrapDone, user, isAdmin } = useAuth();

  if (authLoading || bootstrapLoading) return <Loading />;
  if (bootstrapDone === null) return <BootstrapCheckError />;
  if (!bootstrapDone) return <InitialSetup />;
  if (!user) return <AdminLogin />;
  if (!isAdmin) return <NotAuthorized />;
  return <>{children}</>;
}
