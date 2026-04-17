import { cn } from '../../lib/cn';

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  'aria-label'?: string;
};

/**
 * iOS 스타일 스위치. 전체 행을 클릭해도 토글되게 wrapping 하려면
 * 바깥에서 <label> 으로 감싸거나 onClick 핸들러로 묶어서 쓰세요.
 */
export default function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
  'aria-label': ariaLabel,
}: Props) {
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  if (label || description) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'w-full flex items-center justify-between gap-4 py-3.5 text-left transition-opacity',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="min-w-0 flex-1">
          {label && (
            <span className="block text-[14px] font-medium text-[var(--color-text-primary)]">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </span>
        <SwitchIndicator checked={checked} />
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn('shrink-0', disabled && 'opacity-50 cursor-not-allowed')}
    >
      <SwitchIndicator checked={checked} />
    </button>
  );
}

function SwitchIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ease-out',
        checked ? 'bg-indigo-600' : 'bg-[var(--color-bg-muted)]',
      )}
      aria-hidden
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
          checked && 'translate-x-5',
        )}
      />
    </span>
  );
}
