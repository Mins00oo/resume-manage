/**
 * Mock data so the redesigned UI renders without a backend.
 *
 * When real APIs are wired up, the typed hooks in `src/mocks/hooks.ts`
 * can be swapped for real TanStack Query calls without touching screens.
 */

import type { JobApplyStatus, EmploymentType } from '../types/jobApply';

/* ------------------------------------------------------------------ */
/* 👤  User                                                            */
/* ------------------------------------------------------------------ */

export const mockMe = {
  id: 1,
  name: '김민수',
  email: 'minsoo.kim@example.com',
  profileImageUrl: null as string | null,
  joinedAt: '2025-09-01',
};

/* ------------------------------------------------------------------ */
/* 📝  Job Applies                                                      */
/* ------------------------------------------------------------------ */

type Apply = {
  id: number;
  company: string;
  position: string;
  currentStatus: JobApplyStatus;
  employmentType: EmploymentType;
  channel: string;
  deadline: string | null;
  submittedAt: string | null;
  updatedAt: string;
  createdAt: string;
  jobPostingUrl: string;
  memo: string;
  tags: string[];
  salary?: string;
  location?: string;
  logoColor: string; // hex
};

const today = new Date('2026-04-15');
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return iso(d);
};

export const mockApplies: Apply[] = [
  {
    id: 1,
    company: '토스',
    position: '프론트엔드 엔지니어',
    currentStatus: 'INTERVIEW_IN_PROGRESS',
    employmentType: 'EXPERIENCED',
    channel: '원티드',
    deadline: addDays(3),
    submittedAt: addDays(-12),
    updatedAt: addDays(-1),
    createdAt: addDays(-14),
    jobPostingUrl: 'https://toss.im/career/123',
    memo: '1차 면접 통과. 2차 기술 인터뷰 준비 필요. React 퍼포먼스, 웹뷰 관련 경험 정리.',
    tags: ['금융', '스타트업'],
    salary: '6,500만원~',
    location: '서울 강남',
    logoColor: '#3182F6',
  },
  {
    id: 2,
    company: '카카오',
    position: '시니어 프론트엔드 개발자',
    currentStatus: 'DOCUMENT_PASSED',
    employmentType: 'EXPERIENCED',
    channel: '카카오 채용',
    deadline: addDays(5),
    submittedAt: addDays(-8),
    updatedAt: addDays(-2),
    createdAt: addDays(-10),
    jobPostingUrl: 'https://careers.kakao.com/1234',
    memo: '서류 통과, 코딩테스트 4/20 예정',
    tags: ['대기업'],
    salary: '7,000~9,000',
    location: '판교',
    logoColor: '#FEE500',
  },
  {
    id: 3,
    company: '네이버',
    position: '프론트엔드 개발자',
    currentStatus: 'CODING_IN_PROGRESS',
    employmentType: 'EXPERIENCED',
    channel: '네이버 채용',
    deadline: addDays(1),
    submittedAt: addDays(-6),
    updatedAt: addDays(-1),
    createdAt: addDays(-7),
    jobPostingUrl: 'https://recruit.navercorp.com/12345',
    memo: '코딩테스트 내일 오후 2시. 알고리즘 복습 중.',
    tags: ['대기업', '포털'],
    salary: '6,000~8,500',
    location: '분당',
    logoColor: '#03C75A',
  },
  {
    id: 4,
    company: '라인',
    position: '프론트엔드 엔지니어',
    currentStatus: 'SUBMITTED',
    employmentType: 'EXPERIENCED',
    channel: 'LinkedIn',
    deadline: addDays(10),
    submittedAt: addDays(-3),
    updatedAt: addDays(-3),
    createdAt: addDays(-4),
    jobPostingUrl: 'https://linecorp.com/career',
    memo: '글로벌 포지션. 일본 본사 연동.',
    tags: ['글로벌'],
    location: '판교',
    logoColor: '#00C300',
  },
  {
    id: 5,
    company: '당근',
    position: 'Frontend Engineer',
    currentStatus: 'ASSIGNMENT_IN_PROGRESS',
    employmentType: 'EXPERIENCED',
    channel: '원티드',
    deadline: addDays(7),
    submittedAt: addDays(-5),
    updatedAt: addDays(0),
    createdAt: addDays(-7),
    jobPostingUrl: 'https://team.daangn.com/jobs',
    memo: '과제 전형 진행 중. 4/22까지 제출. E2E 테스트 포함.',
    tags: ['스타트업', '커뮤니티'],
    salary: '6,500~8,000',
    location: '서울 서초',
    logoColor: '#FF7E36',
  },
  {
    id: 6,
    company: '쿠팡',
    position: 'Web Software Engineer',
    currentStatus: 'FINAL_ACCEPTED',
    employmentType: 'EXPERIENCED',
    channel: 'LinkedIn',
    deadline: addDays(-2),
    submittedAt: addDays(-30),
    updatedAt: addDays(-2),
    createdAt: addDays(-32),
    jobPostingUrl: 'https://coupang.jobs/123',
    memo: '최종 합격! 처우 협의 중.',
    tags: ['대기업', '이커머스'],
    salary: '9,000~',
    location: '서울 송파',
    logoColor: '#F7324C',
  },
  {
    id: 7,
    company: '뤼튼테크놀로지스',
    position: '프론트엔드 개발자',
    currentStatus: 'INTERVIEW_PASSED',
    employmentType: 'EXPERIENCED',
    channel: '원티드',
    deadline: addDays(-3),
    submittedAt: addDays(-20),
    updatedAt: addDays(-2),
    createdAt: addDays(-22),
    jobPostingUrl: 'https://wrtn.ai/career',
    memo: '2차 면접 통과, 최종 결과 대기',
    tags: ['AI', '스타트업'],
    salary: '6,000~8,000',
    location: '서울 강남',
    logoColor: '#4B5AFA',
  },
  {
    id: 8,
    company: '무신사',
    position: 'Frontend Engineer',
    currentStatus: 'DOCUMENT_FAILED',
    employmentType: 'EXPERIENCED',
    channel: '원티드',
    deadline: addDays(-10),
    submittedAt: addDays(-18),
    updatedAt: addDays(-10),
    createdAt: addDays(-19),
    jobPostingUrl: 'https://musinsa.career.greetinghr.com/',
    memo: '서류 탈락. 다음엔 포트폴리오 더 강조하자.',
    tags: ['패션', '이커머스'],
    location: '서울 성수',
    logoColor: '#0A0A0A',
  },
  {
    id: 9,
    company: '우아한형제들',
    position: '웹 프론트엔드 개발자',
    currentStatus: 'DRAFT',
    employmentType: 'EXPERIENCED',
    channel: '원티드',
    deadline: addDays(14),
    submittedAt: null,
    updatedAt: addDays(0),
    createdAt: addDays(-1),
    jobPostingUrl: 'https://woowahan.com/recruit',
    memo: '자소서 작성 중. 도메인 지식 어필 필요.',
    tags: ['대기업', '배달'],
    salary: '7,000~9,500',
    location: '서울 송파',
    logoColor: '#2AC1BC',
  },
  {
    id: 10,
    company: '오늘의집',
    position: 'Frontend Engineer',
    currentStatus: 'INTERVIEW_FAILED',
    employmentType: 'EXPERIENCED',
    channel: 'LinkedIn',
    deadline: addDays(-20),
    submittedAt: addDays(-40),
    updatedAt: addDays(-15),
    createdAt: addDays(-42),
    jobPostingUrl: 'https://bucketplace.com/career',
    memo: '최종 면접 탈락. 컬처핏 이유.',
    tags: ['스타트업', '인테리어'],
    location: '서울 서초',
    logoColor: '#35C5F0',
  },
  {
    id: 11,
    company: '야놀자',
    position: '시니어 프론트엔드 엔지니어',
    currentStatus: 'SUBMITTED',
    employmentType: 'EXPERIENCED',
    channel: '원티드',
    deadline: addDays(6),
    submittedAt: addDays(-2),
    updatedAt: addDays(-2),
    createdAt: addDays(-3),
    jobPostingUrl: 'https://yanolja.com/careers',
    memo: '여행 도메인. 글로벌 서비스.',
    tags: ['여행', '플랫폼'],
    salary: '7,000~9,000',
    location: '서울 강남',
    logoColor: '#ED1C24',
  },
  {
    id: 12,
    company: '센드버드',
    position: 'Web SDK Engineer',
    currentStatus: 'CODING_PASSED',
    employmentType: 'EXPERIENCED',
    channel: '리퍼럴',
    deadline: addDays(2),
    submittedAt: addDays(-8),
    updatedAt: addDays(-1),
    createdAt: addDays(-9),
    jobPostingUrl: 'https://sendbird.com/careers',
    memo: '실리콘밸리 본사. 원격 근무 가능.',
    tags: ['글로벌', 'B2B'],
    salary: '$80k~$120k',
    location: '서울 / 원격',
    logoColor: '#742DDD',
  },
];

/* ------------------------------------------------------------------ */
/* 📊  Dashboard aggregates                                            */
/* ------------------------------------------------------------------ */

export const mockDashboard = {
  period: { from: addDays(-90), to: addDays(0) },
  summaryStrip: {
    total: 12,
    draft: 1,
    submitted: 2,
    inProgress: 5,
    accepted: 1,
    rejected: 3,
  },
  passRates: {
    document: { passed: 8, total: 11, rate: 73 },
    coding: { passed: 3, total: 4, rate: 75 },
    assignment: { passed: 1, total: 2, rate: 50 },
    interview: { passed: 2, total: 4, rate: 50 },
    final: { passed: 1, total: 3, rate: 33 },
  },
  pipeline: [
    { label: '지원', count: 12, color: '#6366F1' },
    { label: '서류 통과', count: 8, color: '#8B5CF6' },
    { label: '코딩 통과', count: 3, color: '#A855F7' },
    { label: '과제 통과', count: 1, color: '#D946EF' },
    { label: '면접 통과', count: 2, color: '#EC4899' },
    { label: '최종 합격', count: 1, color: '#10B981' },
  ],
  activityGrass: generateGrass(),
  recentActivity: [
    { id: 1, type: 'status', company: '토스', text: '면접 1차 통과', at: addDays(-1) },
    { id: 2, type: 'create', company: '우아한형제들', text: '지원 추가', at: addDays(0) },
    { id: 3, type: 'status', company: '쿠팡', text: '최종 합격', at: addDays(-2) },
    { id: 4, type: 'submit', company: '야놀자', text: '지원서 제출', at: addDays(-2) },
    { id: 5, type: 'resume', company: null, text: '마스터 이력서 수정', at: addDays(-3) },
    { id: 6, type: 'status', company: '카카오', text: '서류 통과', at: addDays(-2) },
  ] as RecentActivity[],
};

export type RecentActivity = {
  id: number;
  type: 'status' | 'create' | 'submit' | 'resume';
  company: string | null;
  text: string;
  at: string;
};

function generateGrass(): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = [];
  const start = new Date(today);
  start.setDate(start.getDate() - 90);
  const seed = [0, 0, 1, 0, 2, 0, 0, 1, 3, 0, 0, 2, 4, 1, 0, 0, 2, 1, 3, 0, 1, 0, 0];
  for (let i = 0; i <= 90; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    out.push({ date: iso(d), count: seed[i % seed.length] });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 📄  Resumes                                                          */
/* ------------------------------------------------------------------ */

export type ResumeMeta = {
  id: number;
  title: string;
  description: string;
  isMaster: boolean;
  linkedCompany: string | null;
  completionRate: number;
  updatedAt: string;
  template: 'clean' | 'modern' | 'elegant';
  accentColor: string;
};

export const mockResumes: ResumeMeta[] = [
  {
    id: 1,
    title: '마스터 이력서',
    description: '모든 경력/프로젝트를 담은 원본',
    isMaster: true,
    linkedCompany: null,
    completionRate: 92,
    updatedAt: addDays(-3),
    template: 'clean',
    accentColor: '#4F46E5',
  },
  {
    id: 2,
    title: '토스 — 프론트엔드',
    description: '토스 1차 면접용, 모바일 금융 강조',
    isMaster: false,
    linkedCompany: '토스',
    completionRate: 85,
    updatedAt: addDays(-1),
    template: 'modern',
    accentColor: '#3182F6',
  },
  {
    id: 3,
    title: '카카오 — 시니어 FE',
    description: '카카오 채용 공고 맞춤, 리더십 섹션 강화',
    isMaster: false,
    linkedCompany: '카카오',
    completionRate: 78,
    updatedAt: addDays(-2),
    template: 'elegant',
    accentColor: '#3B2E2A',
  },
  {
    id: 4,
    title: '당근 — 커뮤니티',
    description: '로컬·커뮤니티 경험 위주',
    isMaster: false,
    linkedCompany: '당근',
    completionRate: 64,
    updatedAt: addDays(-5),
    template: 'modern',
    accentColor: '#FF7E36',
  },
];

/* ------------------------------------------------------------------ */
/* 📄  Full resume content (for the builder)                           */
/* ------------------------------------------------------------------ */

export type ResumeDocument = {
  id: number;
  title: string;
  template: 'clean' | 'modern' | 'elegant';
  accentColor: string;
  profile: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    links: { label: string; url: string }[];
  };
  about: string;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: SkillGroup[];
  certifications: Certification[];
  languages: Language[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  location: string;
  bullets: string[];
};

export type Project = {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  bullets: string[];
  tech: string[];
  link?: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
};

export type SkillGroup = {
  id: string;
  category: string;
  items: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
};

export type Language = {
  id: string;
  name: string;
  level: string;
};

export const mockResumeDocument: ResumeDocument = {
  id: 1,
  title: '마스터 이력서',
  template: 'clean',
  accentColor: '#4F46E5',
  profile: {
    name: '김민수',
    headline: '프론트엔드 엔지니어 · React/TypeScript',
    email: 'minsoo.kim@example.com',
    phone: '010-1234-5678',
    location: '서울, 대한민국',
    links: [
      { label: 'GitHub', url: 'github.com/minsoo-kim' },
      { label: 'Blog', url: 'minsoo.dev' },
      { label: 'LinkedIn', url: 'linkedin.com/in/minsoo-kim' },
    ],
  },
  about:
    '사용자 경험과 엔지니어링 생산성을 동시에 끌어올리는 데 관심이 많은 프론트엔드 엔지니어입니다. 모놀리식 프로젝트를 모듈 단위로 쪼개 빌드 시간을 70% 단축한 경험이 있고, 디자인 시스템을 직접 구축해 조직 전반에 확산시켰습니다.',
  experiences: [
    {
      id: 'exp1',
      company: '핀테크코퍼레이션',
      role: '시니어 프론트엔드 엔지니어',
      startDate: '2022.03',
      endDate: null,
      location: '서울',
      bullets: [
        '결제 위젯 SDK 리뉴얼을 주도해 번들 크기 42% 감소, TTI 1.8s → 0.6s',
        '디자인 시스템 "Plate"를 구축 · 운영, 15개 이상 프로덕트에 적용',
        '주니어 엔지니어 3명 멘토링 및 코드 리뷰 문화 정착',
      ],
    },
    {
      id: 'exp2',
      company: '쇼핑몰스타트업',
      role: '프론트엔드 엔지니어',
      startDate: '2020.01',
      endDate: '2022.02',
      location: '서울',
      bullets: [
        'Next.js 기반 커머스 웹앱 신규 구축, Lighthouse 전 영역 90점 이상',
        'GraphQL 도입 및 BFF 설계로 백엔드 팀과의 협업 비용 절감',
        '이메일 마케팅 A/B 테스트 인프라 구축, CTR 18% 개선',
      ],
    },
  ],
  projects: [
    {
      id: 'prj1',
      name: 'Resume Manage',
      role: '개인 프로젝트',
      period: '2025.09 - 현재',
      description:
        '이력서 · 지원 관리 · AI 자소서 교정 통합 PWA. React 19, Vite, Spring Boot.',
      bullets: [
        'Offline-first PWA 설계, Service Worker 로 iOS 푸시까지 구현',
        '3개 LLM (Claude/GPT/Gemini) 파이프라인을 백엔드에서 직렬 호출',
      ],
      tech: ['React 19', 'TypeScript', 'Spring Boot', 'PostgreSQL'],
      link: 'github.com/minsoo-kim/resume-manage',
    },
    {
      id: 'prj2',
      name: 'Plate Design System',
      role: '리드',
      period: '2023.04 - 2024.12',
      description: '사내 15개 프로덕트가 사용하는 React 디자인 시스템',
      bullets: [
        'Headless 컴포넌트 구조로 런타임 스타일 오버라이드 지원',
        'Visual Regression Test 환경 구축으로 릴리스 신뢰성 확보',
      ],
      tech: ['React', 'Stitches', 'Storybook', 'Chromatic'],
    },
  ],
  education: [
    {
      id: 'edu1',
      school: '서울대학교',
      degree: '컴퓨터공학부 학사',
      startDate: '2015.03',
      endDate: '2020.02',
      description: 'GPA 3.8/4.3',
    },
  ],
  skills: [
    {
      id: 'sk1',
      category: '언어',
      items: ['TypeScript', 'JavaScript', 'Python', 'Java'],
    },
    {
      id: 'sk2',
      category: '프론트엔드',
      items: ['React', 'Next.js', 'Redux', 'Zustand', 'TanStack Query'],
    },
    {
      id: 'sk3',
      category: '툴링',
      items: ['Vite', 'Webpack', 'Turborepo', 'Playwright'],
    },
  ],
  certifications: [
    {
      id: 'cert1',
      name: '정보처리기사',
      issuer: '한국산업인력공단',
      issuedAt: '2020.06',
    },
  ],
  languages: [
    { id: 'lan1', name: '영어', level: 'Business (TOEIC 920)' },
    { id: 'lan2', name: '한국어', level: 'Native' },
  ],
};
