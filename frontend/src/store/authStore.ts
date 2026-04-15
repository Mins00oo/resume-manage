import { create } from 'zustand';

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,
  setToken: (token) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem('authToken');
    set({ token: null });
  },
}));
