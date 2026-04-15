import type { DashboardSummary } from '../../types/dashboard';

type Props = {
  data: DashboardSummary['summaryStrip'];
};

const cards = [
  { key: 'draft', label: '작성중', accent: 'text-slate-700', bg: 'bg-slate-100' },
  { key: 'submitted', label: '누적 지원', accent: 'text-blue-700', bg: 'bg-blue-50' },
  { key: 'inProgress', label: '진행중', accent: 'text-violet-700', bg: 'bg-violet-50' },
  { key: 'accepted', label: '합격', accent: 'text-emerald-700', bg: 'bg-emerald-50' },
  { key: 'rejected', label: '탈락', accent: 'text-rose-700', bg: 'bg-rose-50' },
] as const;

export default function SummaryStrip({ data }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-1`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${c.bg} border ${c.accent.replace('text-', 'border-')}`}
            />
            <span className="text-xs font-medium text-slate-500">{c.label}</span>
          </div>
          <span className={`text-2xl font-bold ${c.accent}`}>
            {data[c.key]}
            <span className="text-sm font-normal text-slate-400 ml-1">건</span>
          </span>
        </div>
      ))}
    </div>
  );
}
