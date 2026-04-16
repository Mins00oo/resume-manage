import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApplies } from '../mocks/data';
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
import Dropdown from '../components/common/Dropdown';
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

  // Data that drives the filters (derived from mocks — order matters: years desc).
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    mockApplies.forEach((a) => {
      const d = a.submittedAt ?? a.createdAt;
      if (d) set.add(new Date(d).getFullYear());
    });
    return [...set].sort((a, b) => b - a);
  }, []);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    mockApplies.forEach((a) => a.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, []);

  const availableChannels = useMemo(() => {
    const set = new Set<string>();
    mockApplies.forEach((a) => a.channel && set.add(a.channel));
    return [...set].sort();
  }, []);

  const filtered = useMemo(() => {
    return mockApplies.filter((a) => {
      if (!matchStageFilter(a.currentStatus, stage)) return false;
      if (employment && a.employmentType !== employment) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay =
          `${a.company} ${a.position} ${a.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Advanced filters
      if (advanced.years.length > 0) {
        const dateStr = a.submittedAt ?? a.createdAt;
        if (!dateStr) return false;
        const y = new Date(dateStr).getFullYear();
        if (!advanced.years.includes(y)) return false;
      }
      if (advanced.submittedFrom && (a.submittedAt ?? '') < advanced.submittedFrom)
        return false;
      if (advanced.submittedTo && (a.submittedAt ?? '') > advanced.submittedTo)
        return false;
      if (advanced.deadlineFrom && (a.deadline ?? '') < advanced.deadlineFrom)
        return false;
      if (advanced.deadlineTo && (a.deadline ?? '') > advanced.deadlineTo)
        return false;
      if (advanced.tags.length > 0) {
        if (!advanced.tags.every((t) => a.tags.includes(t))) return false;
      }
      if (advanced.channel && a.channel !== advanced.channel) return false;
      if (advanced.location) {
        const loc = (a.location ?? '').toLowerCase();
        if (!loc.includes(advanced.location.toLowerCase())) return false;
      }
      return true;
    });
  }, [stage, search, employment, advanced]);

  const stats = useMemo(() => {
    const all = mockApplies;
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
    return { total: all.length, active, passed, failed, rate };
  }, []);

  // Count per stage filter (for chip badges)
  const stageCounts = useMemo(() => {
    const count = (key: StageFilter) =>
      mockApplies.filter((a) => matchStageFilter(a.currentStatus, key)).length;
    return {
      all: count('all'),
      active: count('active'),
      passed: count('passed'),
      failed: count('failed'),
    } satisfies Record<StageFilter, number>;
  }, []);

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
        <StatMini label="전체 지원" value={stats.total} color="indigo" />
        <StatMini label="진행 중" value={stats.active} color="violet" />
        <StatMini label="최종 합격" value={stats.passed} color="emerald" />
        <StatMini label="탈락" value={stats.failed} color="rose" />
        <StatMini label="통과율" value={`${stats.rate}%`} color="amber" />
      </section>

      {/* ---------- View tabs + toolbar ---------- */}
      <section className="card overflow-hidden">
        {/* Row 1: view tabs + primary CTA */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3">
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: 'var(--color-bg-muted)' }}
          >
            {VIEWS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-all',
                  view === key
                    ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-border-subtle)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon className="w-[15px] h-[15px]" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/applies/new')}
            className="btn-primary"
          >
            <IconPlus className="w-4 h-4" />새 지원 등록
          </button>
        </div>

        {/* Row 2: filters/toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)] flex-wrap"
          style={{ background: 'color-mix(in srgb, var(--color-bg-muted) 50%, transparent)' }}
        >
          <div className="relative flex-1 min-w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="회사, 포지션, 태그 검색"
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div
            className="flex items-center gap-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg p-0.5"
          >
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStage(f.key)}
                className={cn(
                  'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors inline-flex items-center gap-1.5',
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
              'inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-colors',
              advancedOpen || advancedActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/[0.12] dark:text-indigo-300'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]',
            )}
          >
            <IconFilter className="w-4 h-4" />
            고급 필터
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

        {/* Row 3: advanced filter panel */}
        {advancedOpen && (
          <AdvancedFilterPanel
            filters={advanced}
            onChange={setAdvanced}
            onClose={() => setAdvancedOpen(false)}
            availableYears={availableYears}
            availableTags={availableTags}
            availableChannels={availableChannels}
          />
        )}

        {/* ---------- View body ---------- */}
        <div style={{ background: 'var(--color-bg-surface)' }}>
          {filtered.length === 0 ? (
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
        <div className="text-5xl mb-3">🔍</div>
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
        <div className="text-5xl mb-3">🧹</div>
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
      <div className="text-5xl mb-3">📇</div>
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
