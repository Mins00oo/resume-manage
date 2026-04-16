import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type DashboardPeriod } from '../lib/api/dashboard';
import type { DashboardSummary } from '../types/dashboard';
import {
  IconArrowUpRight,
  IconCalendar,
  IconFire,
  IconPlus,
  IconSparkles,
} from '../components/icons/Icons';
import { cn } from '../lib/cn';
import { useThemeStore } from '../store/themeStore';
import { api } from '../lib/api';
import type { ApiResponse, MeResponse } from '../types/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'3m' | '6m' | 'all'>('3m');

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      api
        .get<ApiResponse<MeResponse>>('/api/me')
        .then((r) => r.data.data),
  });

  const {
    data: dashboard,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.summary(period as DashboardPeriod),
  });

  const upcoming = dashboard?.upcomingDeadlines ?? [];
  const focus = upcoming[0];

  // Build pipeline from summaryStrip
  const pipeline = useMemo(() => {
    if (!dashboard) return [];
    const s = dashboard.summaryStrip;
    const total = s.draft + s.submitted + s.inProgress + s.accepted + s.rejected;
    return [
      { label: '지원', count: total, color: '#6366F1' },
      { label: '진행 중', count: s.inProgress, color: '#8B5CF6' },
      { label: '최종 합격', count: s.accepted, color: '#10B981' },
      { label: '탈락', count: s.rejected, color: '#EF4444' },
    ];
  }, [dashboard]);

  const totalApplies = dashboard
    ? dashboard.summaryStrip.draft +
      dashboard.summaryStrip.submitted +
      dashboard.summaryStrip.inProgress +
      dashboard.summaryStrip.accepted +
      dashboard.summaryStrip.rejected
    : 0;

  const userName = me?.name ?? '';
  const displayName = userName.length >= 2 ? userName.slice(-2) : userName;

  return (
    <div className="space-y-7">
      {/* Greeting row */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[var(--color-text-tertiary)] font-medium">
            {displayName ? `안녕하세요, ${displayName}님` : '안녕하세요'}
          </div>
          <div className="text-[18px] md:text-[22px] font-bold tracking-tight text-[var(--color-text-primary)] mt-0.5">
            오늘도 커리어 한 걸음 나아가볼까요?
          </div>
        </div>
        {/* Desktop period pills */}
        <div className="hidden md:flex items-center gap-2">
          {(['3m', '6m', 'all'] as const).map((key) => (
            <PeriodPill
              key={key}
              label={{ '3m': '최근 3개월', '6m': '6개월', all: '전체' }[key]}
              active={period === key}
              onClick={() => setPeriod(key)}
            />
          ))}
        </div>
        {/* Mobile period selector */}
        <div className="flex md:hidden items-center">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as '3m' | '6m' | 'all')}
            className="text-[12px] font-medium bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="3m">최근 3개월</option>
            <option value="6m">6개월</option>
            <option value="all">전체</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-[13px] text-[var(--color-text-tertiary)] mt-4">
            대시보드를 불러오는 중...
          </div>
        </div>
      ) : isError || !dashboard ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="text-[15px] font-bold text-[var(--color-text-primary)]">
            대시보드 데이터를 불러오지 못했어요
          </div>
          <div className="text-[12.5px] text-[var(--color-text-tertiary)] mt-1.5">
            잠시 후 다시 시도해주세요.
          </div>
        </div>
      ) : (
        <>
          {/* ---------- Focus hero ---------- */}
          <section className="grid grid-cols-12 gap-5">
            {/* Focus card: takes 7 cols */}
            <div className="col-span-12 lg:col-span-7">
              <FocusCard
                focus={focus}
                onOpen={() => focus && navigate(`/applies/${focus.id}`)}
                onAddNew={() => navigate('/applies/new')}
              />
            </div>
            {/* Funnel: takes 5 cols */}
            <div className="col-span-12 lg:col-span-5">
              <PipelineFunnel data={pipeline} />
            </div>
          </section>

          {/* ---------- KPI row ---------- */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="전체 지원"
              value={totalApplies}
              accent="indigo"
            />
            <KpiCard
              label="진행 중"
              value={dashboard.summaryStrip.inProgress}
              hint="활발한 지원"
              accent="violet"
            />
            <KpiCard
              label="서류 합격률"
              value={`${dashboard.passRates.document.rate}%`}
              delta={`${dashboard.passRates.document.passed}/${dashboard.passRates.document.total}`}
              accent="sky"
            />
            <KpiCard
              label="최종 합격"
              value={dashboard.summaryStrip.accepted}
              hint="이번 사이클"
              accent="emerald"
            />
          </section>

          {/* ---------- Middle row: Pass rates + Resume card ---------- */}
          <section className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-8">
              <PassRatesBoard data={dashboard.passRates} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <MasterResumeCard resume={dashboard.masterResume} />
            </div>
          </section>

          {/* ---------- Activity heatmap ---------- */}
          <section>
            <ActivityHeatmap data={dashboard.activityGrass} />
          </section>

          {/* ---------- Bottom row: Upcoming ---------- */}
          <section className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-6">
              <UpcomingList items={upcoming} onOpen={(id) => navigate(`/applies/${id}`)} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PeriodPill({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors',
        active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500 dark:shadow-indigo-500/20'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]',
      )}
    >
      {label}
    </button>
  );
}

/* ---------- Focus card ---------- */

type UpcomingDeadline = DashboardSummary['upcomingDeadlines'][number];

type FocusCardProps = {
  focus: UpcomingDeadline | undefined;
  onOpen: () => void;
  onAddNew: () => void;
};

function companyColor(name: string): string {
  const PALETTE = [
    '#3182F6', '#FEE500', '#03C75A', '#00C300', '#FF7E36',
    '#F7324C', '#4B5AFA', '#0A0A0A', '#2AC1BC', '#35C5F0',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function FocusCard({ focus, onOpen, onAddNew }: FocusCardProps) {
  const daysLeft = focus ? Math.max(0, focus.dDay) : null;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-slate-900/5 dark:border-white/5 shadow-[0_1px_0_rgba(15,23,42,0.03),0_12px_32px_-12px_rgba(79,70,229,0.18)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_20px_40px_-20px_rgba(99,102,241,0.45)]">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1038] to-[#2a0f3a]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(99,102,241,0.55), transparent 50%), radial-gradient(circle at 0% 100%, rgba(217,70,239,0.35), transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative p-5 md:p-7 lg:p-8 text-white h-full flex flex-col">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] tracking-wide text-white/85 backdrop-blur">
            <IconFire className="w-3.5 h-3.5 text-orange-300" />
            오늘의 포커스
          </span>
          {daysLeft !== null && daysLeft <= 3 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-[10.5px] font-semibold text-orange-200">
              D-{daysLeft}
            </span>
          )}
        </div>

        {focus ? (
          <>
            <div className="mt-5 flex-1">
              <div className="text-[11px] tracking-[0.12em] uppercase text-white/40 font-semibold">
                가장 가까운 마감
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold ring-1 ring-white/15"
                  style={{ backgroundColor: companyColor(focus.company) }}
                >
                  {focus.company[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-[22px] font-bold tracking-tight truncate">
                    {focus.company}
                  </div>
                  <div className="text-[13px] text-white/60 truncate">
                    {focus.position ?? '포지션 미정'}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniStat
                  label="마감"
                  value={focus.deadline?.replace(/-/g, '.') ?? '-'}
                />
                <MiniStat label="D-Day" value={`D-${focus.dDay}`} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-900 bg-white hover:bg-white/90 transition-colors"
              >
                자세히 보기
                <IconArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onAddNew}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <IconPlus className="w-4 h-4" />새 지원
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/60">
            다가오는 마감이 없어요
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2.5 backdrop-blur">
      <div className="text-[10px] text-white/45 font-semibold tracking-wide uppercase">
        {label}
      </div>
      <div className="text-[13px] text-white font-semibold truncate mt-0.5">
        {value}
      </div>
    </div>
  );
}

/* ---------- Pipeline funnel ---------- */

function PipelineFunnel({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
            Pipeline
          </div>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)] mt-0.5">
            파이프라인 퍼널
          </div>
        </div>
        <IconSparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
      </div>
      <div className="space-y-2">
        {data.map((stage) => {
          const pct = (stage.count / max) * 100;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <div className="w-[72px] shrink-0 text-[11.5px] font-medium text-[var(--color-text-secondary)] text-right">
                {stage.label}
              </div>
              <div
                className="flex-1 relative h-7 rounded-md overflow-hidden"
                style={{ background: 'var(--color-bg-muted)' }}
              >
                <div
                  className="h-full rounded-md transition-all"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center px-2.5">
                  <span className="text-[11px] font-bold text-white mix-blend-luminosity">
                    {stage.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- KPI card ---------- */

type KpiAccent = 'indigo' | 'violet' | 'sky' | 'emerald';

function KpiCard({
  label,
  value,
  delta,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  accent: KpiAccent;
}) {
  const accentMap: Record<KpiAccent, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600',
    sky: 'from-sky-500 to-sky-600',
    emerald: 'from-emerald-500 to-emerald-600',
  };
  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      <div
        className={cn(
          'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 dark:opacity-30 bg-gradient-to-br',
          accentMap[accent],
        )}
      />
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-[28px] font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {value}
          </div>
          {delta && (
            <div className="text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {delta}
            </div>
          )}
        </div>
        {hint && (
          <div className="text-[11.5px] text-[var(--color-text-tertiary)] mt-1.5">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Pass rates board ---------- */

function PassRatesBoard({ data }: { data: DashboardSummary['passRates'] }) {
  const stages = [
    { key: 'document' as const, label: '서류', color: '#6366F1' },
    { key: 'interview' as const, label: '면접', color: '#EC4899' },
    { key: 'final' as const, label: '최종', color: '#10B981' },
  ];
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
            Success Rate
          </div>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)] mt-0.5">
            단계별 합격률
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stages.map((s) => {
          const stage = data[s.key];
          return (
            <div key={s.key} className="text-center">
              <RingChart value={stage.rate} color={s.color} />
              <div className="text-[12px] font-semibold text-[var(--color-text-secondary)] mt-2">
                {s.label}
              </div>
              <div className="text-[10.5px] text-[var(--color-text-tertiary)] mt-0.5">
                {stage.passed}/{stage.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RingChart({ value, color }: { value: number; color: string }) {
  const radius = 28;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-[72px] h-[72px] mx-auto">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle
          cx={36}
          cy={36}
          r={radius}
          stroke="var(--color-bg-muted)"
          strokeWidth={6}
          fill="none"
        />
        <circle
          cx={36}
          cy={36}
          r={radius}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
          {value}%
        </span>
      </div>
    </div>
  );
}

/* ---------- Master resume card ---------- */

function MasterResumeCard({
  resume,
}: {
  resume: DashboardSummary['masterResume'];
}) {
  const navigate = useNavigate();

  if (!resume) {
    return (
      <div className="card p-5 h-full flex flex-col items-center justify-center text-center">
        <div className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          Master Resume
        </div>
        <div className="text-[13px] text-[var(--color-text-secondary)]">
          마스터 이력서가 없어요.
        </div>
        <button
          type="button"
          onClick={() => navigate('/resumes')}
          className="btn-outline mt-3"
        >
          이력서 만들기
        </button>
      </div>
    );
  }

  const completion = resume.completionRate;
  return (
    <button
      type="button"
      onClick={() => navigate(`/resumes/${resume.id}`)}
      className="card card-hover p-5 h-full w-full text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
          Master Resume
        </div>
        <div className="pill bg-indigo-50 text-indigo-700 dark:bg-indigo-500/[0.12] dark:text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
          ACTIVE
        </div>
      </div>
      <div className="text-[15px] font-bold text-[var(--color-text-primary)] leading-snug">
        {resume.title}
      </div>
      <div className="text-[12px] text-[var(--color-text-tertiary)] mt-1">
        마지막 수정 {resume.updatedAt.slice(0, 10).replace(/-/g, '.')}
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
            완성도
          </div>
          <div className="text-[22px] font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {completion}
            <span className="text-[12px] text-[var(--color-text-tertiary)] font-semibold ml-0.5">
              %
            </span>
          </div>
        </div>
        <div
          className="mt-1.5 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--color-bg-muted)' }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="flex items-center justify-end text-[11px] text-[var(--color-text-tertiary)] mt-2.5">
          <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 font-semibold group-hover:gap-1.5 transition-all">
            편집하기
            <IconArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- Heatmap (github-style grass) ---------- */

function ActivityHeatmap({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const theme = useThemeStore((s) => s.theme);

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  data.forEach((d, i) => {
    currentWeek.push(d);
    if (currentWeek.length === 7 || i === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const color = (count: number) => {
    if (theme === 'dark') {
      if (count === 0) return '#1a1f2d';
      if (count === 1) return '#312e81';
      if (count === 2) return '#4f46e5';
      if (count === 3) return '#818cf8';
      return '#a5b4fc';
    }
    if (count === 0) return '#f1f5f9';
    if (count === 1) return '#c7d2fe';
    if (count === 2) return '#818cf8';
    if (count === 3) return '#6366f1';
    return '#4338ca';
  };

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const streak = computeStreak(data);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
            Activity
          </div>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)] mt-0.5">
            최근 활동
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <SmallStat label="총 활동" value={`${total}회`} />
          <SmallStat label="연속" value={`${streak}일`} />
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[10.5px] text-[var(--color-text-tertiary)]">
              적음
            </span>
            {[0, 1, 2, 3, 4].map((lv) => (
              <div
                key={lv}
                className="w-[14px] h-[14px] rounded-sm"
                style={{ backgroundColor: color(lv) }}
              />
            ))}
            <span className="text-[10.5px] text-[var(--color-text-tertiary)]">
              많음
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((d) => (
              <div
                key={d.date}
                title={`${d.date} \u00b7 ${d.count}회`}
                className="w-[14px] h-[14px] rounded-sm"
                style={{ backgroundColor: color(d.count) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
        {label}
      </div>
      <div className="text-[14px] font-bold text-[var(--color-text-primary)] mt-0.5">
        {value}
      </div>
    </div>
  );
}

function computeStreak(data: { date: string; count: number }[]) {
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) streak++;
    else break;
  }
  return streak;
}

/* ---------- Upcoming list ---------- */

function UpcomingList({
  items,
  onOpen,
}: {
  items: DashboardSummary['upcomingDeadlines'];
  onOpen: (id: number) => void;
}) {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
            Upcoming
          </div>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)] mt-0.5">
            다가오는 마감
          </div>
        </div>
        <IconCalendar className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </div>
      {items.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">
          다가오는 마감이 없어요
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const daysLeft = Math.max(0, item.dDay);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors text-left group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: companyColor(item.company) }}
                >
                  {item.company[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                    {item.company}
                  </div>
                  <div className="text-[11.5px] text-[var(--color-text-tertiary)] truncate">
                    {item.position ?? '포지션 미정'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-[12px] font-bold',
                      daysLeft <= 2
                        ? 'text-rose-600 dark:text-rose-400'
                        : daysLeft <= 5
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-[var(--color-text-secondary)]',
                    )}
                  >
                    D-{daysLeft}
                  </div>
                  <div className="text-[10.5px] text-[var(--color-text-tertiary)]">
                    {item.deadline?.slice(5).replace('-', '.')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
