import { create } from 'zustand';

/**
 * Theme store — light/dark toggle with localStorage persistence.
 *
 * The initial class (`<html class="dark">`) is applied by an inline script
 * in index.html BEFORE React renders, so there's no flash on first paint.
 * This store keeps React state in sync with that DOM state and handles
 * subsequent toggles.
 */

export type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const STORAGE_KEY = 'theme';

function resolveInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  // Prefer what the bootstrap script already applied to <html>
  if (document.documentElement.classList.contains('dark')) return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyClass(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: resolveInitial(),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyClass(theme);
    set({ theme });
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

// Ensure DOM and store are in sync on module load.
applyClass(useThemeStore.getState().theme);
