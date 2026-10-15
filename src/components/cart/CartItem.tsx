import type { CartLine } from '../../contexts/CartContext';
import { formatBRL } from '../../utils/currency';

interface CartItemProps {
  line: CartLine;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}

export function CartItem({ line, onUpdateQuantity, onRemove }: CartItemProps) {
  const cover = line.product.images[0]?.url;
  const exceedsStock = line.quantity > line.stockAvailable;

  return (
    <div className="flex gap-3 border-b border-secondary/20 py-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary/10">
        {cover ? (
          <img src={cover} alt={line.product.name} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-text">{line.product.name}</p>
        {line.variationSummary && <p className="text-xs text-secondary">{line.variationSummary}</p>}
        <p className="text-sm font-semibold text-primary">{formatBRL(line.unitPrice)}</p>
        {exceedsStock && (
          <p className="text-xs text-red-600">Apenas {line.stockAvailable} em estoque</p>
        )}

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(line.key, line.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded border border-secondary/30 text-text"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-6 text-center text-sm">{line.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(line.key, line.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded border border-secondary/30 text-text"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onRemove(line.key)}
            className="ml-2 text-xs text-secondary underline hover:text-red-600"
          >
            Remover
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-text">{formatBRL(line.lineTotal)}</p>
    </div>
  );
}
