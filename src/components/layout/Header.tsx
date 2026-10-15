import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { useCategories } from '../../hooks/useCategories';
import { useCart } from '../../hooks/useCart';

function CartLink() {
  const { itemCount } = useCart();
  return (
    <Link to="/carrinho" className="relative flex items-center gap-1 text-text hover:text-primary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-text'}`;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { categories } = useCategories();
  return (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={onNavigate}>
        Início
      </NavLink>
      <NavLink to="/produtos" className={navLinkClass} onClick={onNavigate}>
        Produtos
      </NavLink>
      {categories.map((category) => (
        <NavLink
          key={category.id}
          to={`/produtos?categoria=${category.slug}`}
          className={navLinkClass}
          onClick={onNavigate}
        >
          {category.name}
        </NavLink>
      ))}
    </>
  );
}

function MenuToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      className="flex h-9 w-9 items-center justify-center text-text sm:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
      </svg>
    </button>
  );
}

function DefaultHeader() {
  const { settings } = useStoreSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-secondary/20 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          {settings.identity.logoUrl ? (
            <img src={settings.identity.logoUrl} alt={settings.identity.storeName} className="h-10 w-auto" />
          ) : null}
          <span className="text-lg font-semibold text-primary">{settings.identity.storeName}</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          <CartLink />
          <MenuToggle open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t border-secondary/20 px-4 py-4 sm:hidden">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}
    </header>
  );
}

function ImageHeader() {
  const { settings } = useStoreSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const { header } = settings;

  return (
    <header className="border-b border-secondary/20 bg-background">
      <Link to="/" className="block">
        <picture>
          {header.imageMobileUrl && <source media="(max-width: 640px)" srcSet={header.imageMobileUrl} />}
          <img src={header.imageUrl} alt={settings.identity.storeName} className="w-full object-cover" />
        </picture>
      </Link>

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <nav className="hidden items-center gap-6 sm:flex">
          <NavLinks />
        </nav>
        <span className="sm:hidden" />
        <div className="flex items-center gap-3">
          <CartLink />
          <MenuToggle open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t border-secondary/20 px-4 py-4 sm:hidden">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}
    </header>
  );
}

export function Header() {
  const { settings } = useStoreSettings();
  if (settings.header.mode === 'image' && settings.header.imageUrl) {
    return <ImageHeader />;
  }
  return <DefaultHeader />;
}
