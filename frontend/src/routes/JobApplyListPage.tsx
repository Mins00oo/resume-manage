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
  // active
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

  const filtered = useMemo(() => {
    return mockApplies.filter((a) => {
      if (!matchStageFilter(a.currentStatus, stage)) return false;
      if (employment && a.employmentType !== employment) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${a.company} ${a.position} ${a.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stage, search, employment]);

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
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3">
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl">
            {VIEWS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-all',
                  view === key
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:text-slate-700',
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

        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/60 border-b border-slate-200/80 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="회사, 포지션, 태그 검색"
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStage(f.key)}
                className={cn(
                  'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors',
                  stage === f.key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={employment}
            onChange={(e) => setEmployment(e.target.value as EmploymentType | '')}
            className="px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">전체 고용형태</option>
            <option value="NEW">신입</option>
            <option value="EXPERIENCED">경력</option>
            <option value="INTERN">인턴</option>
            <option value="CONTRACT">계약직</option>
          </select>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-white rounded-lg transition-colors"
          >
            <IconFilter className="w-4 h-4" />
            고급 필터
          </button>

          <div className="ml-auto text-[12px] text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span>
            건 표시
          </div>
        </div>

        {/* ---------- View body ---------- */}
        <div className="bg-white">
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

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-[14px] font-semibold text-slate-700">
                조건에 맞는 지원이 없어요
              </div>
              <div className="text-[12px] text-slate-500 mt-1">
                필터를 조정하거나 새 지원을 추가해보세요.
              </div>
            </div>
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
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="text-[22px] font-extrabold tracking-tight text-slate-900 leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
}

