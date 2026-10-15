/** Aceita números com DDI (ex: 5511999998888). Exige só dígitos, 10 a 15 caracteres (padrão E.164). */
export function isValidWhatsappPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return /^\d{10,15}$/.test(digitsOnly);
}
