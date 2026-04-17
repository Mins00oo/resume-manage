import { useCallback, useEffect, useState, createContext, useContext, type ReactNode } from 'react';

/* ─── Types ─── */

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

/* ─── Context ─── */

const ToastContext = createContext<ToastContextValue | null>(null);

let _globalId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_globalId;
    setItems((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ options, resolve });
    });
  }, []);

  const handleConfirmResult = useCallback((result: boolean) => {
    dialog?.resolve(result);
    setDialog(null);
  }, [dialog]);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '420px' }}>
        {items.map((item) => (
          <ToastMessage key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
      {/* Confirm dialog */}
      {dialog && (
        <ConfirmDialog
          options={dialog.options}
          onResult={handleConfirmResult}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/* ─── Toast Message ─── */

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    icon: 'bg-emerald-500 text-white',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/20',
    icon: 'bg-rose-500 text-white',
    text: 'text-rose-800 dark:text-rose-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    icon: 'bg-amber-500 text-white',
    text: 'text-amber-800 dark:text-amber-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    icon: 'bg-blue-500 text-white',
    text: 'text-blue-800 dark:text-blue-300',
  },
};

/* ─── Confirm Dialog ─── */

function ConfirmDialog({ options, onResult }: { options: ConfirmOptions; onResult: (v: boolean) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = (result: boolean) => {
    setVisible(false);
    setTimeout(() => onResult(result), 200);
  };

  const isDanger = options.variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => close(false)}
      />
      {/* Dialog */}
      <div
        className="relative w-full max-w-[400px] rounded-2xl border shadow-2xl"
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-default)',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.2s',
        }}
      >
        <div className="p-6">
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)] mb-1">
            {options.title}
          </h3>
          {options.description && (
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              {options.description}
            </p>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={() => close(false)}
            className="flex-1 h-10 rounded-xl text-[13px] font-semibold border transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border-default)',
              background: 'var(--color-bg-surface)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-surface)'; }}
          >
            {options.cancelLabel ?? '취소'}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`flex-1 h-10 rounded-xl text-[13px] font-semibold text-white transition-colors ${
              isDanger
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {options.confirmLabel ?? '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast Message ─── */

function ToastMessage({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const c = COLORS[item.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(item.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${c.bg} ${c.border}`}
      style={{
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible && !exiting ? 1 : 0,
      }}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${c.icon}`}>
        {ICONS[item.type]}
      </div>
      <p className={`text-[13px] font-medium flex-1 ${c.text}`}>{item.message}</p>
      <button
        type="button"
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(item.id), 300); }}
        className={`shrink-0 text-[16px] leading-none opacity-50 hover:opacity-100 transition-opacity ${c.text}`}
      >
        ×
      </button>
    </div>
  );
}
