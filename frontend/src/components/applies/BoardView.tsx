import {
  CompanyAvatar,
  stageMeta,
  toStage,
  dDayLabel,
  type ApplyItem,
  type Stage,
} from './applyUi';
import { cn } from '../../lib/cn';

type Props = {
  items: ApplyItem[];
  onOpen: (id: number) => void;
};

const COLUMNS: Stage[] = [
  'draft',
  'submitted',
  'document',
  'coding',
  'assignment',
  'interview',
  'offer',
  'rejected',
];

export default function BoardView({ items, onOpen }: Props) {
  const grouped: Record<Stage, ApplyItem[]> = {
    draft: [],
    submitted: [],
    document: [],
    coding: [],
    assignment: [],
    interview: [],
    offer: [],
    rejected: [],
  };
  items.forEach((item) => {
    grouped[toStage(item.currentStatus)].push(item);
  });

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map((stage) => {
          const meta = stageMeta[stage];
          const list = grouped[stage];
          return (
            <div
              key={stage}
              className="w-[280px] shrink-0 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col max-h-[calc(100vh-320px)]"
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-[12.5px] font-bold text-slate-800">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {list.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 overflow-y-auto">
                {list.length === 0 && (
                  <div className="py-6 text-center text-[11.5px] text-slate-400">
                    비어 있음
                  </div>
                )}
                {list.map((item) => {
                  const dday = dDayLabel(item.deadline);
                  const urgent = dday && dday.days <= 3 && dday.days >= 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onOpen(item.id)}
                      className="w-full text-left bg-white border border-slate-200/70 rounded-xl p-3 hover:shadow-[0_4px_14px_-6px_rgba(79,70,229,0.25)] hover:border-indigo-200 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <CompanyAvatar item={item} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-bold text-slate-900 truncate">
                            {item.company}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.position}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.salary && (
                          <span className="text-[10px] text-slate-400">
                            · {item.salary}
                          </span>
                        )}
                      </div>
                      {dday && (
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">
                            {item.deadline?.replace(/-/g, '.')}
                          </span>
                          <span
                            className={cn(
                              'text-[10.5px] font-bold',
                              urgent ? 'text-rose-600' : 'text-slate-600',
                            )}
                          >
                            {dday.label}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
