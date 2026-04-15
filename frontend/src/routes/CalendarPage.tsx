import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApplies } from '../mocks/data';
import CalendarView from '../components/applies/CalendarView';
import { dDayLabel, CompanyAvatar, StageBadge } from '../components/applies/applyUi';
import { cn } from '../lib/cn';

export default function CalendarPage() {
  const navigate = useNavigate();

  const upcoming = useMemo(
    () =>
      mockApplies
        .filter((a) => a.deadline && new Date(a.deadline) >= new Date('2026-04-15'))
        .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1)),
    [],
  );

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8 card overflow-hidden">
        <CalendarView items={mockApplies} onOpen={(id) => navigate(`/applies/${id}`)} />
      </div>
      <div className="col-span-12 lg:col-span-4 card p-5">
        <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4">
          다가오는 일정
        </div>
        <div className="space-y-2">
          {upcoming.length === 0 && (
            <div className="py-8 text-center text-[12px] text-slate-500">
              예정된 일정이 없어요
            </div>
          )}
          {upcoming.map((item) => {
            const dday = dDayLabel(item.deadline);
            const urgent = dday && dday.days <= 3 && dday.days >= 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/applies/${item.id}`)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <CompanyAvatar item={item} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-slate-900 truncate">
                    {item.company}
                  </div>
                  <div className="mt-0.5">
                    <StageBadge item={item} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-[11.5px] font-bold',
                      urgent ? 'text-rose-600' : 'text-slate-700',
                    )}
                  >
                    {dday?.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {item.deadline?.replace(/-/g, '.')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
