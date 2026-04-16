/** Format phone: 01012345678 → 010-1234-5678 */
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/** Strip hyphens for API */
export function stripPhone(value: string): string {
  return value.replace(/\D/g, '');
}
