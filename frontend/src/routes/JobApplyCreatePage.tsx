import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronLeft, IconSparkles } from '../components/icons/Icons';

const EMPLOYMENT_OPTIONS = [
  { value: 'NEW', label: '신입' },
  { value: 'EXPERIENCED', label: '경력' },
  { value: 'INTERN', label: '인턴' },
  { value: 'CONTRACT', label: '계약직' },
];

type FormState = {
  company: string;
  position: string;
  jobPostingUrl: string;
  employmentType: string;
  channel: string;
  deadline: string;
  salary: string;
  location: string;
  memo: string;
};

const emptyState: FormState = {
  company: '',
  position: '',
  jobPostingUrl: '',
  employmentType: '',
  channel: '',
  deadline: '',
  salary: '',
  location: '',
  memo: '',
};

export default function JobApplyCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyState);

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock: just return to list
    navigate('/applies');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate('/applies')}
        className="inline-flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium"
      >
        <IconChevronLeft className="w-3.5 h-3.5" />
        지원 목록
      </button>

      <div className="card p-8">
        <div className="mb-6">
          <div className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            New Application
          </div>
          <h2 className="text-[22px] font-bold tracking-tight text-[var(--color-text-primary)] mt-1">
            새 지원 등록
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            회사명만 적어도 저장할 수 있어요. 나머지는 나중에 채워넣어도 돼요.
          </p>
        </div>

        {/* URL auto-parse hint */}
        <div className="mb-6 rounded-xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <IconSparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-indigo-900 dark:text-indigo-300">
                채용 공고 URL로 자동 채우기
              </div>
              <div className="text-[11.5px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
                채용 공고 링크를 붙여넣으면 AI가 회사 · 포지션 · 마감일을 뽑아줘요.
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="회사" required>
            <input
              type="text"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="예: 네이버"
              className="input-base"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="포지션">
              <input
                type="text"
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="예: 프론트엔드 엔지니어"
                className="input-base"
              />
            </Field>
            <Field label="고용 형태">
              <select
                value={form.employmentType}
                onChange={(e) =>
                  handleChange('employmentType', e.target.value)
                }
                className="input-base"
              >
                <option value="">선택 안함</option>
                {EMPLOYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="채용 공고 URL">
            <input
              type="url"
              value={form.jobPostingUrl}
              onChange={(e) => handleChange('jobPostingUrl', e.target.value)}
              placeholder="https://careers.company.com/..."
              className="input-base"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="경로">
              <input
                type="text"
                value={form.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                placeholder="예: 원티드"
                className="input-base"
              />
            </Field>
            <Field label="연봉">
              <input
                type="text"
                value={form.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                placeholder="예: 6,000~8,000"
                className="input-base"
              />
            </Field>
            <Field label="위치">
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="예: 서울 강남"
                className="input-base"
              />
            </Field>
          </div>
          <Field label="마감일">
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              className="input-base"
            />
          </Field>
          <Field label="메모">
            <textarea
              value={form.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
              rows={4}
              placeholder="자유롭게 기록해두세요"
              className="input-base resize-none"
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => navigate('/applies')}
              className="btn-ghost"
            >
              취소
            </button>
            <button type="submit" className="btn-primary">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
