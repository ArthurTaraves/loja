import { useEffect, useState } from 'react';
import { listAllOrders, updateOrderStatus } from '../../services/orders';
import type { Order, OrderStatus } from '../../types';
import { formatBRL } from '../../utils/currency';

const STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[];

function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'novo':
      return 'bg-blue-100 text-blue-800';
    case 'confirmado':
      return 'bg-amber-100 text-amber-800';
    case 'enviado':
      return 'bg-purple-100 text-purple-800';
    case 'concluido':
      return 'bg-green-100 text-green-800';
    case 'cancelado':
      return 'bg-gray-200 text-gray-600';
  }
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    listAllOrders()
      .then(setOrders)
      .catch((error) => console.error('Falha ao carregar pedidos:', error))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    try {
      await updateOrderStatus(order, status);
      reload();
    } catch (error) {
      console.error('Falha ao atualizar status do pedido:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Pedidos</h2>
        <p className="text-sm text-gray-500">
          Ao confirmar um pedido o estoque é debitado; ao cancelar um pedido já confirmado, o estoque volta.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum pedido ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-md border border-gray-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-xs text-gray-500">{order.customer.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="mt-2 flex flex-col gap-1 text-xs text-gray-600">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}x {item.name}
                    {item.variationLabel ? ` (${item.variationLabel})` : ''} — {formatBRL(item.unitPrice * item.quantity)}
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-sm font-semibold text-gray-900">Total: {formatBRL(order.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
