import { signOut } from 'firebase/auth';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { AppearanceTab } from './pages/AppearanceTab';
import { BannersTab } from './pages/BannersTab';
import { ProductsTab } from './pages/ProductsTab';
import { CategoriesTab } from './pages/CategoriesTab';
import { OrdersTab } from './pages/OrdersTab';
import { ContactTab } from './pages/ContactTab';
import { FooterSeoTab } from './pages/FooterSeoTab';

const TABS = [
  { to: 'aparencia', label: 'Aparência' },
  { to: 'banners', label: 'Banners' },
  { to: 'produtos', label: 'Produtos' },
  { to: 'categorias', label: 'Categorias' },
  { to: 'pedidos', label: 'Pedidos' },
  { to: 'contato', label: 'Contato e WhatsApp' },
  { to: 'rodape-seo', label: 'Rodapé e SEO' },
];

function tabClass({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;
}

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <span className="font-semibold text-gray-900">Painel administrativo</span>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="hidden sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={`/admin/${tab.to}`} className={tabClass}>
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <Routes>
            <Route index element={<Navigate to="/admin/aparencia" replace />} />
            <Route path="aparencia" element={<AppearanceTab />} />
            <Route path="banners" element={<BannersTab />} />
            <Route path="produtos" element={<ProductsTab />} />
            <Route path="categorias" element={<CategoriesTab />} />
            <Route path="pedidos" element={<OrdersTab />} />
            <Route path="contato" element={<ContactTab />} />
            <Route path="rodape-seo" element={<FooterSeoTab />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
