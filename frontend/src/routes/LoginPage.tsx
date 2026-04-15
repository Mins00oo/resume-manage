export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* 배경 장식: 그리드 패턴 */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* 배경 장식: 빛나는 구체 */}
      <div
        aria-hidden
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-3xl animate-pulse-slow"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse-slow"
        style={{ animationDelay: '2s' }}
      />

      {/* 좌상단 로고 */}
      <div className="relative z-10 px-8 py-6">
        <div className="flex items-center gap-2 text-white/90">
          <Logo />
          <span className="font-semibold tracking-tight">Resume Manage</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="relative z-10 min-h-[calc(100vh-88px)] flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          {/* 왼쪽 Hero */}
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-wide text-white/80 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                혼자 만드는 취업 준비 동반자
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                이력서부터 지원까지,
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  한 곳에서 관리해요.
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-xl">
                귀찮은 취업·이직 준비, 조금 덜 귀찮게.
                <br />
                이력서·지원 트래킹·AI 자소서 교정까지 전부.
              </p>
            </div>

            {/* 기능 리스트 */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 transition-colors"
                >
                  <div className="text-2xl leading-none mt-0.5">{f.emoji}</div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-white/90">
                      {f.title}
                    </div>
                    <div className="text-xs text-white/50 leading-relaxed">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽 로그인 카드 */}
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="relative">
              {/* 카드 뒤 글로우 */}
              <div
                aria-hidden
                className="absolute -inset-1 bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 rounded-3xl blur-xl"
              />

              <div className="relative backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* 카드 상단 로고 */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <span className="text-2xl font-bold">R</span>
                    </div>
                    <div className="text-center space-y-1">
                      <h2 className="text-xl font-semibold">시작해볼까요?</h2>
                      <p className="text-sm text-white/50">
                        당신의 커리어 여정을 기록할 시간
                      </p>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* 구글 로그인 버튼 */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="group w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3.5 rounded-xl hover:bg-white/90 hover:shadow-xl hover:shadow-white/10 transition-all active:scale-[0.98]"
                  >
                    <GoogleIcon />
                    <span>Google 계정으로 계속하기</span>
                    <svg
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>

                  {/* 면책 */}
                  <p className="text-[11px] text-white/40 text-center leading-relaxed">
                    로그인하면 이메일과 프로필 정보 제공에 동의한 것으로
                    간주됩니다.
                    <br />
                    다른 용도로는 사용되지 않아요.
                  </p>
                </div>
              </div>

              {/* 카드 하단 캡션 */}
              <p className="text-center text-white/30 text-xs mt-5 tracking-wide">
                v1.0 · 개인 포트폴리오 프로젝트
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 keyframes */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const features = [
  {
    emoji: '📄',
    title: '회사별 이력서 관리',
    desc: '대표 이력서 + 회사 맞춤 버전을 자유롭게',
  },
  {
    emoji: '📅',
    title: '지원 트래커 & 알림',
    desc: '마감 3일 전 푸시, 단계별 합격률 집계',
  },
  {
    emoji: '🤖',
    title: 'AI 자소서 교정',
    desc: 'Claude · GPT · Gemini 가 순차로 다듬어요',
  },
  {
    emoji: '📑',
    title: '깔끔한 PDF 다운로드',
    desc: '카드 레이아웃 그대로, 한 번에 추출',
  },
];

function Logo() {
  return (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
      <span className="text-white text-sm font-bold">R</span>
    </div>
  );
}

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
