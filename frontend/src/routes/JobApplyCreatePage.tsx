import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { jobApplyApi } from '../lib/api/jobApply';
import type { EmploymentType, JobApplyCreateRequest } from '../types/jobApply';

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

const emptyState: FormState = {
  company: '',
  position: '',
  jobPostingUrl: '',
  employmentType: '',
  channel: '',
  deadline: '',
  memo: '',
};

export default function JobApplyCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyState);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (body: JobApplyCreateRequest) => jobApplyApi.create(body),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['job-applies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/applies/${id}`);
    },
    onError: () => {
      setErrorMsg('지원을 등록하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) {
      setErrorMsg('회사명은 필수 입력이에요.');
      return;
    }
    setErrorMsg(null);
    const body: JobApplyCreateRequest = {
      company: form.company.trim(),
      position: form.position.trim() || undefined,
      jobPostingUrl: form.jobPostingUrl.trim() || undefined,
      employmentType: form.employmentType || undefined,
      channel: form.channel.trim() || undefined,
      deadline: form.deadline || undefined,
      memo: form.memo.trim() || undefined,
    };
    mutation.mutate(body);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <button
          type="button"
          onClick={() => navigate('/applies')}
          className="text-xs text-slate-500 hover:text-slate-900 mb-2"
        >
          ← 지원 내역으로
        </button>
        <h1 className="text-2xl font-bold text-slate-900">새 지원 등록</h1>
        <p className="text-sm text-slate-500 mt-1">
          회사명만 입력해도 시작할 수 있어요.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-slate-200 p-6 space-y-5"
      >
        <Field label="회사" required>
          <input
            type="text"
            value={form.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="예: 네이버"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
        <Field label="포지션">
          <input
            type="text"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="예: 프론트엔드 엔지니어"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
        <Field label="채용 공고 URL">
          <input
            type="url"
            value={form.jobPostingUrl}
            onChange={(e) => handleChange('jobPostingUrl', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="고용 형태">
            <select
              value={form.employmentType}
              onChange={(e) =>
                handleChange('employmentType', e.target.value as EmploymentType | '')
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
          </Field>
          <Field label="경로">
            <input
              type="text"
              value={form.channel}
              onChange={(e) => handleChange('channel', e.target.value)}
              placeholder="예: 원티드, 링크드인"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>
        </div>
        <Field label="마감일">
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
        <Field label="메모">
          <textarea
            value={form.memo}
            onChange={(e) => handleChange('memo', e.target.value)}
            rows={4}
            placeholder="자유롭게 기록해두세요"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </Field>

        {errorMsg && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/applies')}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
          >
            {mutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ label, required, children }: FieldProps) {
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
