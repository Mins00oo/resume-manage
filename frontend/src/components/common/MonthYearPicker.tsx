import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ko', ko);

type Props = {
  value: string; // "YYYY-MM" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
};

function parseYearMonth(v: string): Date | null {
  if (!v) return null;
  const [y, m] = v.split('-').map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
}

function formatYearMonth(d: Date | null): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function displayFormat(v: string): string {
  if (!v) return '';
  const [y, m] = v.split('-');
  return `${y}. ${m}.`;
}

export default function MonthYearPicker({
  value,
  onChange,
  placeholder = '년. 월.',
  className,
  disabled,
  minDate,
  maxDate,
}: Props) {
  return (
    <DatePicker
      selected={parseYearMonth(value)}
      onChange={(date: Date | null) => onChange(formatYearMonth(date))}
      dateFormat="yyyy. MM."
      showMonthYearPicker
      locale="ko"
      placeholderText={placeholder}
      className={className ?? 'input-base w-full'}
      calendarClassName="rallit-cal"
      disabled={disabled}
      autoComplete="off"
      value={displayFormat(value)}
      minDate={parseYearMonth(minDate ?? '') ?? undefined}
      maxDate={parseYearMonth(maxDate ?? '') ?? undefined}
      popperClassName="rallit-datepicker"
      popperPlacement="bottom-start"
      enableTabLoop={false}
      portalId="datepicker-portal"
      renderMonthContent={(_month, shortMonth) => (
        <span style={{ color: 'inherit' }}>{shortMonth}</span>
      )}
    />
  );
}
