import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppFloatButton } from './WhatsAppFloatButton';
import { Seo } from './Seo';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <Seo />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
