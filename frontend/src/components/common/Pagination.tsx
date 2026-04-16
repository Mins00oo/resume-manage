import { IconChevronLeft, IconChevronRight } from '../icons/Icons';
import { cn } from '../../lib/cn';
import Dropdown from './Dropdown';

type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

/**
 * Reusable pagination bar.
 *
 * Renders:
 *   [<]  1 ... 4 5 [6] 7 8 ... 12  [>]      페이지당 [25 ▼]   121–145 / 287
 *
 * On narrow screens it collapses to `[<]  6 / 12  [>]`.
 */
export default function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const go = (next: number) => {
    const n = Math.min(Math.max(1, next), pageCount);
    if (n !== safePage) onPageChange(n);
  };

  const pages = makePageList(safePage, pageCount);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[var(--color-border-subtle)]',
        className,
      )}
    >
      {/* Page buttons (desktop) */}
      <div className="hidden sm:flex items-center gap-1">
        <PageBtn
          aria="이전 페이지"
          disabled={safePage === 1}
          onClick={() => go(safePage - 1)}
        >
          <IconChevronLeft className="w-4 h-4" />
        </PageBtn>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1.5 text-[12px] text-[var(--color-text-tertiary)]"
            >
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              aria={`${p} 페이지`}
              active={p === safePage}
              onClick={() => go(p)}
            >
              {p}
            </PageBtn>
          ),
        )}

        <PageBtn
          aria="다음 페이지"
          disabled={safePage === pageCount}
          onClick={() => go(safePage + 1)}
        >
          <IconChevronRight className="w-4 h-4" />
        </PageBtn>
      </div>

      {/* Compact (mobile) */}
      <div className="flex sm:hidden items-center gap-2">
        <PageBtn
          aria="이전 페이지"
          disabled={safePage === 1}
          onClick={() => go(safePage - 1)}
        >
          <IconChevronLeft className="w-4 h-4" />
        </PageBtn>
        <span className="text-[12px] text-[var(--color-text-secondary)] font-medium tabular-nums">
          {safePage} / {pageCount}
        </span>
        <PageBtn
          aria="다음 페이지"
          disabled={safePage === pageCount}
          onClick={() => go(safePage + 1)}
        >
          <IconChevronRight className="w-4 h-4" />
        </PageBtn>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
            <span>페이지당</span>
            <Dropdown
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v))}
              options={pageSizeOptions.map((n) => ({
                value: String(n),
                label: `${n}개`,
              }))}
              allowEmpty={false}
              className="min-w-[90px]"
            />
          </div>
        )}
        <div className="text-[12px] text-[var(--color-text-tertiary)] tabular-nums">
          <span className="font-semibold text-[var(--color-text-secondary)]">
            {start}–{end}
          </span>
          <span> / {total}</span>
        </div>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  aria,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  aria?: string;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'min-w-[32px] h-[32px] inline-flex items-center justify-center px-2 rounded-lg text-[12.5px] font-semibold transition-colors tabular-nums',
        active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

function makePageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push('...');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}
