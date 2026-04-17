import type { ResumeDocument } from '../../mocks/data';
import { cn } from '../../lib/cn';

type SectionItem = {
  key: string;
  label: string;
  required?: boolean;
  filled: boolean;
};

type Props = {
  doc: ResumeDocument;
  hiddenSections: string[];
  onToggleSection: (sectionKey: string) => void;
  onScrollTo: (sectionKey: string) => void;
  onPreview: () => void;
  onSave: () => void;
  saving: boolean;
  careerDescFileId: number | null;
  portfolioFileId: number | null;
};

export default function ResumeSidePanel({
  doc,
  hiddenSections,
  onToggleSection,
  onScrollTo,
  onPreview,
  onSave,
  saving,
  careerDescFileId,
  portfolioFileId,
}: Props) {
  const sections: SectionItem[] = [
    {
      key: 'basicInfo',
      label: '기본 정보',
      required: true,
      filled: !!(doc.profile.name && doc.profile.email),
    },
    {
      key: 'experiences',
      label: '경력',
      filled: doc.experiences.length > 0,
    },
    {
      key: 'projects',
      label: '프로젝트',
      filled: doc.projects.length > 0,
    },
    {
      key: 'careerDescription',
      label: '경력기술서',
      filled: careerDescFileId != null,
    },
    {
      key: 'portfolio',
      label: '포트폴리오',
      filled: portfolioFileId != null,
    },
    {
      key: 'education',
      label: '교육',
      filled: doc.education.length > 0,
    },
    {
      key: 'certifications',
      label: '자격증',
      filled: doc.certifications.length > 0,
    },
    {
      key: 'languages',
      label: '외국어',
      filled: doc.languages.length > 0,
    },
    {
      key: 'about',
      label: '자기소개',
      filled: (doc.about?.length ?? 0) > 10,
    },
  ];

  const filledCount = sections.filter((s) => s.filled).length;
  const completion = Math.round((filledCount / sections.length) * 100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Completion */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              완성도 {completion}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completion}%`,
                background: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Section Checklist */}
        <div className="space-y-0.5">
          {sections.map((s) => {
            const isHidden = hiddenSections.includes(s.key);
            return (
              <div
                key={s.key}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer group"
                onClick={() => onScrollTo(s.key)}
              >
                {/* Check icon */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                    s.filled
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-[var(--color-bg-muted)] text-[var(--color-text-quaternary)]',
                  )}
                >
                  {s.filled ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <span className="flex-1 text-[13px] text-[var(--color-text-primary)]">{s.label}</span>

                {/* Required badge */}
                {s.required && (
                  <span className="text-[10px] text-rose-500 font-semibold">* 필수</span>
                )}

                {/* Visibility toggle */}
                {!s.required && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSection(s.key);
                    }}
                    className={cn(
                      'w-6 h-6 rounded flex items-center justify-center transition-colors',
                      isHidden
                        ? 'text-[var(--color-text-quaternary)]'
                        : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                    )}
                    title={isHidden ? '표시하기' : '숨기기'}
                  >
                    {isHidden ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div
          className="pt-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <h3 className="text-[12px] font-semibold text-[var(--color-text-secondary)] mb-3">설정</h3>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--color-text-primary)]">테마</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--color-text-secondary)]">스탠다드</span>
              <button
                type="button"
                onClick={onPreview}
                className="px-3 py-1.5 text-[12px] font-semibold text-indigo-600 border border-indigo-200 dark:border-indigo-500/30 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                미리보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save button - sticky bottom */}
      <div className="shrink-0 p-4 border-t border-[var(--color-border-subtle)]">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={cn(
            'w-full h-11 rounded-xl text-[14px] font-semibold text-white transition-colors flex items-center justify-center gap-2',
            saving
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700',
          )}
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {saving ? '저장 중' : '저장'}
        </button>
      </div>
    </div>
  );
}
