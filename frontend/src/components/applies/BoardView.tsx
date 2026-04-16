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
              className="w-[280px] shrink-0 bg-[var(--color-bg-muted)] border border-[var(--color-border-subtle)] rounded-2xl flex flex-col max-h-[calc(100vh-320px)]"
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-[12.5px] font-bold text-[var(--color-text-primary)]">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border-subtle)]">
                  {list.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 overflow-y-auto">
                {list.length === 0 && (
                  <div className="py-6 text-center text-[11.5px] text-[var(--color-text-tertiary)]">
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
                      className="w-full text-left bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl p-3 hover:shadow-[0_4px_14px_-6px_rgba(79,70,229,0.25)] hover:border-indigo-200 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <CompanyAvatar item={item} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-bold text-[var(--color-text-primary)] truncate">
                            {item.company}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-secondary)] truncate mt-0.5">
                            {item.position}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.salary && (
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            · {item.salary}
                          </span>
                        )}
                      </div>
                      {dday && (
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            {item.deadline?.replace(/-/g, '.')}
                          </span>
                          <span
                            className={cn(
                              'text-[10.5px] font-bold',
                              urgent ? 'text-rose-600' : 'text-[var(--color-text-secondary)]',
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
