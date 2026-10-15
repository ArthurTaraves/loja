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
  items: OrderItem[];
  total: number;
  customer: OrderCustomer;
  status: OrderStatus;
  stockDecremented: boolean;
  createdAt: number;
  updatedAt: number;
}
