import { useNavigate } from 'react-router-dom';
import type { DashboardSummary } from '../../types/dashboard';
import { formatDate } from '../../lib/formatDate';

type Props = {
  data: DashboardSummary['masterResume'];
};

export default function MasterResumeCard({ data }: Props) {
  const navigate = useNavigate();

  return (
    <section className="rounded-xl bg-white border border-slate-200 p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">대표 이력서</h3>
      </header>
      {data ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-base font-semibold text-slate-900 truncate">
              {data.title}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              최종 수정 {formatDate(data.updatedAt)}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">완성도</span>
              <span className="font-semibold text-indigo-600">
                {data.completionRate}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, data.completionRate))}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/resumes')}
              className="flex-1 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              편집
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-500 mb-3">아직 대표 이력서가 없어요</p>
          <button
            type="button"
            onClick={() => navigate('/resumes')}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            이력서 만들기
          </button>
        </div>
      )}
    </section>
  );
}
