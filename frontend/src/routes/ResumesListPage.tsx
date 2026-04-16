import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { resumeApi } from '../lib/api/resume';
import type { ResumeSummary } from '../types/resume';
import {
  IconPlus,
  IconPencil,
  IconArrowUpRight,
  IconSparkles,
  IconDownload,
  IconSearch,
} from '../components/icons/Icons';
import { cn } from '../lib/cn';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (resp?.data?.error?.message) return resp.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했어요.';
}

export default function ResumesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'master' | 'tailored'>('all');

  const { data: resumes = [], isLoading, error } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.list,
  });

  const master = resumes.find((r) => r.isMaster);
  const tailored = resumes.filter((r) => !r.isMaster);

  const visible = useMemo(() => {
    let list =
      filter === 'master'
        ? master
          ? [master]
          : []
        : filter === 'tailored'
          ? tailored
          : resumes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    return list;
  }, [search, filter, master, tailored, resumes]);

  /* Mutations */
  const createMutation = useMutation({
    mutationFn: (title: string) => resumeApi.create(title),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resumes/${id}`);
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resumeApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
    onError: (err) => alert(getErrorMessage(err)),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => resumeApi.duplicate(id),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resumes/${newId}`);
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  const setMasterMutation = useMutation({
    mutationFn: (id: number) => resumeApi.setMaster(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
    onError: (err) => alert(getErrorMessage(err)),
  });

  const downloadPdfMutation = useMutation({
    mutationFn: (id: number) => resumeApi.downloadPdf(id),
    onError: (err) => alert(getErrorMessage(err)),
  });

  const handleCreate = () => {
    const title = prompt('새 이력서 제목을 입력하세요', '새 이력서');
    if (title) createMutation.mutate(title);
  };

  /* Loading / error states */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[14px] text-slate-500">이력서 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-[14px] text-rose-600">{getErrorMessage(error)}</div>
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['resumes'] })}
          className="btn-outline text-[12px]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master card */}
      {master && (
        <section
          className="relative overflow-hidden rounded-2xl text-white cursor-pointer group"
          onClick={() => navigate(`/resumes/${master.id}`)}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 70%, #581c87 100%)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 100% 0%, rgba(129,140,248,0.5), transparent 50%), radial-gradient(circle at 0% 100%, rgba(217,70,239,0.35), transparent 50%)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative p-5 md:p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] tracking-wide text-white/85 backdrop-blur">
                <IconSparkles className="w-3 h-3 text-fuchsia-200" />
                Master Resume
              </div>
              <h2 className="mt-3 text-[22px] md:text-[30px] font-bold tracking-tight leading-tight">
                {master.title}
              </h2>
              <p className="text-[13px] md:text-[14px] text-white/60 mt-1 max-w-lg">
                모든 경력/프로젝트를 담은 원본
              </p>
              <div className="mt-4 md:mt-5 flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/resumes/${master.id}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[12px] md:text-[13px] font-semibold text-slate-900 bg-white hover:bg-white/90 transition-colors"
                >
                  <IconPencil className="w-3.5 h-3.5" />
                  편집하기
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPdfMutation.mutate(master.id);
                  }}
                  disabled={downloadPdfMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[12px] md:text-[13px] font-medium text-white/85 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <IconDownload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{downloadPdfMutation.isPending ? '다운로드 중...' : 'PDF 내보내기'}</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </div>
            </div>

            {/* Completion ring */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-28 h-28 md:w-40 md:h-40">
                <svg width="100%" height="100%" viewBox="0 0 160 160">
                  <circle
                    cx={80}
                    cy={80}
                    r={68}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={10}
                    fill="none"
                  />
                  <circle
                    cx={80}
                    cy={80}
                    r={68}
                    stroke="url(#grad)"
                    strokeWidth={10}
                    fill="none"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={
                      2 * Math.PI * 68 -
                      (master.completionRate / 100) * 2 * Math.PI * 68
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#a5b4fc" />
                      <stop offset="1" stopColor="#f0abfc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[9px] md:text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                    완성도
                  </div>
                  <div className="text-[28px] md:text-[40px] font-extrabold tracking-tight leading-none mt-1">
                    {master.completionRate}
                    <span className="text-[12px] md:text-[16px] text-white/50 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3">
        <div>
          <div className="text-[15px] font-bold text-slate-900">이력서 목록</div>
          <div className="text-[12px] text-slate-500 mt-0.5">
            회사별 맞춤 이력서를 관리하세요
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이력서 검색"
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 overflow-x-auto">
            {(['all', 'master', 'tailored'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors shrink-0',
                  filter === key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {key === 'all' ? '전체' : key === 'master' ? '마스터' : '맞춤'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="btn-primary shrink-0"
          >
            <IconPlus className="w-4 h-4" />
            <span className="hidden sm:inline">이력서 추가</span>
          </button>
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onClick={() => navigate(`/resumes/${resume.id}`)}
            onDuplicate={() => duplicateMutation.mutate(resume.id)}
            onDelete={() => {
              if (confirm(`"${resume.title}" 이력서를 삭제할까요?`)) {
                deleteMutation.mutate(resume.id);
              }
            }}
            onSetMaster={() => setMasterMutation.mutate(resume.id)}
            onDownloadPdf={() => downloadPdfMutation.mutate(resume.id)}
          />
        ))}
        <CreateCard onClick={handleCreate} />
      </section>
    </div>
  );
}

function ResumeCard({
  resume,
  onClick,
  onDuplicate,
  onDelete,
  onSetMaster,
  onDownloadPdf,
}: {
  resume: ResumeSummary;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetMaster: () => void;
  onDownloadPdf: () => void;
}) {
  const accentColor = resume.isMaster ? '#4F46E5' : '#6366F1';

  return (
    <div className="card card-hover p-0 overflow-hidden text-left group">
      {/* Clickable top area */}
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
      >
        {/* Thumbnail: tiny A4 preview */}
        <div className="relative h-40 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}25)`,
            }}
          />
          <div className="absolute top-4 left-4 right-4 bg-white rounded shadow-sm p-3 origin-top scale-[0.75]">
            <div
              className="h-1.5 w-2/3 rounded-full mb-1.5"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-1 w-1/2 bg-slate-200 rounded-full mb-2" />
            <div className="space-y-1 mt-2">
              <div className="h-0.5 w-full bg-slate-100 rounded-full" />
              <div className="h-0.5 w-4/5 bg-slate-100 rounded-full" />
              <div className="h-0.5 w-3/4 bg-slate-100 rounded-full" />
            </div>
            <div className="flex gap-1 mt-2">
              <div className="h-1 w-8 bg-slate-100 rounded-full" />
              <div className="h-1 w-6 bg-slate-100 rounded-full" />
              <div className="h-1 w-10 bg-slate-100 rounded-full" />
            </div>
          </div>
          {resume.isMaster && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9.5px] font-bold text-white bg-slate-900/80 backdrop-blur tracking-wide">
              MASTER
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                {resume.title}
              </div>
            </div>
            <IconArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${resume.completionRate}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <div className="text-[11px] font-bold text-slate-700 tabular-nums">
              {resume.completionRate}%
            </div>
          </div>
          <div className="text-[10.5px] text-slate-400 mt-2">
            수정 {resume.updatedAt.slice(0, 10).replace(/-/g, '.')}
          </div>
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-3 pb-3 pt-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownloadPdf();
          }}
          className="text-[10.5px] text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          PDF
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="text-[10.5px] text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          복제
        </button>
        {!resume.isMaster && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSetMaster();
            }}
            className="text-[10.5px] text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            마스터 지정
          </button>
        )}
        {!resume.isMaster && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-[10.5px] text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors ml-auto"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white hover:border-indigo-300 flex flex-col items-center justify-center p-8 min-h-[260px] transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
        <IconPlus className="w-5 h-5" />
      </div>
      <div className="text-[13.5px] font-bold text-slate-700 mt-3">
        새 이력서 만들기
      </div>
      <div className="text-[11.5px] text-slate-500 mt-1">
        마스터에서 복제하거나 처음부터
      </div>
    </button>
  );
}
