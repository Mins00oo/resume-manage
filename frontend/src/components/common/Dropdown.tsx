import { useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconCheck } from '../icons/Icons';
import { cn } from '../../lib/cn';

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type DropdownProps<T extends string> = {
  value: T | '';
  onChange: (next: T | '') => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
};

/**
 * Custom dropdown — replaces native <select> so styling stays consistent
 * in both light and dark modes. Small, headless-ish, no external deps.
 *
 * Keyboard: Enter/Space opens, Escape closes, click-outside closes.
 * Focus ring matches the input-base style used elsewhere.
 */
export default function Dropdown<T extends string>({
  value,
  onChange,
  options,
  placeholder = '선택',
  emptyLabel = '전체',
  allowEmpty = true,
  className,
  menuClassName,
  disabled,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Click outside / escape to close
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = value === '' ? emptyLabel : selected?.label ?? placeholder;

  const handleSelect = (next: T | '') => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'h-[38px] w-full inline-flex items-center justify-between gap-2 px-3 text-[13px] rounded-lg',
          'bg-[var(--color-bg-surface)] border text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-bg-muted)] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open
            ? 'border-indigo-500'
            : 'border-[var(--color-border-default)]',
        )}
        style={{ minWidth: 140 }}
      >
        <span
          className={cn(
            'truncate',
            value === ''
              ? 'text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-text-primary)]',
          )}
        >
          {displayLabel}
        </span>
        <IconChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full left-0 right-0 mt-1.5 z-40 max-h-64 overflow-y-auto',
            'rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]',
            'shadow-[0_8px_24px_-12px_rgba(15,23,42,0.24)] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]',
            'p-1',
            menuClassName,
          )}
        >
          {allowEmpty && (
            <DropdownItem
              label={emptyLabel}
              selected={value === ''}
              onClick={() => handleSelect('')}
            />
          )}
          {options.map((opt) => (
            <DropdownItem
              key={opt.value}
              label={opt.label}
              hint={opt.hint}
              selected={value === opt.value}
              onClick={() => handleSelect(opt.value)}
            />
          ))}
          {options.length === 0 && !allowEmpty && (
            <div className="px-3 py-2 text-[12px] text-[var(--color-text-tertiary)]">
              옵션이 없어요
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-2.5 py-2 text-[13px] rounded-lg text-left transition-colors',
        selected
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/[0.12] dark:text-indigo-300'
          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{label}</div>
        {hint && (
          <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">
            {hint}
          </div>
        )}
      </div>
      {selected && (
        <IconCheck className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
      )}
    </button>
  );
}
