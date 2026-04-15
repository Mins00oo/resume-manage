import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { jobApplyApi } from '../lib/api/jobApply';
import type { JobApplyStatus } from '../types/jobApply';
import { ALL_STATUSES, statusLabel } from '../lib/statusLabel';
import JobApplyTable from '../components/jobapply/JobApplyTable';

export default function JobApplyListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<JobApplyStatus | ''>('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['job-applies', statusFilter || null, appliedSearch || null],
    queryFn: () =>
      jobApplyApi.list({
        status: statusFilter || undefined,
        search: appliedSearch || undefined,
      }),
  });

  const hasFilter = statusFilter !== '' || appliedSearch !== '';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
  };

  const emptyMessage = useMemo(() => {
    if (hasFilter) return '조건에 맞는 지원 내역이 없어요.';
    return '아직 등록된 지원이 없어요. 첫 번째 지원을 등록해보세요.';
  }, [hasFilter]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">지원 내역</h1>
          <p className="text-sm text-slate-500 mt-1">
            등록된 지원 상황을 관리하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/applies/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          + 새 지원
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobApplyStatus | '')}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">전체 상태</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="회사명 검색"
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            검색
          </button>
        </form>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('');
              setSearch('');
              setAppliedSearch('');
            }}
            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500">지원 내역을 불러오는 중...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-800">
              지원 내역을 불러오지 못했어요
            </p>
            <p className="text-xs text-rose-700 mt-1">
              잠시 후 다시 시도해주세요.
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

      {data && data.length === 0 && (
        <div className="rounded-xl bg-white border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-600 mb-4">{emptyMessage}</p>
          {!hasFilter && (
            <button
              type="button"
              onClick={() => navigate('/applies/new')}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              + 새 지원 등록
            </button>
          )}
        </div>
      )}

      {data && data.length > 0 && <JobApplyTable items={data} />}
    </div>
  );
}
