import { useNavigate } from 'react-router-dom';
import type { DashboardSummary } from '../../types/dashboard';
import { formatDate } from '../../lib/formatDate';

type Props = {
  data: DashboardSummary['upcomingDeadlines'];
};

const dDayColor = (dDay: number): string => {
  if (dDay <= 1) return 'bg-rose-100 text-rose-700';
  if (dDay <= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
};

const dDayLabel = (dDay: number): string => {
  if (dDay === 0) return 'D-DAY';
  return `D-${dDay}`;
};

export default function UpcomingDeadlinesCard({ data }: Props) {
  const navigate = useNavigate();

  return (
    <section className="rounded-xl bg-white border border-slate-200 p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">다가오는 마감일</h3>
        <span className="text-xs text-slate-400">7일 이내</span>
      </header>
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-500">마감 임박한 지원이 없어요</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.map((item) => (
            <li
              key={item.id}
              className="py-2 flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors"
              onClick={() => navigate(`/applies/${item.id}`)}
            >
              <span
                className={`shrink-0 text-xs font-bold px-2 py-1 rounded-md ${dDayColor(item.dDay)}`}
              >
                {dDayLabel(item.dDay)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.company}
                </p>
                {item.position && (
                  <p className="text-xs text-slate-500 truncate">{item.position}</p>
                )}
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {formatDate(item.deadline)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
