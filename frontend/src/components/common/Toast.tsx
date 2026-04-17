import { useCallback, useEffect, useState, createContext, useContext, type ReactNode } from 'react';

/* ─── Types ─── */

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

/* ─── Context ─── */

const ToastContext = createContext<ToastContextValue | null>(null);

let _globalId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_globalId;
    setItems((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '420px' }}>
        {items.map((item) => (
          <ToastMessage key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
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
