import type { JobApplyStatus } from '../types/jobApply';

const LABELS: Record<JobApplyStatus, string> = {
  DRAFT: '작성중',
  SUBMITTED: '지원완료',
  DOCUMENT_PASSED: '서류합격',
  DOCUMENT_FAILED: '서류탈락',
  CODING_IN_PROGRESS: '코테 진행',
  CODING_PASSED: '코테 합격',
  CODING_FAILED: '코테 탈락',
  ASSIGNMENT_IN_PROGRESS: '과제 진행',
  ASSIGNMENT_PASSED: '과제 합격',
  ASSIGNMENT_FAILED: '과제 탈락',
  INTERVIEW_IN_PROGRESS: '면접 진행',
  INTERVIEW_PASSED: '면접 통과',
  INTERVIEW_FAILED: '면접 탈락',
  FINAL_ACCEPTED: '최종합격',
  FINAL_REJECTED: '최종탈락',
};

const COLORS: Record<JobApplyStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DOCUMENT_PASSED: 'bg-sky-100 text-sky-700',
  DOCUMENT_FAILED: 'bg-rose-100 text-rose-700',
  CODING_IN_PROGRESS: 'bg-amber-100 text-amber-700',
  CODING_PASSED: 'bg-indigo-100 text-indigo-700',
  CODING_FAILED: 'bg-rose-100 text-rose-700',
  ASSIGNMENT_IN_PROGRESS: 'bg-amber-100 text-amber-700',
  ASSIGNMENT_PASSED: 'bg-indigo-100 text-indigo-700',
  ASSIGNMENT_FAILED: 'bg-rose-100 text-rose-700',
  INTERVIEW_IN_PROGRESS: 'bg-violet-100 text-violet-700',
  INTERVIEW_PASSED: 'bg-fuchsia-100 text-fuchsia-700',
  INTERVIEW_FAILED: 'bg-rose-100 text-rose-700',
  FINAL_ACCEPTED: 'bg-emerald-100 text-emerald-700',
  FINAL_REJECTED: 'bg-rose-100 text-rose-700',
};

export const ALL_STATUSES: JobApplyStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'DOCUMENT_PASSED',
  'DOCUMENT_FAILED',
  'CODING_IN_PROGRESS',
  'CODING_PASSED',
  'CODING_FAILED',
  'ASSIGNMENT_IN_PROGRESS',
  'ASSIGNMENT_PASSED',
  'ASSIGNMENT_FAILED',
  'INTERVIEW_IN_PROGRESS',
  'INTERVIEW_PASSED',
  'INTERVIEW_FAILED',
  'FINAL_ACCEPTED',
  'FINAL_REJECTED',
];

export const statusLabel = (s: JobApplyStatus): string => LABELS[s];
export const statusColor = (s: JobApplyStatus): string => COLORS[s];

export const TERMINAL: JobApplyStatus[] = [
  'DOCUMENT_FAILED',
  'CODING_FAILED',
  'ASSIGNMENT_FAILED',
  'INTERVIEW_FAILED',
  'FINAL_ACCEPTED',
  'FINAL_REJECTED',
];

export const isTerminal = (s: JobApplyStatus): boolean => TERMINAL.includes(s);

const EMPLOYMENT_LABELS: Record<string, string> = {
  NEW: '신입',
  EXPERIENCED: '경력',
  INTERN: '인턴',
  CONTRACT: '계약직',
};

export const employmentLabel = (t: string | null): string =>
  t ? (EMPLOYMENT_LABELS[t] ?? t) : '-';
