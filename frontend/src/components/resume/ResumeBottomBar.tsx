import { cn } from '../../lib/cn';

type Props = {
  completion: number;
  onSave: () => void;
  onSettings: () => void;
  onMore: () => void;
  saving?: boolean;
  saved?: boolean;
};

export default function ResumeBottomBar({ completion, onSave, onSettings, onMore, saving, saved }: Props) {
  return (
    <div
      className="fixed left-0 right-0 z-30 border-t"
      style={{
        bottom: 0,
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 60px)',
      }}
    >
      {/* Progress bar */}
      <div className="px-4 pt-2.5 flex items-center gap-3">
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] shrink-0">
          완성도 {completion}%
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completion}%`,
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onSettings}
          className="w-10 h-10 rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onMore}
          className="w-10 h-10 rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={cn(
            'flex-1 h-10 rounded-xl text-[14px] font-semibold text-white transition-colors',
            saving
              ? 'bg-indigo-400 cursor-not-allowed'
              : saved
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-700',
          )}
        >
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
        </button>
      </div>
    </div>
  );
}
