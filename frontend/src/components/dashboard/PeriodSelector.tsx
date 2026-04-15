import type { DashboardPeriod } from '../../lib/api/dashboard';

type Props = {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
};

const OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: '1m', label: '1개월' },
  { value: '3m', label: '3개월' },
  { value: '6m', label: '6개월' },
  { value: 'all', label: '전체' },
];

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === opt.value
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
