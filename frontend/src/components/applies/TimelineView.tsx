import { useMemo } from 'react';
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
      if (item.createdAt) out.push({ date: item.createdAt, kind: 'created', label: '지원 생성', item });
      if (item.submittedAt) out.push({ date: item.submittedAt, kind: 'submitted', label: '지원서 제출', item });
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

  return (
    <div className="p-6">
      {byMonth.map(([monthKey, group]) => {
        const [y, m] = monthKey.split('-');
        return (
          <div key={monthKey} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {y}.{m}
              </div>
              <div className="flex-1 h-px bg-slate-200" />
              <div className="text-[11px] text-slate-500">{group.length}건</div>
            </div>

            <ol className="relative border-l-2 border-slate-200 ml-3 space-y-3">
              {group.map((entry, i) => {
                const dday = entry.kind === 'deadline' ? dDayLabel(entry.date) : null;
                const urgent = dday && dday.days <= 3 && dday.days >= 0;
                return (
                  <li key={`${entry.item.id}-${entry.kind}-${i}`} className="relative pl-6">
                    <span
                      className={cn(
                        'absolute -left-[7px] top-4 w-3 h-3 rounded-full ring-4 ring-white',
                        kindColor(entry.kind),
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => onOpen(entry.item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 text-left group transition-colors"
                    >
                      <CompanyAvatar item={entry.item} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13.5px] font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {entry.item.company}
                          </span>
                          <span className="text-[11px] text-slate-400">·</span>
                          <span className="text-[12px] text-slate-500">
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
                          <span className="text-[11px] text-slate-400">
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
      return 'text-slate-500';
  }
}
