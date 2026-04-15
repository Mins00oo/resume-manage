import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, type DashboardPeriod } from '../lib/api/dashboard';
import SummaryStrip from '../components/dashboard/SummaryStrip';
import MasterResumeCard from '../components/dashboard/MasterResumeCard';
import UpcomingDeadlinesCard from '../components/dashboard/UpcomingDeadlinesCard';
import PassRateCards from '../components/dashboard/PassRateCards';
import ActivityGrass from '../components/dashboard/ActivityGrass';
import PeriodSelector from '../components/dashboard/PeriodSelector';

export default function HomePage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<DashboardPeriod>('3m');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'summary', period],
    queryFn: () => dashboardApi.summary(period),
  });

  const noActivity =
    !!data &&
    data.summaryStrip.draft === 0 &&
    data.summaryStrip.submitted === 0 &&
    data.summaryStrip.inProgress === 0 &&
    data.summaryStrip.accepted === 0 &&
    data.summaryStrip.rejected === 0;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
          <p className="text-sm text-slate-500 mt-1">
            지원 현황을 한눈에 확인하세요.
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </header>

      {isLoading && (
        <div className="rounded-xl bg-white border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500">대시보드를 불러오는 중...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-800">
              대시보드를 불러오지 못했어요
            </p>
            <p className="text-xs text-rose-700 mt-1">
              네트워크 상태를 확인하고 다시 시도해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {data && noActivity && (
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-10 text-center">
          <p className="text-base font-semibold text-slate-900">
            아직 지원한 회사가 없어요
          </p>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            첫 번째 지원을 등록하고 커리어 여정을 시작해보세요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/applies/new')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            + 새 지원 등록
          </button>
        </div>
      )}

      {data && !noActivity && (
        <>
          <SummaryStrip data={data.summaryStrip} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MasterResumeCard data={data.masterResume} />
            <UpcomingDeadlinesCard data={data.upcomingDeadlines} />
          </div>
          <PassRateCards data={data.passRates} period={period} />
          <ActivityGrass data={data.activityGrass} period={data.period} />
        </>
      )}
    </div>
  );
}
