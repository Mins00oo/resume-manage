import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { resumeApi } from '../lib/api/resume';
import { useToast } from '../components/common/Toast';
import type { ResumeSummary } from '../types/resume';
import {
  IconPlus,
  IconArrowUpRight,
  IconSearch,
} from '../components/icons/Icons';
import Dropdown from '../components/common/Dropdown';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (resp?.data?.error?.message) return resp.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했어요.';
}

type SortKey = 'updatedAt' | 'title';

const SORT_OPTIONS = [
  { value: 'updatedAt' as SortKey, label: '최근 수정순' },
  { value: 'title' as SortKey, label: '이름순' },
];

export default function ResumesListPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('updatedAt');

  const { data: resumes = [], isLoading, error } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.list,
  });

  const sorted = useMemo(() => {
    let list = [...resumes];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (a.isMaster && !b.isMaster) return -1;
      if (!a.isMaster && b.isMaster) return 1;
      if (sort === 'title') return a.title.localeCompare(b.title, 'ko');
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return list;
  }, [search, sort, resumes]);

  const createMutation = useMutation({
    mutationFn: (title: string) => resumeApi.create(title),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resumes/${id}`);
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resumeApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => resumeApi.duplicate(id),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resumes/${newId}`);
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const setMasterMutation = useMutation({
    mutationFn: (id: number) => resumeApi.setMaster(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const unsetMasterMutation = useMutation({
    mutationFn: (id: number) => resumeApi.unsetMaster(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes'] }),
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const downloadPdfMutation = useMutation({
    mutationFn: (id: number) => resumeApi.downloadPdf(id),
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const handleCreate = () => {
    navigate('/resumes/new');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)]">
            이력서 목록
          </div>
          <div className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
            {resumes.length}개의 이력서
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="btn-primary shrink-0"
        >
          <IconPlus className="w-4 h-4" />
          새 이력서
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이력서 검색"
            className="input-base w-full pl-9"
          />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown
            value={sort}
            onChange={(v) => setSort((v || 'updatedAt') as SortKey)}
            options={SORT_OPTIONS}
            placeholder="정렬"
          />
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 && !search ? (
        <EmptyState onCreateClick={handleCreate} />
      ) : sorted.length === 0 && search ? (
        <div className="card py-16 text-center">
          <div className="text-[32px] mb-3">🔍</div>
          <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            '{search}'에 해당하는 이력서가 없어요
          </div>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="mt-3 text-[12px] text-indigo-600 hover:text-indigo-700 font-medium"
          >
            검색어 지우기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((resume) => (
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
              onUnsetMaster={() => unsetMasterMutation.mutate(resume.id)}
              onDownloadPdf={() => downloadPdfMutation.mutate(resume.id)}
            />
          ))}
          <CreateCard onClick={handleCreate} />
        </div>
      )}
    </div>
  );
}

function ResumeCard({
  resume,
  onClick,
  onDuplicate,
  onDelete,
  onSetMaster,
  onUnsetMaster,
  onDownloadPdf,
}: {
  resume: ResumeSummary;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetMaster: () => void;
  onUnsetMaster: () => void;
  onDownloadPdf: () => void;
}) {
  const accentColor = resume.isMaster ? '#4F46E5' : '#6366F1';

  return (
    <div className="card card-hover p-0 overflow-hidden text-left group">
      <button type="button" onClick={onClick} className="w-full text-left">
        {/* Thumbnail */}
        <div className="relative h-36 sm:h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}20)` }}>
          <div className="absolute top-4 left-4 right-4 bg-[var(--color-bg-surface)] rounded shadow-sm p-3 origin-top scale-[0.72]">
            <div className="h-1.5 w-2/3 rounded-full mb-1.5" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-1/2 bg-[var(--color-bg-muted)] rounded-full mb-2" />
            <div className="space-y-1 mt-2">
              <div className="h-0.5 w-full bg-[var(--color-bg-muted)] rounded-full" />
              <div className="h-0.5 w-4/5 bg-[var(--color-bg-muted)] rounded-full" />
              <div className="h-0.5 w-3/4 bg-[var(--color-bg-muted)] rounded-full" />
            </div>
          </div>
          {resume.isMaster && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-indigo-600 tracking-wide">
              대표
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-[var(--color-text-primary)] truncate group-hover:text-indigo-600 transition-colors">
                {resume.title}
              </div>
              {resume.isMaster && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded">
                  대표 이력서
                </span>
              )}
            </div>
            <IconArrowUpRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-indigo-600 transition-colors shrink-0 mt-0.5" />
          </div>

          {/* Completion */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${resume.completionRate}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-[11px] font-bold text-[var(--color-text-secondary)] tabular-nums">
              {resume.completionRate}%
            </span>
          </div>

          {/* Dates */}
          <div className="mt-2.5 flex items-center gap-3 text-[10.5px] text-[var(--color-text-tertiary)]">
            <span>수정 {resume.updatedAt.slice(0, 10).replace(/-/g, '.')}</span>
          </div>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5 px-3 pb-3 pt-0 flex-wrap">
        <ActionBtn label="PDF" onClick={onDownloadPdf} />
        <ActionBtn label="복제" onClick={onDuplicate} />
        {resume.isMaster ? (
          <ActionBtn label="대표 해제" onClick={onUnsetMaster} />
        ) : (
          <ActionBtn label="대표 지정" onClick={onSetMaster} />
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-[10.5px] text-[var(--color-text-tertiary)] hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-auto"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="text-[10.5px] text-[var(--color-text-tertiary)] hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-[var(--color-bg-muted)] transition-colors"
    >
      {label}
    </button>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-[var(--color-border-subtle)] bg-transparent hover:border-indigo-400 dark:hover:border-indigo-500 flex flex-col items-center justify-center p-8 min-h-[260px] transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        <IconPlus className="w-5 h-5" />
      </div>
      <div className="text-[13.5px] font-bold text-[var(--color-text-primary)] mt-3">
        새 이력서 만들기
      </div>
      <div className="text-[11.5px] text-[var(--color-text-tertiary)] mt-1">
        대표 이력서에서 복제하거나 처음부터
      </div>
    </button>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="card py-20 text-center">
      <div className="text-[48px] mb-4">📄</div>
      <div className="text-[16px] font-bold text-[var(--color-text-primary)]">
        아직 이력서가 없어요
      </div>
      <div className="text-[13px] text-[var(--color-text-tertiary)] mt-1.5">
        첫 이력서를 만들어 커리어를 정리해보세요
      </div>
      <button
        type="button"
        onClick={onCreateClick}
        className="btn-primary mt-5"
      >
        <IconPlus className="w-4 h-4" />
        첫 이력서 만들기
      </button>
    </div>
  );
}
