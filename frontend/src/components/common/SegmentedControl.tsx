import { cn } from '../../lib/cn';
import type { ReactNode } from 'react';

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  disabled?: boolean;
};

/**
 * iOS 스타일 segmented control. 2~4개 옵션에 적합.
 */
export default function SegmentedControl<T extends string>({ value, onChange, options, disabled }: Props<T>) {
  return (
    <div
      className={cn(
        'inline-flex w-full p-1 rounded-xl gap-1',
        'bg-[var(--color-bg-muted)]',
        disabled && 'opacity-50 pointer-events-none',
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all',
              active
                ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
