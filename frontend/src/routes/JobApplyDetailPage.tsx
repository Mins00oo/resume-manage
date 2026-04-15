import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { jobApplyApi } from '../lib/api/jobApply';
import type {
  EmploymentType,
  JobApplyCreateRequest,
  JobApplyDetail,
  JobApplyStatus,
} from '../types/jobApply';
import {
  ALL_STATUSES,
  employmentLabel,
  isTerminal,
  statusLabel,
} from '../lib/statusLabel';
import StatusBadge from '../components/jobapply/StatusBadge';
import { formatDate, formatDateTime } from '../lib/formatDate';

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'NEW', label: '신입' },
  { value: 'EXPERIENCED', label: '경력' },
  { value: 'INTERN', label: '인턴' },
  { value: 'CONTRACT', label: '계약직' },
];

type FormState = {
  company: string;
  position: string;
  jobPostingUrl: string;
  employmentType: EmploymentType | '';
  channel: string;
  deadline: string;
  memo: string;
};

const toFormState = (detail: JobApplyDetail): FormState => ({
  company: detail.company,
  position: detail.position ?? '',
  jobPostingUrl: detail.jobPostingUrl ?? '',
  employmentType: detail.employmentType ?? '',
  channel: detail.channel ?? '',
  deadline: detail.deadline ?? '',
  memo: detail.memo ?? '',
});

export default function JobApplyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['job-apply', numericId],
    queryFn: () => jobApplyApi.get(numericId),
    enabled: Number.isFinite(numericId) && numericId > 0,
  });

  useEffect(() => {
    if (data && !form) {
      setForm(toFormState(data));
    }
  }, [data, form]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['job-apply', numericId] });
    queryClient.invalidateQueries({ queryKey: ['job-applies'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const updateMutation = useMutation({
    mutationFn: (body: Partial<JobApplyCreateRequest>) =>
      jobApplyApi.update(numericId, body),
    onSuccess: () => {
      invalidate();
      setIsEditing(false);
      setErrorMsg(null);
    },
    onError: () => setErrorMsg('저장하지 못했어요. 잠시 후 다시 시도해주세요.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => jobApplyApi.delete(numericId),
    onSuccess: () => {
      invalidate();
      navigate('/applies');
    },
    onError: () => setErrorMsg('삭제하지 못했어요. 잠시 후 다시 시도해주세요.'),
  });

  const transitionMutation = useMutation({
    mutationFn: (to: JobApplyStatus) => jobApplyApi.transition(numericId, to),
    onSuccess: () => {
      invalidate();
      setErrorMsg(null);
    },
    onError: () =>
      setErrorMsg(
        '상태를 변경할 수 없어요. 현재 단계에서 불가능한 전이일 수 있어요.',
      ),
  });

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-600">잘못된 지원 ID에요.</p>
        <button
          type="button"
          onClick={() => navigate('/applies')}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
        >
          목록으로
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
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
          className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const handleSave = () => {
    if (!form) return;
    if (!form.company.trim()) {
      setErrorMsg('회사명은 필수 입력이에요.');
      return;
    }
    const body: Partial<JobApplyCreateRequest> = {
      company: form.company.trim(),
      position: form.position.trim() || undefined,
      jobPostingUrl: form.jobPostingUrl.trim() || undefined,
      employmentType: form.employmentType || undefined,
      channel: form.channel.trim() || undefined,
      deadline: form.deadline || undefined,
      memo: form.memo.trim() || undefined,
    };
    updateMutation.mutate(body);
  };

  const handleCancelEdit = () => {
    setForm(toFormState(data));
    setIsEditing(false);
    setErrorMsg(null);
  };

  const terminal = isTerminal(data.currentStatus);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <button
          type="button"
          onClick={() => navigate('/applies')}
          className="text-xs text-slate-500 hover:text-slate-900 mb-2"
        >
          ← 지원 내역으로
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 truncate">
              {data.company}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {data.position ?? '포지션 미지정'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  편집
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  삭제
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">진행 상태</h3>
          <StatusBadge status={data.currentStatus} />
        </div>
        {terminal ? (
          <p className="text-xs text-slate-500">
            종료된 상태라 더 이상 전이할 수 없어요.
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">다음 상태</label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  transitionMutation.mutate(e.target.value as JobApplyStatus);
                  e.target.value = '';
                }
              }}
              disabled={transitionMutation.isPending}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              <option value="">상태 변경 선택...</option>
              {ALL_STATUSES.filter((s) => s !== data.currentStatus).map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {errorMsg && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      <section className="rounded-xl bg-white border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">기본 정보</h3>
        {!isEditing ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Info label="회사" value={data.company} />
            <Info label="포지션" value={data.position} />
            <Info
              label="고용 형태"
              value={employmentLabel(data.employmentType)}
            />
            <Info label="경로" value={data.channel} />
            <Info label="마감일" value={formatDate(data.deadline)} />
            <Info label="제출일" value={formatDate(data.submittedAt)} />
            <Info
              label="채용 공고"
              value={
                data.jobPostingUrl ? (
                  <a
                    href={data.jobPostingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    {data.jobPostingUrl}
                  </a>
                ) : (
                  '-'
                )
              }
              wide
            />
            <Info
              label="메모"
              value={
                data.memo ? (
                  <span className="whitespace-pre-wrap">{data.memo}</span>
                ) : (
                  '-'
                )
              }
              wide
            />
          </dl>
        ) : (
          form && (
            <div className="space-y-4">
              <FormField label="회사" required>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </FormField>
              <FormField label="포지션">
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </FormField>
              <FormField label="채용 공고 URL">
                <input
                  type="url"
                  value={form.jobPostingUrl}
                  onChange={(e) =>
                    setForm({ ...form, jobPostingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="고용 형태">
                  <select
                    value={form.employmentType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        employmentType: e.target.value as EmploymentType | '',
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">선택 안함</option>
                    {EMPLOYMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="경로">
                  <input
                    type="text"
                    value={form.channel}
                    onChange={(e) =>
                      setForm({ ...form, channel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </FormField>
              </div>
              <FormField label="마감일">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </FormField>
              <FormField label="메모">
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </FormField>
            </div>
          )
        )}
      </section>

      <section className="rounded-xl bg-white border border-slate-200 p-5 text-xs text-slate-500 flex items-center justify-between">
        <span>등록 {formatDateTime(data.createdAt)}</span>
        <span>최종 수정 {formatDateTime(data.updatedAt)}</span>
      </section>

      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              이 지원을 삭제할까요?
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              삭제하면 목록에서 사라져요. 이 작업은 되돌릴 수 없어요.
            </p>
            <div className="flex gap-2 justify-end mt-5">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-lg transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type InfoProps = {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
};

function Info({ label, value, wide }: InfoProps) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium text-slate-500 mb-1">{label}</dt>
      <dd className="text-sm text-slate-900">
        {value === null || value === undefined || value === '' ? '-' : value}
      </dd>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
