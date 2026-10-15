import { BrowserRouter } from 'react-router-dom';
import { StoreSettingsProvider } from './contexts/StoreSettingsContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { FirebaseNotConfigured } from './components/common/FirebaseNotConfigured';
import { isFirebaseConfigured } from './services/firebase';
import { AppRouter } from './router';

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }

  return (
    <StoreSettingsProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </StoreSettingsProvider>
  );
}

export default App;
