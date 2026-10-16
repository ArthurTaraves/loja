import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { NotFound } from './pages/NotFound';
import { Loading } from './components/common/Loading';

// Carregado sob demanda: a área pública nunca baixa o código do admin
// (login, setup inicial, as 7 abas, ProductForm...) até alguém visitar /admin.
const AdminRoot = lazy(() => import('./admin/AdminRoot'));

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<ProductList />} />
        <Route path="/produto/:slug" element={<ProductDetail />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loading />}>
            <AdminRoot />
          </Suspense>
        }
      />
    </Routes>
  );
}
