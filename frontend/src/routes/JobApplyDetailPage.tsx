import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApplyApi } from '../lib/api/jobApply';
import {
  stageMeta,
  toStage,
  dDayLabel,
  statusLabel,
  type Stage,
} from '../components/applies/applyUi';
import {
  IconChevronLeft,
  IconPencil,
  IconTrash,
  IconArrowUpRight,
  IconClock,
  IconSparkles,
} from '../components/icons/Icons';
import { cn } from '../lib/cn';
import { ALL_STATUSES } from '../lib/statusLabel';
import { statusLabel as getStatusLabel } from '../lib/statusLabel';
import { employmentLabel } from '../lib/statusLabel';

const PIPELINE: { key: Stage; label: string }[] = [
  { key: 'draft', label: '작성' },
  { key: 'submitted', label: '지원' },
  { key: 'document', label: '서류' },
  { key: 'coding', label: '코딩' },
  { key: 'assignment', label: '과제' },
  { key: 'interview', label: '면접' },
  { key: 'offer', label: '최종' },
];

/** Generate a deterministic color from a company name */
function companyColor(name: string): string {
  const PALETTE = [
    '#3182F6', '#FEE500', '#03C75A', '#00C300', '#FF7E36',
    '#F7324C', '#4B5AFA', '#0A0A0A', '#2AC1BC', '#35C5F0',
    '#ED1C24', '#742DDD', '#FF6B00', '#1F8CE6', '#5F0080',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function JobApplyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editMemo, setEditMemo] = useState('');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  const numericId = Number(id);

  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['jobApply', numericId],
    queryFn: () => jobApplyApi.get(numericId),
    enabled: !isNaN(numericId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => jobApplyApi.delete(numericId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplies'] });
      navigate('/applies');
    },
    onError: (err: Error) => {
      alert(err.message || '삭제에 실패했습니다.');
    },
  });

  const transitionMutation = useMutation({
    mutationFn: (to: string) =>
      jobApplyApi.transition(numericId, to as import('../types/jobApply').JobApplyStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApply', numericId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplies'] });
      setStatusPickerOpen(false);
    },
    onError: (err: Error) => {
      alert(err.message || '상태 변경에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<import('../types/jobApply').JobApplyCreateRequest>) =>
      jobApplyApi.update(numericId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApply', numericId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplies'] });
      setIsEditing(false);
    },
    onError: (err: Error) => {
      alert(err.message || '수정에 실패했습니다.');
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center text-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-[13px] text-[var(--color-text-tertiary)] mt-4">
          지원 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {(error as Error)?.message ?? '존재하지 않는 지원이에요.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/applies')}
          className="mt-4 btn-primary"
        >
          지원 목록으로
        </button>
      </div>
    );
  }

  const dday = dDayLabel(item.deadline);
  const stage = stageMeta[toStage(item.currentStatus)];
  const currentStage = toStage(item.currentStatus);
  const currentStageIdx = PIPELINE.findIndex((p) => p.key === currentStage);
  const bgColor = companyColor(item.company);

  const handleStartEdit = () => {
    setEditMemo(item.memo ?? '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ memo: editMemo });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/applies')}
        className="inline-flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium"
      >
        <IconChevronLeft className="w-3.5 h-3.5" />
        지원 목록
      </button>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div
          className="h-20 relative"
          style={{
            background: `linear-gradient(135deg, ${bgColor}bb, ${bgColor}66)`,
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
        <div className="p-6 pt-0">
          <div className="flex items-end justify-between -mt-8 gap-4 flex-wrap">
            <div className="flex items-end gap-4">
              <div
                className="rounded-xl flex items-center justify-center text-white font-bold shrink-0 ring-1 ring-black/5 shadow-sm"
                style={{
                  width: 72,
                  height: 72,
                  backgroundColor: bgColor,
                  fontSize: 72 * 0.42,
                }}
              >
                {item.company[0]}
              </div>
              <div className="pb-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stage.bg} ${stage.text} ${stage.border}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  {statusLabel(item.currentStatus)}
                </span>
                <div className="text-[26px] font-bold tracking-tight text-[var(--color-text-primary)] mt-2 leading-tight">
                  {item.company}
                </div>
                <div className="text-[14px] text-[var(--color-text-secondary)]">{item.position}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <button
                type="button"
                onClick={() => (isEditing ? handleSaveEdit() : handleStartEdit())}
                className="btn-outline"
                disabled={updateMutation.isPending}
              >
                <IconPencil className="w-4 h-4" />
                {isEditing ? (updateMutation.isPending ? '저장 중...' : '저장') : '편집'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-ghost"
                >
                  취소
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`"${item.company}" 지원을 삭제할까요?`)) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="btn-ghost text-rose-600 hover:bg-rose-50"
              >
                <IconTrash className="w-4 h-4" />
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            {dday && (
              <span
                className={cn(
                  'pill',
                  dday.days <= 3 && dday.days >= 0
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-blue-50 text-blue-700',
                )}
              >
                &#9200; {dday.label} &middot; 마감 {item.deadline?.replace(/-/g, '.')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline tracker */}
      <div className="card p-5">
        <div className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
          Progress
        </div>
        <div className="relative flex items-start justify-between">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-[var(--color-border-subtle)]" />
          <div
            className="absolute top-4 left-8 h-0.5 bg-indigo-500 transition-all"
            style={{
              width: `calc(${
                currentStageIdx < 0
                  ? 0
                  : (currentStageIdx / (PIPELINE.length - 1)) * 100
              }% - ${currentStageIdx < 0 ? 0 : 32}px)`,
            }}
          />
          {PIPELINE.map((p, i) => {
            const done = i < currentStageIdx;
            const current = i === currentStageIdx;
            return (
              <div
                key={p.key}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all',
                    done
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : current
                        ? 'bg-[var(--color-bg-surface)] border-indigo-500 text-indigo-700 ring-4 ring-indigo-100'
                        : 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]',
                  )}
                >
                  {done ? '\u2713' : i + 1}
                </div>
                <div
                  className={cn(
                    'text-[11px] font-semibold',
                    current
                      ? 'text-indigo-700'
                      : done
                        ? 'text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-tertiary)]',
                  )}
                >
                  {p.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Info card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-[var(--color-text-primary)]">기본 정보</div>
            </div>
            <dl className="grid grid-cols-2 gap-5 text-[13px]">
              <Info label="회사" value={item.company} />
              <Info label="포지션" value={item.position ?? '-'} />
              <Info label="고용 형태" value={employmentLabel(item.employmentType)} />
              <Info label="경로" value={item.channel ?? '-'} />
              <Info
                label="채용 공고"
                value={
                  item.jobPostingUrl ? (
                    <a
                      href={item.jobPostingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 truncate"
                    >
                      {item.jobPostingUrl}
                      <IconArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    '-'
                  )
                }
                wide
              />
            </dl>
          </div>

          {/* Memo */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[15px] font-bold text-[var(--color-text-primary)]">메모</div>
              <button
                type="button"
                onClick={() => alert('AI 요약 기능은 준비 중이에요.')}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <IconSparkles className="w-3.5 h-3.5" />
                AI 요약
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                className="w-full min-h-[140px] px-3.5 py-2.5 text-[13px] bg-[var(--color-bg-muted)] border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none text-[var(--color-text-primary)]"
              />
            ) : (
              <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {item.memo || '메모가 없어요.'}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Status block */}
          <div className="card p-5">
            <div className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              상태
            </div>
            <div
              className={cn(
                'rounded-xl border-2 p-4',
                stage.bg,
                stage.border,
              )}
            >
              <div className={cn('text-[16px] font-bold', stage.text)}>
                {stage.label}
              </div>
              <div className="text-[11.5px] text-[var(--color-text-secondary)] mt-1">
                현재 진행 중인 단계
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusPickerOpen((v) => !v)}
                className="btn-outline w-full mt-3"
                disabled={transitionMutation.isPending}
              >
                {transitionMutation.isPending ? '변경 중...' : '상태 변경'}
              </button>
              {statusPickerOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {ALL_STATUSES.filter((s) => s !== item.currentStatus).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => transitionMutation.mutate(s)}
                        className="w-full text-left px-4 py-2.5 text-[12.5px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors"
                      >
                        {getStatusLabel(s)}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="card p-5">
            <div className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              기록
            </div>
            <ol className="space-y-3">
              <TimestampRow label="생성" value={item.createdAt} />
              <TimestampRow label="제출" value={item.submittedAt ?? '-'} />
              <TimestampRow label="최종 수정" value={item.updatedAt} />
              {item.deadline && (
                <TimestampRow
                  label="마감"
                  value={item.deadline}
                  emphasize
                />
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
        {label}
      </dt>
      <dd className="text-[var(--color-text-primary)] font-medium truncate">{value}</dd>
    </div>
  );
}

function TimestampRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <IconClock
        className={cn(
          'w-4 h-4 shrink-0',
          emphasize ? 'text-rose-500' : 'text-[var(--color-text-tertiary)]',
        )}
      />
      <div className="flex-1 text-[12px] text-[var(--color-text-secondary)]">{label}</div>
      <div
        className={cn(
          'text-[12px] font-semibold',
          emphasize ? 'text-rose-600' : 'text-[var(--color-text-primary)]',
        )}
      >
        {value === '-' ? '-' : value.replace(/-/g, '.')}
      </div>
    </li>
  );
}
