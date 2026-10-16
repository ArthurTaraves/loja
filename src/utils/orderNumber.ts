export function formatOrderNumber(n: number): string {
  return `#${String(n).padStart(4, '0')}`;
}
