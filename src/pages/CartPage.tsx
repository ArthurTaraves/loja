import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { CheckoutForm } from '../components/cart/CheckoutForm';
import { formatBRL } from '../utils/currency';

export function CartPage() {
  const { lines, loading, subtotal, updateQuantity, removeItem } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-xl font-semibold text-primary">Seu carrinho</h1>

      {loading ? (
        <p className="text-secondary">Carregando carrinho...</p>
      ) : lines.length === 0 ? (
        <div className="py-10 text-center">
          {orderPlaced ? (
            <p className="mb-4 text-text">
              Pedido enviado! Confira a conversa aberta no WhatsApp para confirmar com a loja.
            </p>
          ) : (
            <p className="mb-4 text-secondary">Seu carrinho está vazio.</p>
          )}
          <Link to="/produtos" className="text-primary underline">
            Ver produtos
          </Link>
        </div>
      ) : (
        <>
          <div>
            {lines.map((line) => (
              <CartItem key={line.key} line={line} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-secondary/20 pt-4">
            <span className="text-base font-medium text-text">Total</span>
            <span className="text-lg font-semibold text-primary">{formatBRL(subtotal)}</span>
          </div>

          <CheckoutForm onSuccess={() => setOrderPlaced(true)} />
        </>
      )}
    </div>
  );
}
