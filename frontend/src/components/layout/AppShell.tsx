import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { mockMe } from '../../mocks/data';
import {
  IconDashboard,
  IconApplies,
  IconResumes,
  IconCalendar,
  IconSettings,
  IconLogout,
  IconSearch,
  IconBell,
  IconPlus,
} from '../icons/Icons';
import { cn } from '../../lib/cn';

const navItems = [
  { to: '/', label: '대시보드', icon: IconDashboard, end: true },
  { to: '/applies', label: '지원 관리', icon: IconApplies, end: false },
  { to: '/resumes', label: '이력서', icon: IconResumes, end: false },
  { to: '/calendar', label: '캘린더', icon: IconCalendar, end: false },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '대시보드', subtitle: '오늘의 커리어 요약' },
  '/applies': { title: '지원 관리', subtitle: '지원한 회사들을 한눈에' },
  '/applies/new': { title: '새 지원 등록', subtitle: '회사를 추가해보세요' },
  '/resumes': { title: '이력서', subtitle: '회사별 이력서를 관리해요' },
  '/calendar': { title: '캘린더', subtitle: '마감 · 면접 · 제출 일정' },
};

function matchPageTitle(pathname: string) {
  if (pathname.startsWith('/applies/new')) return pageTitles['/applies/new'];
  if (pathname.startsWith('/applies')) return pageTitles['/applies'];
  if (pathname.startsWith('/resumes')) return pageTitles['/resumes'];
  if (pathname.startsWith('/calendar')) return pageTitles['/calendar'];
  return pageTitles['/'];
}

export default function AppShell() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data fallback: when no real API, we just show a sample user.
  const me = mockMe;

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  const page = matchPageTitle(location.pathname);

  // Hide the page header on immersive pages (resume editor)
  const isImmersive = /^\/resumes\/\d+/.test(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900">
      {/* ---------- Sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/80 flex flex-col z-30">
        <div className="h-16 flex items-center px-6 gap-2.5 border-b border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/25">
            <span className="text-white text-sm font-extrabold tracking-tight">
              R.
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-slate-900">
              Resume Manage
            </div>
            <div className="text-[10.5px] text-slate-500 font-medium tracking-wide uppercase">
              Career workspace
            </div>
          </div>
        </div>

        {/* Quick add */}
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/applies/new')}
            className="w-full group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-2">
              <IconPlus className="w-4 h-4" />
              <span>새 지원 추가</span>
            </span>
            <span className="text-[10px] font-mono text-white/80 bg-white/10 border border-white/20 rounded px-1.5 py-0.5">
              ⌘N
            </span>
          </button>
        </div>

        <nav className="flex-1 px-3 pt-5 pb-4 space-y-0.5">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] shrink-0',
                        isActive ? 'text-indigo-600' : 'text-slate-400',
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400">
            Account
          </div>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <IconSettings className="w-[18px] h-[18px] shrink-0 text-slate-400" />
            <span>설정</span>
          </button>
        </nav>

        {/* User card */}
        <div className="border-t border-slate-200/80 p-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            {me.profileImageUrl ? (
              <img
                src={me.profileImageUrl}
                alt={me.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-indigo-600/20">
                {me.name?.[0] ?? '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-900 truncate">
                {me.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{me.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="로그아웃"
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 flex items-center justify-center transition-colors"
            >
              <IconLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="pl-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200/70">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold tracking-tight text-slate-900 truncate">
                {page.title}
              </h1>
              <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                {page.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="회사, 포지션, 태그 검색…"
                  className="w-full pl-9 pr-14 py-2 text-[13px] bg-slate-100/80 border border-transparent hover:bg-slate-100 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-indigo-500/30 rounded-lg transition-all placeholder:text-slate-400 focus:outline-none"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </div>
              <button
                type="button"
                className="relative w-10 h-10 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <IconBell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        <div className={cn('flex-1', isImmersive ? '' : 'px-8 py-8')}>
          <div
            className={cn(
              isImmersive ? '' : 'max-w-[1360px] mx-auto animate-fade-up',
            )}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
