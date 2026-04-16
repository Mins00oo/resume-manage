import { useMemo, useState } from 'react';
import {
  CompanyAvatar,
  StageBadge,
  dDayLabel,
  type ApplyItem,
} from './applyUi';
import { cn } from '../../lib/cn';

type Props = {
  items: ApplyItem[];
  onOpen: (id: number) => void;
};

type Entry = {
  date: string; // ISO
  kind: 'created' | 'submitted' | 'updated' | 'deadline';
  label: string;
  item: ApplyItem;
};

export default function TimelineView({ items, onOpen }: Props) {
  const entries = useMemo(() => {
    const out: Entry[] = [];
    items.forEach((item) => {
      if (item.submittedAt) out.push({ date: item.submittedAt, kind: 'submitted', label: '지원서 제출', item });
      if (item.updatedAt) out.push({ date: item.updatedAt, kind: 'updated', label: '최종 수정', item });
      if (item.deadline) out.push({ date: item.deadline, kind: 'deadline', label: '마감일', item });
    });
    return out.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [items]);

  // Group by month
  const byMonth = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach((e) => {
      const key = e.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [entries]);

  const INITIAL_MONTHS = 3;
  const LOAD_MORE_STEP = 3;
  const [visibleMonths, setVisibleMonths] = useState(INITIAL_MONTHS);
  const visibleGroups = byMonth.slice(0, visibleMonths);
  const hasMore = visibleMonths < byMonth.length;

  return (
    <div className="p-6">
      {visibleGroups.map(([monthKey, group]) => {
        const [y, m] = monthKey.split('-');
        return (
          <div key={monthKey} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full">
                {y}.{m}
              </div>
              <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
              <div className="text-[11px] text-[var(--color-text-secondary)]">{group.length}건</div>
            </div>

            <ol className="relative border-l-2 border-[var(--color-border-subtle)] ml-3 space-y-3">
              {group.map((entry, i) => {
                const dday = entry.kind === 'deadline' ? dDayLabel(entry.date) : null;
                const urgent = dday && dday.days <= 3 && dday.days >= 0;
                return (
                  <li key={`${entry.item.id}-${entry.kind}-${i}`} className="relative pl-6">
                    <span
                      className={cn(
                        'absolute -left-[7px] top-4 w-3 h-3 rounded-full ring-4 ring-[var(--color-bg-surface)]',
                        kindColor(entry.kind),
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => onOpen(entry.item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border-subtle)] text-left group transition-colors"
                    >
                      <CompanyAvatar item={entry.item} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13.5px] font-bold text-[var(--color-text-primary)] group-hover:text-indigo-700 transition-colors">
                            {entry.item.company}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">·</span>
                          <span className="text-[12px] text-[var(--color-text-secondary)]">
                            {entry.item.position}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn(
                              'text-[10.5px] font-semibold uppercase tracking-wider',
                              kindText(entry.kind),
                            )}
                          >
                            {entry.label}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">
                            {entry.date.replace(/-/g, '.')}
                          </span>
                          {urgent && (
                            <span className="text-[10.5px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                              {dday.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <StageBadge item={entry.item} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
      {hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={() => setVisibleMonths((v) => v + LOAD_MORE_STEP)}
            className="px-5 py-2.5 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
          >
            이전 {LOAD_MORE_STEP}개월 더 보기 ({byMonth.length - visibleMonths}개월 남음)
          </button>
        </div>
      )}
    </div>
  );
}

function kindColor(kind: Entry['kind']) {
  switch (kind) {
    case 'deadline':
      return 'bg-rose-500';
    case 'submitted':
      return 'bg-indigo-500';
    case 'updated':
      return 'bg-violet-500';
    case 'created':
      return 'bg-slate-400';
  }
}

function kindText(kind: Entry['kind']) {
  switch (kind) {
    case 'deadline':
      return 'text-rose-600';
    case 'submitted':
      return 'text-indigo-600';
    case 'updated':
      return 'text-violet-600';
    case 'created':
      return 'text-[var(--color-text-secondary)]';
  }
}
