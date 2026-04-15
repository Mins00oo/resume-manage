# Resume Manage — Frontend

React 19 + Vite + TypeScript PWA.

## 스택

- **Vite** — 번들러
- **React 19 + TypeScript**
- **TailwindCSS** + **shadcn/ui** — UI
- **React Router v7** — 라우팅
- **TanStack Query** — 서버 상태
- **Zustand** — 클라이언트 상태 (인증 정보 등)
- **Axios** — HTTP 클라이언트
- **Vite PWA Plugin** — PWA / Service Worker

## 실행

```bash
npm install
npm run dev          # localhost:5173
npm run build
npm run preview
npm run lint
```

## 디렉토리

```
frontend/
├── package.json / vite.config.ts / tsconfig.json
├── index.html
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── routes/              # 페이지 컴포넌트
    │   ├── LoginPage.tsx
    │   ├── OAuthCallbackPage.tsx
    │   └── HomePage.tsx
    ├── lib/
    │   ├── api.ts           # axios instance (JWT header 인터셉터)
    │   └── auth.ts          # 인증 관련 헬퍼
    ├── store/
    │   └── authStore.ts     # Zustand 인증 스토어
    ├── components/
    │   └── ui/              # shadcn 컴포넌트
    └── styles/
        └── globals.css
```

## 백엔드 연동

- 백엔드 베이스 URL: `http://localhost:8080`
- 환경변수: `VITE_API_BASE_URL` (`.env.development` 에 설정)

## 인증 흐름 (Google OAuth2 via Backend)

1. 사용자가 `/login` 에서 "Google로 로그인" 클릭
2. 프론트가 `http://localhost:8080/oauth2/authorization/google` 로 **전체 페이지 리디렉션**
3. 구글 로그인 화면 → 허용 → 구글이 `http://localhost:8080/login/oauth2/code/google` 로 콜백
4. 백엔드가 OAuth 코드 → 토큰 교환 → User 생성/조회 → JWT 발급
5. 백엔드가 `http://localhost:5173/oauth-callback?token={JWT}` 로 리디렉션
6. 프론트 콜백 페이지가 URL 쿼리에서 토큰 추출 → localStorage + Zustand 저장 → `/` 홈으로 이동
7. 이후 API 요청은 axios 인터셉터가 `Authorization: Bearer {JWT}` 자동 첨부

## 로그인 상태 확인 엔드포인트

- `GET /api/me` — 현재 로그인 사용자 정보 반환

## 핵심 포인트

- 인증 토큰은 **localStorage** 에 저장 (`authToken` 키)
- 401 응답 시 자동으로 로그아웃 + `/login` 리디렉션
- PWA manifest 는 `vite-plugin-pwa` 가 생성
