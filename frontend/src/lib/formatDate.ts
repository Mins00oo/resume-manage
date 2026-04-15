/**
 * ISO 날짜 문자열을 한국식 표기로 변환.
 * - `2025-04-15` -> `2025.04.15`
 * - `2025-04-15T12:30:00Z` -> `2025.04.15`
 * - null / undefined -> `-`
 */
export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '-';
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return iso;
  return `${y}.${m}.${d}`;
};

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
};
