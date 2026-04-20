import { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../common/Toast';
import { useThemeStore } from '../../store/themeStore';
import { mockMe } from '../../mocks/data';
import {
  IconDashboard,
  IconApplies,
  IconResumes,
  IconCalendar,
  IconSettings,
  IconLogout,
  IconBell,
  IconSun,
  IconMoon,
  IconMenu,
  IconX,
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
  '/settings': { title: '설정', subtitle: '앱 환경을 내 스타일대로' },
  '/settings/privacy': { title: '개인정보 처리방침', subtitle: '' },
  '/settings/terms': { title: '이용약관', subtitle: '' },
};

function matchPageTitle(pathname: string) {
  if (pathname.startsWith('/applies/new')) return pageTitles['/applies/new'];
  if (pathname.startsWith('/applies')) return pageTitles['/applies'];
  if (pathname.startsWith('/resumes')) return pageTitles['/resumes'];
  if (pathname.startsWith('/calendar')) return pageTitles['/calendar'];
  if (pathname.startsWith('/settings/privacy')) return pageTitles['/settings/privacy'];
  if (pathname.startsWith('/settings/terms')) return pageTitles['/settings/terms'];
  if (pathname.startsWith('/settings')) return pageTitles['/settings'];
  return pageTitles['/'];
}

export default function AppShell() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedTheme = useThemeStore((s) => s.resolved);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebarCollapsed', String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

  const me = mockMe;

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const page = matchPageTitle(location.pathname);
  const isImmersive = /^\/resumes\/(new|\d+)/.test(location.pathname);

  // NOTE: Tailwind JIT 는 소스에서 완전한 클래스명을 스캔해야 하므로
  // `md:${...}` 같은 템플릿 문자열은 생성되지 않는다. 반드시 리터럴로 작성한다.
  const sidebarWidthMd = collapsed ? 'md:w-16' : 'md:w-64';
  const mainPadding = collapsed ? 'md:pl-16' : 'md:pl-64';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeSidebar} aria-hidden />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 flex flex-col z-50 transition-all duration-300 ease-in-out',
          'md:translate-x-0 md:z-30',
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full',
          sidebarWidthMd,
        )}
        style={{
          background: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border-subtle)',
          width: sidebarOpen ? '16rem' : undefined,
        }}
      >
        {/* Header */}
        <div
          className={cn('h-16 flex items-center gap-2.5', collapsed ? 'px-3 justify-center' : 'px-6')}
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
            <span className="text-white text-sm font-extrabold tracking-tight">R.</span>
          </div>
          {!collapsed && (
            <div className="leading-tight flex-1 min-w-0">
              <div className="text-[15px] font-bold tracking-tight text-[var(--color-text-primary)]">Resume Manage</div>
            </div>
          )}
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className={cn('flex-1 pt-5 pb-4 space-y-0.5 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--color-text-tertiary)]">Workspace</div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-xl text-[13.5px] font-medium transition-all',
                    collapsed ? 'justify-center py-2.5 px-0' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)] dark:bg-indigo-500/[0.12] dark:text-indigo-300 dark:shadow-[inset_0_0_0_1px_rgba(129,140,248,0.2)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-[var(--color-text-tertiary)]')} />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}

          {!collapsed && (
            <div className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--color-text-tertiary)]">Account</div>
          )}
          <NavLink
            to="/settings"
            onClick={closeSidebar}
            title={collapsed ? '설정' : undefined}
            className={({ isActive }) =>
              cn(
                'w-full flex items-center rounded-xl text-[13.5px] font-medium transition-all',
                collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)] dark:bg-indigo-500/[0.12] dark:text-indigo-300 dark:shadow-[inset_0_0_0_1px_rgba(129,140,248,0.2)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <IconSettings className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-[var(--color-text-tertiary)]')} />
                {!collapsed && <span>설정</span>}
              </>
            )}
          </NavLink>
        </nav>

        {/* User card */}
        <div className="p-3" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <div className={cn('flex items-center rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors', collapsed ? 'justify-center p-2' : 'gap-3 p-2.5')}>
            {me.profileImageUrl ? (
              <img src={me.profileImageUrl} alt={me.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-[var(--color-border-subtle)]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-indigo-600/20 shrink-0">
                {me.name?.[0] ?? '?'}
              </div>
            )}
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{me.name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{me.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="로그아웃"
                  className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors"
                >
                  <IconLogout className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Floating collapse toggle — 사이드바 우측 가장자리 중앙 */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className={cn(
            'hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-40',
            'w-6 h-6 rounded-full items-center justify-center',
            'bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]',
            'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
            'shadow-sm hover:shadow-md transition-all',
            'opacity-60 hover:opacity-100',
          )}
        >
          <svg
            className={cn('w-3 h-3 transition-transform', collapsed ? '' : 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </aside>

      {/* Main */}
      <main className={cn(
        'flex flex-col transition-all duration-300',
        isImmersive ? 'h-[100dvh] md:h-screen pb-[calc(60px+env(safe-area-inset-bottom,0px))] md:pb-0' : 'min-h-screen pb-16 md:pb-0',
        mainPadding,
      )}>
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 backdrop-blur-lg"
          style={{
            background: 'color-mix(in srgb, var(--color-bg-surface) 80%, transparent)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center justify-between gap-3 h-14 md:h-16 px-4 md:px-8">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-9 h-9 -ml-1 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors shrink-0"
                aria-label="메뉴 열기"
              >
                <IconMenu className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-[16px] md:text-[18px] font-bold tracking-tight text-[var(--color-text-primary)] truncate">{page.title}</h1>
                <p className="text-[11px] md:text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate hidden md:block">{page.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                title={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors"
              >
                {resolvedTheme === 'dark' ? <IconSun className="w-[18px] h-[18px]" /> : <IconMoon className="w-[18px] h-[18px]" />}
              </button>
              <button
                type="button"
                onClick={() => toast('알림 기능은 준비 중이에요.', 'info')}
                className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center transition-colors"
              >
                <IconBell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-2 md:top-2 md:right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500" style={{ boxShadow: '0 0 0 2px var(--color-bg-surface)' }} />
              </button>
            </div>
          </div>
        </header>

        <div className={cn(
          'flex-1',
          isImmersive ? 'flex flex-col min-h-0 overflow-hidden' : 'px-4 md:px-8 py-6 md:py-8',
        )}>
          <div className={cn(
            isImmersive ? 'flex-1 flex flex-col min-h-0' : 'max-w-[1360px] mx-auto animate-fade-up',
          )}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom Tab Bar — mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <div className="flex items-center justify-around h-[60px] px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/');
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1">
                <Icon className={cn('w-[22px] h-[22px] transition-colors', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--color-text-tertiary)]')} />
                <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--color-text-tertiary)]')}>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
