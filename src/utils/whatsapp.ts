export function buildWhatsAppUrl(phone: string, message: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${digitsOnly}?${params.toString()}`;
}

export interface OrderMessageData {
  nome: string;
  itens: string;
  total: string;
  endereco: string;
}

export function buildOrderMessage(template: string, data: OrderMessageData): string {
  return template
    .replaceAll('{nome}', data.nome)
    .replaceAll('{itens}', data.itens)
    .replaceAll('{total}', data.total)
    .replaceAll('{endereco}', data.endereco);
}
