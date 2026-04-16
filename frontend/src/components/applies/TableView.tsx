import { useEffect, useMemo, useState } from 'react';
import {
  CompanyAvatar,
  StageBadge,
  dDayLabel,
  type ApplyItem,
} from './applyUi';
import { cn } from '../../lib/cn';
import { employmentLabel } from '../../lib/statusLabel';
import { IconChevronUp, IconChevronDown } from '../icons/Icons';
import Pagination from '../common/Pagination';
import type { JobApplyStatus } from '../../types/jobApply';

type Props = {
  items: ApplyItem[];
  onOpen: (id: number) => void;
};

type SortKey = 'company' | 'status' | 'deadline' | 'submittedAt';
type SortDir = 'asc' | 'desc';

// Status ordering for meaningful sort
const STATUS_ORDER: Record<JobApplyStatus, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  DOCUMENT_PASSED: 2,
  DOCUMENT_FAILED: 3,
  CODING_IN_PROGRESS: 4,
  CODING_PASSED: 5,
  CODING_FAILED: 6,
  ASSIGNMENT_IN_PROGRESS: 7,
  ASSIGNMENT_PASSED: 8,
  ASSIGNMENT_FAILED: 9,
  INTERVIEW_IN_PROGRESS: 10,
  INTERVIEW_PASSED: 11,
  INTERVIEW_FAILED: 12,
  FINAL_ACCEPTED: 13,
  FINAL_REJECTED: 14,
};

export default function TableView({ items, onOpen }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset to page 1 when incoming items change (filter/search changed upstream)
  useEffect(() => {
    setPage(1);
  }, [items]);

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const cmp = compare(a, b, sortKey);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const paged = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'deadline' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] border-b border-[var(--color-border-subtle)]"
            >
              <SortableTh
                label="회사 · 포지션"
                sortable
                active={sortKey === 'company'}
                dir={sortDir}
                onClick={() => toggleSort('company')}
                className="w-[28%]"
              />
              <SortableTh
                label="상태"
                sortable
                active={sortKey === 'status'}
                dir={sortDir}
                onClick={() => toggleSort('status')}
              />
              <Th>경로</Th>
              <Th>고용형태</Th>
              <SortableTh
                label="마감"
                sortable
                active={sortKey === 'deadline'}
                dir={sortDir}
                onClick={() => toggleSort('deadline')}
                className="text-right pr-6"
                alignRight
              />
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => {
              const dday = dDayLabel(item.deadline);
              const urgent = dday && dday.days <= 3 && dday.days >= 0;
              return (
                <tr
                  key={item.id}
                  onClick={() => onOpen(item.id)}
                  className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-muted)] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyAvatar item={item} />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold text-[var(--color-text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                          {item.company}
                        </div>
                        <div className="text-[12px] text-[var(--color-text-tertiary)] truncate">
                          {item.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <StageBadge item={item} />
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-secondary)]">
                    {item.channel ?? '-'}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-secondary)]">
                    {employmentLabel(item.employmentType)}
                  </td>
                  <td className="py-3 pr-6 text-right">
                    {dday ? (
                      <div>
                        <div
                          className={cn(
                            'text-[12.5px] font-bold tabular-nums',
                            urgent
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-[var(--color-text-secondary)]',
                          )}
                        >
                          {dday.label}
                        </div>
                        <div className="text-[10.5px] text-[var(--color-text-tertiary)] mt-0.5 tabular-nums">
                          {item.deadline?.replace(/-/g, '.')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        total={sorted.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}

function Th({
  children,
  className,
  alignRight,
}: {
  children: React.ReactNode;
  className?: string;
  alignRight?: boolean;
}) {
  return (
    <th
      className={cn(
        'py-3 pl-6 pr-4 first:pl-6',
        alignRight && 'text-right',
        className,
      )}
    >
      {children}
    </th>
  );
}

function SortableTh({
  label,
  sortable,
  active,
  dir,
  onClick,
  className,
  alignRight,
}: {
  label: string;
  sortable?: boolean;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
  alignRight?: boolean;
}) {
  return (
    <th
      className={cn(
        'py-3 pl-6 pr-4 first:pl-6',
        alignRight && 'text-right',
        className,
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-1 font-semibold uppercase tracking-wider transition-colors group',
            active
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {label}
          <SortArrow active={active} dir={dir} />
        </button>
      ) : (
        label
      )}
    </th>
  );
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    // Subtle idle indicator
    return (
      <span className="inline-flex flex-col -space-y-1 opacity-40">
        <IconChevronUp className="w-2.5 h-2.5" strokeWidth={3} />
        <IconChevronDown className="w-2.5 h-2.5" strokeWidth={3} />
      </span>
    );
  }
  return dir === 'asc' ? (
    <IconChevronUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" strokeWidth={3} />
  ) : (
    <IconChevronDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" strokeWidth={3} />
  );
}

function compare(a: ApplyItem, b: ApplyItem, key: SortKey): number {
  switch (key) {
    case 'company':
      return a.company.localeCompare(b.company, 'ko');
    case 'status':
      return (STATUS_ORDER[a.currentStatus] ?? 99) - (STATUS_ORDER[b.currentStatus] ?? 99);
    case 'deadline':
      return cmpDate(a.deadline, b.deadline);
    case 'submittedAt':
      return cmpDate(a.submittedAt, b.submittedAt);
  }
}

function cmpDate(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1; // nulls last
  if (b === null) return -1;
  return a.localeCompare(b);
}
