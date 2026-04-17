import { create } from 'zustand';

/**
 * Theme store — light / dark / system with localStorage persistence.
 *
 * - theme: 사용자 선택값 (light/dark/system 중 하나)
 * - resolved: 실제 적용된 값 (light/dark) — system일 때는 prefers-color-scheme 기반
 *
 * 초기 class 는 index.html 의 부트스트랩 스크립트가 붙이므로 첫 페인트에 플래시 없음.
 * 이 스토어는 React state 와 DOM 상태를 동기화하고 이후 변경을 처리함.
 */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const STORAGE_KEY = 'theme';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveInitial(): Theme {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

function applyClass(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

const initialTheme = resolveInitial();
const initialResolved = resolve(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolved: initialResolved,
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    const resolved = resolve(theme);
    applyClass(resolved);
    set({ theme, resolved });
  },
  toggle: () => {
    // 헤더 아이콘 버튼용 — 현재 "resolved" 기준으로 뒤집기
    const current = get().resolved;
    get().setTheme(current === 'dark' ? 'light' : 'dark');
  },
}));

// 초기 DOM 동기화
applyClass(initialResolved);

// system 선택 시 prefers-color-scheme 변경 감지
if (typeof window !== 'undefined' && window.matchMedia) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const state = useThemeStore.getState();
    if (state.theme !== 'system') return;
    const nextResolved: ResolvedTheme = mql.matches ? 'dark' : 'light';
    applyClass(nextResolved);
    useThemeStore.setState({ resolved: nextResolved });
  };
  if (mql.addEventListener) mql.addEventListener('change', handler);
  else mql.addListener(handler);
}
