import { useMemo, useState } from 'react';
import { stageOf, type ApplyItem } from './applyUi';
import { IconChevronLeft, IconChevronRight } from '../icons/Icons';
import { cn } from '../../lib/cn';

type Props = {
  items: ApplyItem[];
  onOpen: (id: number) => void;
};

type CalendarEvent = {
  id: string;
  applyId: number;
  kind: 'deadline' | 'submitted' | 'updated';
  label: string;
  item: ApplyItem;
};

export default function CalendarView({ items, onOpen }: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date('2026-04-15');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    items.forEach((item) => {
      const add = (date: string | null, kind: CalendarEvent['kind'], label: string) => {
        if (!date) return;
        const d = date.slice(0, 10);
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push({
          id: `${item.id}-${kind}`,
          applyId: item.id,
          kind,
          label,
          item,
        });
      };
      add(item.deadline, 'deadline', '마감');
      add(item.submittedAt, 'submitted', '제출');
    });
    return map;
  }, [items]);

  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month), [cursor]);

  const monthLabel = `${cursor.year}년 ${cursor.month + 1}월`;

  const prev = () =>
    setCursor((c) =>
      c.month === 0
        ? { year: c.year - 1, month: 11 }
        : { ...c, month: c.month - 1 },
    );
  const next = () =>
    setCursor((c) =>
      c.month === 11
        ? { year: c.year + 1, month: 0 }
        : { ...c, month: c.month + 1 },
    );
  const today = () => {
    const d = new Date('2026-04-15');
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const todayIso = '2026-04-15';

  const prevYear = () => setCursor((c) => ({ ...c, year: c.year - 1 }));
  const nextYear = () => setCursor((c) => ({ ...c, year: c.year + 1 }));

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Year nav */}
          <button
            type="button"
            onClick={prevYear}
            className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors text-[11px] font-bold"
          >
            ‹‹
          </button>
          {/* Month nav */}
          <button
            type="button"
            onClick={prev}
            className="w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)] min-w-[120px] text-center">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={next}
            className="w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors"
          >
            <IconChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextYear}
            className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors text-[11px] font-bold"
          >
            ››
          </button>
          <button
            type="button"
            onClick={today}
            className="ml-2 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] hover:brightness-95 rounded-lg transition-colors"
          >
            오늘
          </button>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
          <LegendDot color="#ef4444" label="마감" />
          <LegendDot color="#6366f1" label="제출" />
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={cn(
              'text-center py-2 text-[11px] font-bold bg-[var(--color-bg-muted)] border-b border-[var(--color-border-subtle)]',
              i === 0 && 'text-rose-500',
              i === 6 && 'text-blue-500',
              i !== 0 && i !== 6 && 'text-[var(--color-text-secondary)]',
            )}
          >
            {d}
          </div>
        ))}

        {/* Cells */}
        {cells.map((cell, idx) => {
          const iso = cell.iso;
          const events = eventsByDate.get(iso) ?? [];
          const isToday = iso === todayIso;
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          return (
            <div
              key={iso}
              className={cn(
                'min-h-[110px] border-r border-b border-[var(--color-border-subtle)] last:border-r-0 p-1.5 relative flex flex-col',
                !cell.inMonth && 'opacity-40',
                idx % 7 === 6 && 'border-r-0',
                idx >= 35 && 'border-b-0',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-[11.5px] font-semibold',
                    !cell.inMonth
                      ? 'text-[var(--color-text-tertiary)]'
                      : isWeekend
                        ? idx % 7 === 0
                          ? 'text-rose-500'
                          : 'text-blue-500'
                        : 'text-[var(--color-text-primary)]',
                    isToday &&
                      'w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center',
                  )}
                >
                  {cell.day}
                </span>
              </div>
              <div className="mt-1 space-y-1 overflow-hidden">
                {events.slice(0, 3).map((ev) => {
                  const s = stageOf(ev.item);
                  const isDeadline = ev.kind === 'deadline';
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onOpen(ev.applyId)}
                      className={cn(
                        'w-full text-left px-1.5 py-1 rounded text-[10.5px] font-medium truncate border',
                        isDeadline
                          ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                          : `${s.bg} ${s.text} ${s.border} hover:brightness-95`,
                      )}
                      title={`${ev.item.company} · ${ev.label}`}
                    >
                      <span className="mr-1">
                        {isDeadline ? '⏰' : '📤'}
                      </span>
                      {ev.item.company}
                    </button>
                  );
                })}
                {events.length > 3 && (
                  <div className="text-[10px] text-[var(--color-text-tertiary)] pl-1.5">
                    +{events.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    cells.push({ iso: toIso(d), day, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({ iso: toIso(d), day, inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const lastDate = new Date(last.iso);
    lastDate.setDate(lastDate.getDate() + 1);
    cells.push({
      iso: toIso(lastDate),
      day: lastDate.getDate(),
      inMonth: lastDate.getMonth() === month,
    });
  }
  return cells;
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
