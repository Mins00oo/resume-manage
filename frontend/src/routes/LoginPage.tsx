import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleDemo = () => {
    sessionStorage.removeItem('skipAutoDemo');
    setToken('demo-token');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a14] text-white">
      {/* Background — soft gradient mesh */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,102,241,0.28), transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(217,70,239,0.22), transparent 60%), radial-gradient(ellipse 60% 60% at 50% 100%, rgba(14,165,233,0.18), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-white text-sm font-extrabold tracking-tight">
              R.
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight">
              Resume Manage
            </div>
            <div className="text-[10px] text-white/40 font-medium tracking-[0.14em] uppercase">
              Career workspace
            </div>
          </div>
        </div>
        <div className="text-xs text-white/40 tracking-wide hidden sm:block">
          v1.0 · personal project
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 min-h-[calc(100vh-96px)] flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1.25fr_1fr] gap-16 items-center">
          {/* Hero */}
          <div className="space-y-10">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] tracking-wide text-white/75 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                Resume · Applies · Interviews — all in one place
              </span>

              <h1 className="text-[2.8rem] lg:text-[3.4rem] font-bold leading-[1.05] tracking-[-0.03em]">
                커리어, 흩어지지 않게.
                <br />
                <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-sky-200 bg-clip-text text-transparent">
                  한 워크스페이스에서.
                </span>
              </h1>

              <p className="text-[17px] text-white/55 leading-[1.65] max-w-xl">
                이력서 · 지원 트래킹 · 마감 · 면접 · AI 자소서 교정까지,
                <br />
                이직 준비에 필요한 것들만 깔끔하게.
              </p>
            </div>

            {/* Feature tiles */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                    {f.emoji}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-white/90">
                      {f.title}
                    </div>
                    <div className="text-[11.5px] text-white/50 leading-snug">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login card */}
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-1 bg-gradient-to-br from-indigo-500/35 via-violet-500/25 to-fuchsia-500/30 rounded-3xl blur-2xl"
              />

              <div className="relative backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <span className="text-white text-xl font-extrabold tracking-tight">
                        R.
                      </span>
                    </div>
                    <div className="text-center space-y-1">
                      <h2 className="text-[18px] font-semibold tracking-tight">
                        시작해볼까요?
                      </h2>
                      <p className="text-[13px] text-white/50">
                        로그인하면 바로 대시보드로 이동해요
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Google login */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="group w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3.5 rounded-xl hover:bg-white/95 hover:shadow-xl hover:shadow-white/10 transition-all active:scale-[0.98]"
                  >
                    <GoogleIcon />
                    <span className="text-[14px]">Google 계정으로 계속하기</span>
                  </button>

                  {/* Demo button */}
                  <button
                    type="button"
                    onClick={handleDemo}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all"
                  >
                    <span>데모 데이터로 둘러보기</span>
                    <span className="text-[11px] text-white/40">→</span>
                  </button>

                  <p className="text-[11px] text-white/40 text-center leading-relaxed">
                    백엔드 연결 없이도 모든 화면을 체험할 수 있어요.
                    <br />
                    실제 데이터는 저장되지 않아요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    emoji: '📝',
    title: '회사별 이력서 빌더',
    desc: '섹션 조립식 에디터 + 실시간 A4 프리뷰',
  },
  {
    emoji: '📊',
    title: '지원 파이프라인',
    desc: '테이블 / 보드 / 캘린더 3가지 시점',
  },
  {
    emoji: '🔔',
    title: '마감 & 면접 알림',
    desc: '중요한 일정은 절대 놓치지 않게',
  },
  {
    emoji: '🤖',
    title: 'AI 자소서 교정',
    desc: 'Claude · GPT · Gemini 순차 개선',
  },
];

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
