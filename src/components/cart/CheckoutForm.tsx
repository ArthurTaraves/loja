import { useState, type FormEvent } from 'react';
import { useCart } from '../../hooks/useCart';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { createOrder } from '../../services/orders';
import { buildOrderMessage, buildWhatsAppUrl } from '../../utils/whatsapp';
import { formatBRL } from '../../utils/currency';
import { isValidWhatsappPhone } from '../../utils/validators';
import type { OrderItem } from '../../types';

export function CheckoutForm({ onSuccess }: { onSuccess?: () => void }) {
  const { lines, subtotal, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasStockIssue = lines.some((line) => line.quantity > line.stockAvailable);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (!isValidWhatsappPhone(phone)) {
      setError('Informe um telefone válido, com DDI (ex: 5511999998888).');
      return;
    }
    if (hasStockIssue) {
      setError('Algum item do carrinho não tem estoque suficiente. Ajuste a quantidade antes de continuar.');
      return;
    }
    if (!settings.whatsapp.phone) {
      setError('A loja ainda não configurou um número de WhatsApp para receber pedidos.');
      return;
    }

    const items: OrderItem[] = lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      variationLabel: line.variationSummary,
      variations: line.variations,
      imageUrl: line.product.images[0]?.url ?? '',
    }));

    setSubmitting(true);
    try {
      await createOrder({
        items,
        total: subtotal,
        customer: { name: name.trim(), phone: phone.trim(), address: address.trim() || undefined },
        status: 'novo',
        stockDecremented: false,
      });

      const itensText = lines
        .map(
          (line) =>
            `${line.quantity}x ${line.product.name}${line.variationSummary ? ` (${line.variationSummary})` : ''} - ${formatBRL(line.lineTotal)}`,
        )
        .join('\n');

      const message = buildOrderMessage(settings.whatsapp.orderMessageTemplate, {
        nome: name.trim(),
        itens: itensText,
        total: formatBRL(subtotal),
        endereco: address.trim() || 'Não informado',
      });

      window.open(buildWhatsAppUrl(settings.whatsapp.phone, message), '_blank', 'noopener,noreferrer');
      clearCart();
      onSuccess?.();
    } catch (err) {
      console.error('Falha ao finalizar pedido:', err);
      setError('Não foi possível finalizar o pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 border-t border-secondary/20 pt-6">
      <h2 className="text-base font-semibold text-text">Finalizar pedido</h2>

      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-md border border-secondary/30 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Telefone (com DDI)
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="5511999998888"
          required
          className="rounded-md border border-secondary/30 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Endereço (opcional)
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          className="rounded-md border border-secondary/30 px-3 py-2"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || lines.length === 0}
        className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Enviando...' : 'Finalizar pedido pelo WhatsApp'}
      </button>
    </form>
  );
}
