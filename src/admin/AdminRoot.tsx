import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AdminLayout } from './AdminLayout';

// Ponto de entrada do painel admin — é este módulo (e tudo que ele importa:
// ProtectedRoute, AdminLogin, InitialSetup, AdminLayout e as 7 abas) que o
// router carrega via React.lazy, pra área pública nunca baixar esse código.
export default function AdminRoot() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}
