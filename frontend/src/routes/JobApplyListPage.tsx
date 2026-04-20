import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobApplyApi } from '../lib/api/jobApply';
import type { JobApplyStatus, EmploymentType } from '../types/jobApply';
import {
  IconTable,
  IconBoard,
  IconCalendar,
  IconTimeline,
  IconSearch,
  IconPlus,
  IconFilter,
} from '../components/icons/Icons';
import { cn } from '../lib/cn';
import TableView from '../components/applies/TableView';
import BoardView from '../components/applies/BoardView';
import CalendarView from '../components/applies/CalendarView';
import TimelineView from '../components/applies/TimelineView';
import AdvancedFilterPanel, {
  emptyAdvancedFilters,
  hasAnyAdvancedFilter,
  type AdvancedFilters,
} from '../components/applies/AdvancedFilterPanel';

type ViewMode = 'table' | 'board' | 'calendar' | 'timeline';

const VIEWS: { key: ViewMode; label: string; Icon: typeof IconTable }[] = [
  { key: 'table', label: '테이블', Icon: IconTable },
  { key: 'board', label: '보드', Icon: IconBoard },
  { key: 'calendar', label: '캘린더', Icon: IconCalendar },
  { key: 'timeline', label: '타임라인', Icon: IconTimeline },
];

type StageFilter = 'all' | 'active' | 'passed' | 'failed';

const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행중' },
  { key: 'passed', label: '합격/통과' },
  { key: 'failed', label: '탈락' },
];

function matchStageFilter(status: JobApplyStatus, filter: StageFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'passed')
    return (
      status === 'FINAL_ACCEPTED' ||
      status === 'INTERVIEW_PASSED' ||
      status === 'CODING_PASSED' ||
      status === 'DOCUMENT_PASSED' ||
      status === 'ASSIGNMENT_PASSED'
    );
  if (filter === 'failed')
    return (
      status === 'FINAL_REJECTED' ||
      status === 'INTERVIEW_FAILED' ||
      status === 'CODING_FAILED' ||
      status === 'DOCUMENT_FAILED' ||
      status === 'ASSIGNMENT_FAILED'
    );
  return (
    status === 'DRAFT' ||
    status === 'SUBMITTED' ||
    status === 'CODING_IN_PROGRESS' ||
    status === 'ASSIGNMENT_IN_PROGRESS' ||
    status === 'INTERVIEW_IN_PROGRESS'
  );
}

export default function JobApplyListPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('table');
  const [stage, setStage] = useState<StageFilter>('all');
  const [search, setSearch] = useState('');
  const [employment, setEmployment] = useState<EmploymentType | ''>('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(emptyAdvancedFilters);

  // Build API params from filters
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: 0,
      size: 200, // Fetch a large page; client-side sub-filtering by stage
    };
    if (employment) params.employmentType = employment;
    if (search) params.search = search;
    if (advanced.years.length === 1) params.year = advanced.years[0];
    if (advanced.submittedFrom) params.from = advanced.submittedFrom;
    if (advanced.submittedTo) params.to = advanced.submittedTo;
    return params;
  }, [employment, search, advanced]);

  const {
    data: pageData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['jobApplies', apiParams],
    queryFn: () => jobApplyApi.list(apiParams),
  });

  const allItems = useMemo(() => pageData?.content ?? [], [pageData]);

  // Client-side filtering for stage tabs, channel, deadline range
  const filtered = useMemo(() => {
    return allItems.filter((a) => {
      if (!matchStageFilter(a.currentStatus, stage)) return false;
      // Advanced filters that need client-side processing
      if (advanced.deadlineFrom && (a.deadline ?? '') < advanced.deadlineFrom)
        return false;
      if (advanced.deadlineTo && (a.deadline ?? '') > advanced.deadlineTo)
        return false;
      if (advanced.channel && a.channel !== advanced.channel) return false;
      return true;
    });
  }, [allItems, stage, advanced]);

  // Stats from the fetched data
  const stats = useMemo(() => {
    const all = allItems;
    const active = all.filter(
      (a) =>
        a.currentStatus !== 'FINAL_ACCEPTED' &&
        a.currentStatus !== 'FINAL_REJECTED' &&
        !a.currentStatus.endsWith('_FAILED'),
    ).length;
    const passed = all.filter((a) => a.currentStatus === 'FINAL_ACCEPTED').length;
    const failed = all.filter(
      (a) =>
        a.currentStatus.endsWith('_FAILED') ||
        a.currentStatus === 'FINAL_REJECTED',
    ).length;
    const rate = all.length
      ? Math.round(
          (all.filter((a) => !a.currentStatus.endsWith('_FAILED')).length /
            all.length) *
            100,
        )
      : 0;
    return { total: pageData?.totalElements ?? all.length, active, passed, failed, rate };
  }, [allItems, pageData]);

  // Count per stage filter (for chip badges)
  const stageCounts = useMemo(() => {
    const count = (key: StageFilter) =>
      allItems.filter((a) => matchStageFilter(a.currentStatus, key)).length;
    return {
      all: count('all'),
      active: count('active'),
      passed: count('passed'),
      failed: count('failed'),
    } satisfies Record<StageFilter, number>;
  }, [allItems]);

  // Available channels for advanced filter
  const availableChannels = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((a) => a.channel && set.add(a.channel));
    return [...set].sort();
  }, [allItems]);

  const resetFilters = () => {
    setSearch('');
    setStage('all');
    setEmployment('');
    setAdvanced(emptyAdvancedFilters);
  };

  const hasAnyFilter =
    !!search ||
    stage !== 'all' ||
    !!employment ||
    hasAnyAdvancedFilter(advanced);

  const advancedActive = hasAnyAdvancedFilter(advanced);

  return (
    <div className="space-y-6">
      {/* ---------- Summary strip ---------- */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatMini label="전체 지원" value={isLoading ? '-' : stats.total} color="indigo" />
        <StatMini label="진행 중" value={isLoading ? '-' : stats.active} color="violet" />
        <StatMini label="최종 합격" value={isLoading ? '-' : stats.passed} color="emerald" />
        <StatMini label="탈락" value={isLoading ? '-' : stats.failed} color="rose" />
        <div className="col-span-2 md:col-span-1">
          <StatMini label="통과율" value={isLoading ? '-' : `${stats.rate}%`} color="amber" />
        </div>
      </section>

      {/* ---------- View tabs + toolbar ---------- */}
      <section className="card overflow-hidden">
        {/* Row 1: view tabs + primary CTA */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3">
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl overflow-x-auto min-w-0"
            style={{ background: 'var(--color-bg-muted)' }}
          >
            {VIEWS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-all shrink-0',
                  view === key
                    ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-border-subtle)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon className="w-[15px] h-[15px]" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/applies/new')}
            className="btn-primary shrink-0"
          >
            <IconPlus className="w-4 h-4" /><span className="hidden sm:inline">새 지원 등록</span>
          </button>
        </div>

        {/* Row 2: filters/toolbar */}
        <div
          className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)]"
          style={{ background: 'color-mix(in srgb, var(--color-bg-muted) 50%, transparent)' }}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-0 md:min-w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="회사, 포지션 검색"
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Stage filter chips - horizontal scroll on mobile */}
          <div
            className="flex items-center gap-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg p-0.5 overflow-x-auto flex-nowrap shrink-0"
          >
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStage(f.key)}
                className={cn(
                  'px-2.5 md:px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors inline-flex items-center gap-1 md:gap-1.5 shrink-0 whitespace-nowrap',
                  stage === f.key
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/[0.12] dark:text-indigo-300'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    'text-[11px] tabular-nums',
                    stage === f.key ? 'opacity-80' : 'opacity-60',
                  )}
                >
                  {stageCounts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Employment dropdown + advanced filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Dropdown
              value={employment}
              onChange={(v) => setEmployment(v as EmploymentType | '')}
              options={[
                { value: 'NEW', label: '신입' },
                { value: 'EXPERIENCED', label: '경력' },
                { value: 'INTERN', label: '인턴' },
                { value: 'CONTRACT', label: '계약직' },
              ]}
              emptyLabel="전체 고용형태"
            />

            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-colors shrink-0',
                advancedOpen || advancedActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/[0.12] dark:text-indigo-300'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]',
              )}
            >
              <IconFilter className="w-4 h-4" />
              <span className="hidden sm:inline">고급 필터</span>
              {advancedActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>

            <div className="ml-auto text-[12px] text-[var(--color-text-tertiary)] tabular-nums">
              <span className="font-semibold text-[var(--color-text-secondary)]">
                {filtered.length.toLocaleString()}
              </span>
              건 표시
            </div>
          </div>
        </div>

        {/* Row 3: advanced filter panel */}
        {advancedOpen && (
          <AdvancedFilterPanel
            filters={advanced}
            onChange={setAdvanced}
            onClose={() => setAdvancedOpen(false)}
            availableYears={[]}
            availableTags={[]}
            availableChannels={availableChannels}
          />
        )}

        {/* ---------- View body ---------- */}
        <div style={{ background: 'var(--color-bg-surface)' }}>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-[13px] text-[var(--color-text-tertiary)] mt-4">
                지원 목록을 불러오는 중...
              </div>
            </div>
          ) : isError ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="text-5xl mb-3">&#9888;&#65039;</div>
              <div className="text-[15px] font-bold text-[var(--color-text-primary)]">
                데이터를 불러오지 못했어요
              </div>
              <div className="text-[12.5px] text-[var(--color-text-tertiary)] mt-1.5">
                {(error as Error)?.message ?? '네트워크 오류가 발생했습니다.'}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              hasSearch={!!search}
              hasFilter={hasAnyFilter && !search}
              searchTerm={search}
              onResetSearch={() => setSearch('')}
              onResetFilters={resetFilters}
              onAddNew={() => navigate('/applies/new')}
            />
          ) : (
            <>
              {view === 'table' && (
                <TableView
                  items={filtered}
                  onOpen={(id) => navigate(`/applies/${id}`)}
                />
              )}
              {view === 'board' && (
                <BoardView
                  items={filtered}
                  onOpen={(id) => navigate(`/applies/${id}`)}
                />
              )}
              {view === 'calendar' && (
                <CalendarView
                  items={filtered}
                  onOpen={(id) => navigate(`/applies/${id}`)}
                />
              )}
              {view === 'timeline' && (
                <TimelineView
                  items={filtered}
                  onOpen={(id) => navigate(`/applies/${id}`)}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Stat mini card ---------- */

function StatMini({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber';
}) {
  const bar: Record<typeof color, string> = {
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={cn('w-1 h-10 rounded-full', bar[color])} />
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {label}
        </div>
        <div className="text-[22px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyState({
  hasSearch,
  hasFilter,
  searchTerm,
  onResetSearch,
  onResetFilters,
  onAddNew,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
  searchTerm: string;
  onResetSearch: () => void;
  onResetFilters: () => void;
  onAddNew: () => void;
}) {
  if (hasSearch) {
    return (
      <div className="py-20 flex flex-col items-center text-center">
        <div className="text-5xl mb-3">&#128269;</div>
        <div className="text-[15px] font-bold text-[var(--color-text-primary)]">
          '{searchTerm}' 에 해당하는 지원이 없어요
        </div>
        <div className="text-[12.5px] text-[var(--color-text-tertiary)] mt-1.5">
          다른 검색어를 시도해보거나 검색을 해제해보세요.
        </div>
        <button
          type="button"
          onClick={onResetSearch}
          className="btn-outline mt-5"
        >
          검색어 지우기
        </button>
      </div>
    );
  }
  if (hasFilter) {
    return (
      <div className="py-20 flex flex-col items-center text-center">
        <div className="text-5xl mb-3">&#129529;</div>
        <div className="text-[15px] font-bold text-[var(--color-text-primary)]">
          조건에 맞는 지원이 없어요
        </div>
        <div className="text-[12.5px] text-[var(--color-text-tertiary)] mt-1.5">
          필터를 조정하거나 초기화해보세요.
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="btn-outline mt-5"
        >
          필터 초기화
        </button>
      </div>
    );
  }
  return (
    <div className="py-20 flex flex-col items-center text-center">
      <div className="text-5xl mb-3">&#128195;</div>
      <div className="text-[16px] font-bold text-[var(--color-text-primary)]">
        첫 지원을 등록해 여정을 시작해요
      </div>
      <div className="text-[12.5px] text-[var(--color-text-tertiary)] mt-1.5 max-w-sm">
        회사명만 적어도 괜찮아요. 나머지 정보는 나중에 채워나가면 돼요.
      </div>
      <button type="button" onClick={onAddNew} className="btn-primary mt-5">
        <IconPlus className="w-4 h-4" />첫 지원 등록
      </button>
    </div>
  );
}

// We still need the Dropdown import
import Dropdown from '../components/common/Dropdown';
