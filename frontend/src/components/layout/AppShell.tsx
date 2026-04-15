import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { ApiResponse, MeResponse } from '../../types/api';

const navItems = [
  { to: '/', label: '대시보드', end: true },
  { to: '/applies', label: '지원 내역', end: false },
  { to: '/resumes', label: '이력서', end: false },
];

export default function AppShell() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const navigate = useNavigate();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      api.get<ApiResponse<MeResponse>>('/api/me').then((r) => r.data.data!),
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="text-lg font-bold text-indigo-600">Resume Manage</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          {me && (
            <div className="flex items-center gap-3 mb-3">
              {me.profileImageUrl ? (
                <img
                  src={me.profileImageUrl}
                  alt={me.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                  {me.name?.[0] ?? '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {me.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{me.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-xs text-slate-500 hover:text-slate-900 py-2 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>
      <main className="pl-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
