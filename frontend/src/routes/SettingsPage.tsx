import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { settingsApi, type UserPreferences } from '../lib/api/settings';
import { pushApi, ensurePushSubscription, removePushSubscription } from '../lib/api/push';
import Toggle from '../components/common/Toggle';
import SegmentedControl from '../components/common/SegmentedControl';
import { useToast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, type Theme } from '../store/themeStore';
import { IconLogout, IconSun, IconMoon } from '../components/icons/Icons';

type PushState = 'loading' | 'unsupported' | 'denied' | 'not-subscribed' | 'subscribed';

export default function SettingsPage() {
  const { toast, confirm } = useToast();
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [pushState, setPushState] = useState<PushState>('loading');

  // --- Preferences ---
  const { data: prefs } = useQuery({ queryKey: ['preferences'], queryFn: settingsApi.get });

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['preferences'] });
      const prev = queryClient.getQueryData<UserPreferences>(['preferences']);
      if (prev) queryClient.setQueryData<UserPreferences>(['preferences'], { ...prev, ...patch });
      return { prev };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['preferences'], ctx.prev);
      toast('설정 저장에 실패했어요.', 'error');
    },
    onSuccess: (data) => queryClient.setQueryData(['preferences'], data),
  });

  // --- Push 구독 상태 조회 ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
        if (!cancelled) setPushState('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        if (!cancelled) setPushState('denied');
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (!cancelled) setPushState(sub ? 'subscribed' : 'not-subscribed');
      } catch {
        if (!cancelled) setPushState('unsupported');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePushToggle = async (next: boolean) => {
    if (next) {
      try {
        const key = await pushApi.getVapidPublicKey();
        if (!key) {
          toast('서버에 푸시 키가 설정되지 않았어요. 관리자에게 문의해주세요.', 'warning');
          return;
        }
        const sub = await ensurePushSubscription(key);
        if (!sub) {
          if (Notification.permission === 'denied') setPushState('denied');
          toast('알림 권한이 필요해요.', 'warning');
          return;
        }
        await pushApi.subscribe(sub);
        setPushState('subscribed');
        toast('이 기기에서 알림을 받아요.', 'success');
      } catch {
        toast('알림 구독에 실패했어요.', 'error');
      }
    } else {
      try {
        const endpoint = await removePushSubscription();
        if (endpoint) await pushApi.unsubscribe(endpoint);
        setPushState('not-subscribed');
        toast('이 기기의 알림을 껐어요.', 'info');
      } catch {
        toast('알림 해제에 실패했어요.', 'error');
      }
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: '정말 계정을 삭제하시겠어요?',
      description: '탈퇴 후 30일 동안 보관됐다가 완전히 삭제돼요. 그 전에 다시 로그인하면 복구할 수 있어요.',
      confirmLabel: '계정 삭제',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await settingsApi.deleteAccount();
      clearToken();
      toast('계정을 삭제했어요.', 'success');
      navigate('/login', { replace: true });
    } catch {
      toast('계정 삭제에 실패했어요.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* 알림 */}
      <Section title="알림" icon="🔔">
        <Card>
          <Row>
            <Toggle
              label="지원 마감 알림"
              description="마감 3일 전부터 매일 오전 9시에 푸시로 알려드려요."
              checked={!!prefs?.deadlineNotificationsEnabled}
              disabled={!prefs}
              onChange={(v) => updateMutation.mutate({ deadlineNotificationsEnabled: v })}
            />
          </Row>
          <Row>
            <Toggle
              label="면접 일정 알림"
              description="면접 당일 오전에 한 번 알려드려요."
              checked={!!prefs?.interviewNotificationsEnabled}
              disabled={!prefs}
              onChange={(v) => updateMutation.mutate({ interviewNotificationsEnabled: v })}
            />
          </Row>
          <Row>
            <PushSubscriptionRow state={pushState} onChange={handlePushToggle} />
          </Row>
        </Card>
      </Section>

      {/* 캘린더 연동 */}
      <Section title="캘린더 연동" icon="🗓️">
        <Card>
          <Row>
            <div className="w-full flex items-center justify-between py-3.5 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                    Google 캘린더 동기화
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    준비 중
                  </span>
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                  면접 일정을 구글 캘린더에 자동으로 추가해드릴게요.
                </p>
              </div>
              <Toggle checked={false} disabled onChange={() => {}} aria-label="Google 캘린더 동기화" />
            </div>
          </Row>
        </Card>
      </Section>

      {/* 테마 */}
      <Section title="앱 테마" icon="🎨">
        <Card>
          <div className="py-4">
            <SegmentedControl<Theme>
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: '라이트', icon: <IconSun className="w-4 h-4" /> },
                { value: 'dark', label: '다크', icon: <IconMoon className="w-4 h-4" /> },
                { value: 'system', label: '시스템' },
              ]}
            />
            <p className="text-[11.5px] text-[var(--color-text-tertiary)] mt-3">
              '시스템'을 선택하면 기기 설정을 따라가요.
            </p>
          </div>
        </Card>
      </Section>

      {/* 계정 */}
      <Section title="계정" icon="👤">
        <Card>
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[12px] text-[var(--color-text-tertiary)]">로그인 계정</div>
              <div className="text-[14px] font-medium text-[var(--color-text-primary)] truncate">
                <Email />
              </div>
            </div>
          </div>
          <Row>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between py-3.5 text-left"
            >
              <span className="text-[14px] font-medium text-[var(--color-text-primary)]">로그아웃</span>
              <IconLogout className="w-4 h-4 text-[var(--color-text-tertiary)]" />
            </button>
          </Row>
          <Row>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full py-3.5 text-left text-[14px] font-medium text-rose-600 dark:text-rose-400"
            >
              계정 삭제
            </button>
          </Row>
        </Card>
      </Section>

      {/* 정보 */}
      <Section title="정보" icon="ℹ️">
        <Card>
          <Row>
            <LinkRow label="개인정보 처리방침" to="/settings/privacy" />
          </Row>
          <Row>
            <LinkRow label="이용약관" to="/settings/terms" />
          </Row>
          <Row>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[14px] font-medium text-[var(--color-text-primary)]">버전</span>
              <span className="text-[13px] text-[var(--color-text-tertiary)] font-mono">v1.0.0</span>
            </div>
          </Row>
          <Row>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[14px] font-medium text-[var(--color-text-primary)]">문의</span>
              <a href="mailto:alstn7223@gmail.com" className="text-[13px] text-indigo-600 dark:text-indigo-400">
                alstn7223@gmail.com
              </a>
            </div>
          </Row>
        </Card>
      </Section>

      <div className="h-12" />
    </div>
  );
}

/* ─── Subcomponents ─── */

function Section({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--color-text-tertiary)] mb-2 px-1">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="card divide-y divide-[var(--color-border-subtle)] px-4">{children}</div>;
}

function Row({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function LinkRow({ label, to }: { label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-between py-3.5">
      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">{label}</span>
      <svg className="w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
      </svg>
    </Link>
  );
}

function Email() {
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { api } = await import('../lib/api');
      const res = await api.get<{ data: { email: string; name: string } | null }>('/api/me');
      return res.data.data;
    },
  });
  return <>{data?.email ?? '—'}</>;
}

function PushSubscriptionRow({ state, onChange }: { state: PushState; onChange: (v: boolean) => void }) {
  if (state === 'loading') {
    return (
      <div className="py-3.5 text-[13px] text-[var(--color-text-tertiary)]">알림 상태 확인 중…</div>
    );
  }
  if (state === 'unsupported') {
    return (
      <div className="py-3.5 text-[13px] text-[var(--color-text-tertiary)]">
        이 브라우저에서는 푸시 알림을 지원하지 않아요. 앱을 홈 화면에 추가한 뒤 다시 시도해주세요.
      </div>
    );
  }
  if (state === 'denied') {
    return (
      <div className="py-3.5">
        <div className="text-[14px] font-medium text-[var(--color-text-primary)]">이 기기에서 알림 받기</div>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">
          브라우저에서 알림이 차단돼 있어요. 주소창 왼쪽 자물쇠 아이콘 → 알림 허용으로 바꿔주세요.
        </p>
      </div>
    );
  }
  return (
    <Toggle
      label="이 기기에서 알림 받기"
      description="기기/브라우저별로 따로 설정돼요. PC · 모바일에서 각각 켜주세요."
      checked={state === 'subscribed'}
      onChange={onChange}
    />
  );
}
