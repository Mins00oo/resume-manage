import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { DashboardSummary, PassRateStage } from '../../types/dashboard';
import { dashboardApi, type DashboardPeriod } from '../../lib/api/dashboard';
import { formatDate } from '../../lib/formatDate';

type Props = {
  data: DashboardSummary['passRates'];
  period: DashboardPeriod;
  from?: string;
  to?: string;
};

const STAGE_META: Record<PassRateStage, { label: string; accent: string; bar: string }> = {
  document: {
    label: '서류 합격률',
    accent: 'text-sky-700',
    bar: 'bg-sky-500',
  },
  interview: {
    label: '면접 합격률',
    accent: 'text-violet-700',
    bar: 'bg-violet-500',
  },
  final: {
    label: '최종 합격률',
    accent: 'text-emerald-700',
    bar: 'bg-emerald-500',
  },
};

const toPct = (rate: number): number => Math.round(rate * 100);

export default function PassRateCards({ data, period, from, to }: Props) {
  const [openStage, setOpenStage] = useState<PassRateStage | null>(null);

  return (
    <section className="rounded-xl bg-white border border-slate-200 p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">단계별 합격률</h3>
        <span className="text-xs text-slate-400">카드를 누르면 상세 내역이 나와요</span>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['document', 'interview', 'final'] as const).map((stage) => {
          const rate = data[stage];
          const meta = STAGE_META[stage];
          const pct = toPct(rate.rate);
          return (
            <button
              type="button"
              key={stage}
              onClick={() => setOpenStage(stage)}
              className="text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all p-4 flex flex-col gap-2"
            >
              <span className="text-xs font-medium text-slate-500">{meta.label}</span>
              <span className={`text-3xl font-bold ${meta.accent}`}>{pct}%</span>
              <span className="text-xs text-slate-500">
                {rate.passed} / {rate.total} 건
              </span>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full ${meta.bar} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      {openStage && (
        <PassRateDetailsModal
          stage={openStage}
          period={period}
          from={from}
          to={to}
          onClose={() => setOpenStage(null)}
        />
      )}
    </section>
  );
}

type ModalProps = {
  stage: PassRateStage;
  period: DashboardPeriod;
  from?: string;
  to?: string;
  onClose: () => void;
};

function PassRateDetailsModal({ stage, period, from, to, onClose }: ModalProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pass-rate-details', stage, period, from, to],
    queryFn: () => dashboardApi.passRateDetails(stage, period, from, to),
  });

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 z-30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h3 className="text-base font-semibold text-slate-900">
            {STAGE_META[stage].label} 상세
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </header>
        <div className="p-6">
          {isLoading && <p className="text-sm text-slate-500">불러오는 중...</p>}
          {isError && (
            <p className="text-sm text-rose-600">
              상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                  합격 {data.passed.length}건
                </h4>
                {data.passed.length === 0 ? (
                  <p className="text-xs text-slate-400">없음</p>
                ) : (
                  <ul className="space-y-2">
                    {data.passed.map((it) => (
                      <li
                        key={`p-${it.id}`}
                        className="text-sm cursor-pointer hover:bg-emerald-50 p-2 rounded-md"
                        onClick={() => {
                          navigate(`/applies/${it.id}`);
                          onClose();
                        }}
                      >
                        <p className="font-medium text-slate-900 truncate">
                          {it.company}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {it.position ?? '-'} · {formatDate(it.eventAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-rose-700 mb-2">
                  탈락 {data.failed.length}건
                </h4>
                {data.failed.length === 0 ? (
                  <p className="text-xs text-slate-400">없음</p>
                ) : (
                  <ul className="space-y-2">
                    {data.failed.map((it) => (
                      <li
                        key={`f-${it.id}`}
                        className="text-sm cursor-pointer hover:bg-rose-50 p-2 rounded-md"
                        onClick={() => {
                          navigate(`/applies/${it.id}`);
                          onClose();
                        }}
                      >
                        <p className="font-medium text-slate-900 truncate">
                          {it.company}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {it.position ?? '-'} · {formatDate(it.eventAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
