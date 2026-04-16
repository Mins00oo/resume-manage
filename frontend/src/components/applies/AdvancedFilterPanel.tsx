import { cn } from '../../lib/cn';
import Dropdown from '../common/Dropdown';
import { IconX } from '../icons/Icons';

export type AdvancedFilters = {
  years: number[]; // multi-select
  submittedFrom: string; // yyyy-MM-dd or ''
  submittedTo: string;
  deadlineFrom: string;
  deadlineTo: string;
  tags: string[]; // multi-select
  channel: string; // single or ''
  location: string;
};

export const emptyAdvancedFilters: AdvancedFilters = {
  years: [],
  submittedFrom: '',
  submittedTo: '',
  deadlineFrom: '',
  deadlineTo: '',
  tags: [],
  channel: '',
  location: '',
};

export function hasAnyAdvancedFilter(f: AdvancedFilters): boolean {
  return (
    f.years.length > 0 ||
    !!f.submittedFrom ||
    !!f.submittedTo ||
    !!f.deadlineFrom ||
    !!f.deadlineTo ||
    f.tags.length > 0 ||
    !!f.channel ||
    !!f.location
  );
}

type Props = {
  filters: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
  onClose: () => void;
  availableYears: number[];
  availableTags: string[];
  availableChannels: string[];
};

export default function AdvancedFilterPanel({
  filters,
  onChange,
  onClose,
  availableYears,
  availableTags,
  availableChannels,
}: Props) {
  const update = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K],
  ) => onChange({ ...filters, [key]: value });

  const toggleYear = (y: number) => {
    update(
      'years',
      filters.years.includes(y)
        ? filters.years.filter((v) => v !== y)
        : [...filters.years, y],
    );
  };
  const toggleTag = (t: string) => {
    update(
      'tags',
      filters.tags.includes(t)
        ? filters.tags.filter((v) => v !== t)
        : [...filters.tags, t],
    );
  };

  return (
    <div
      className="px-5 py-4 border-b border-[var(--color-border-subtle)]"
      style={{ background: 'var(--color-bg-muted)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] font-semibold tracking-wide uppercase text-[var(--color-text-tertiary)]">
          Advanced filter
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(emptyAdvancedFilters)}
            className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="고급 필터 닫기"
            className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] flex items-center justify-center transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Year chips */}
        <FilterSection label="연도">
          <div className="flex flex-wrap gap-1.5">
            {availableYears.map((y) => {
              const selected = filters.years.includes(y);
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => toggleYear(y)}
                  className={cn(
                    'px-3 h-[30px] rounded-full text-[12px] font-semibold transition-colors',
                    selected
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]',
                  )}
                >
                  {y}
                </button>
              );
            })}
            {availableYears.length === 0 && (
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                선택 가능한 연도가 없어요
              </span>
            )}
          </div>
        </FilterSection>

        {/* Channel */}
        <FilterSection label="지원 경로">
          <Dropdown
            value={filters.channel}
            onChange={(v) => update('channel', v as string)}
            options={availableChannels.map((c) => ({ value: c, label: c }))}
            emptyLabel="전체 경로"
            className="w-full"
          />
        </FilterSection>

        {/* Submitted date range */}
        <FilterSection label="제출일">
          <div className="flex items-center gap-2">
            <DateInput
              value={filters.submittedFrom}
              onChange={(v) => update('submittedFrom', v)}
              ariaLabel="제출일 시작"
            />
            <span className="text-[var(--color-text-tertiary)] text-[12px]">~</span>
            <DateInput
              value={filters.submittedTo}
              onChange={(v) => update('submittedTo', v)}
              ariaLabel="제출일 종료"
            />
          </div>
        </FilterSection>

        {/* Deadline date range */}
        <FilterSection label="마감일">
          <div className="flex items-center gap-2">
            <DateInput
              value={filters.deadlineFrom}
              onChange={(v) => update('deadlineFrom', v)}
              ariaLabel="마감일 시작"
            />
            <span className="text-[var(--color-text-tertiary)] text-[12px]">~</span>
            <DateInput
              value={filters.deadlineTo}
              onChange={(v) => update('deadlineTo', v)}
              ariaLabel="마감일 종료"
            />
          </div>
        </FilterSection>

        {/* Tags */}
        <FilterSection label="태그" span={2}>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((t) => {
              const selected = filters.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={cn(
                    'px-2.5 h-[28px] rounded-full text-[11.5px] font-semibold transition-colors',
                    selected
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]',
                  )}
                >
                  #{t}
                </button>
              );
            })}
            {availableTags.length === 0 && (
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                태그가 없어요
              </span>
            )}
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection label="위치" span={2}>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="예: 서울 강남, 판교, 원격"
            className="w-full h-[38px] px-3 text-[13px] rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({
  label,
  span,
  children,
}: {
  label: string;
  span?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(span === 2 && 'md:col-span-2')}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function DateInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="date"
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 h-[38px] px-3 text-[13px] rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
    />
  );
}
