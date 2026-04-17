import { cn } from '../../lib/cn';

type Props = {
  completion: number;
  onSave: () => void;
  onPreview: () => void;
  saving?: boolean;
  saved?: boolean;
};

export default function ResumeBottomBar({ onSave, onPreview, saving }: Props) {
  return (
    <div
      className="border-t"
      style={{
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      {/* Actions */}
      <div className="px-4 py-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="w-10 h-10 rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors shrink-0"
          title="미리보기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={cn(
            'flex-1 h-10 rounded-xl text-[14px] font-semibold text-white transition-colors flex items-center justify-center gap-2',
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
