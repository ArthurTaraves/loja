import type { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'novo' | 'confirmado' | 'enviado' | 'concluido' | 'cancelado';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  /** Texto pronto para exibição/WhatsApp, ex: "Tamanho: M, Cor: Azul". */
  variationLabel?: string;
  /** Seleção estruturada (grupo -> opção), usada para debitar/devolver estoque. */
  variations?: Record<string, string>;
  imageUrl: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
}

export interface Order {
  id: string;
  /** Número sequencial amigável (1, 2, 3...), atribuído em transação via system/orderCounter. */
  orderNumber: number;
  items: OrderItem[];
  total: number;
  customer: OrderCustomer;
  status: OrderStatus;
  stockDecremented: boolean;
  /** Sempre gravado com serverTimestamp() — as rules exigem createdAt == request.time na criação. */
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
