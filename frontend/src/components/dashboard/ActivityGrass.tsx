import type { DashboardSummary } from '../../types/dashboard';
import { formatDate } from '../../lib/formatDate';

type Props = {
  data: DashboardSummary['activityGrass'];
  period: DashboardSummary['period'];
};

const colorForCount = (count: number): string => {
  if (count <= 0) return 'bg-slate-100';
  if (count === 1) return 'bg-emerald-200';
  if (count === 2) return 'bg-emerald-400';
  if (count === 3) return 'bg-emerald-500';
  return 'bg-emerald-700';
};

export default function ActivityGrass({ data, period }: Props) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const maxDay = data.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { date: '', count: 0 },
  );

  return (
    <section className="rounded-xl bg-white border border-slate-200 p-5">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">활동 잔디</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDate(period.from)} - {formatDate(period.to)} · 총 {total}건 제출
          </p>
        </div>
        {maxDay.count > 0 && (
          <p className="text-xs text-slate-500">
            최다: {formatDate(maxDay.date)} ({maxDay.count}건)
          </p>
        )}
      </header>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          이 기간에는 제출 기록이 없어요.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1">
            {data.map((d) => (
              <div
                key={d.date}
                title={`${formatDate(d.date)}: ${d.count}건`}
                className={`w-4 h-4 rounded-sm ${colorForCount(d.count)}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-100" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700" />
            <span>More</span>
          </div>
        </>
      )}
    </section>
  );
}
