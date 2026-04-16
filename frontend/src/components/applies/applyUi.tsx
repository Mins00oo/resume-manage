import type { JobApplyStatus } from '../../types/jobApply';
import type { JobApplyListItem } from '../../types/jobApply';
import { statusLabel } from '../../lib/statusLabel';

export type ApplyItem = JobApplyListItem;

/* Group a status to a simplified stage */
export type Stage =
  | 'draft'
  | 'submitted'
  | 'document'
  | 'coding'
  | 'assignment'
  | 'interview'
  | 'offer'
  | 'rejected';

export const stageMeta: Record<
  Stage,
  { label: string; color: string; bg: string; text: string; border: string }
> = {
  draft: {
    label: '작성중',
    color: '#64748b',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  submitted: {
    label: '지원 완료',
    color: '#3b82f6',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  document: {
    label: '서류 통과',
    color: '#6366f1',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  coding: {
    label: '코딩테스트',
    color: '#8b5cf6',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  assignment: {
    label: '과제 전형',
    color: '#a855f7',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  interview: {
    label: '면접',
    color: '#ec4899',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  offer: {
    label: '최종 합격',
    color: '#10b981',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  rejected: {
    label: '탈락',
    color: '#ef4444',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export function toStage(status: JobApplyStatus): Stage {
  if (status === 'DRAFT') return 'draft';
  if (status === 'SUBMITTED') return 'submitted';
  if (status === 'DOCUMENT_PASSED') return 'document';
  if (status === 'CODING_IN_PROGRESS' || status === 'CODING_PASSED')
    return 'coding';
  if (status === 'ASSIGNMENT_IN_PROGRESS' || status === 'ASSIGNMENT_PASSED')
    return 'assignment';
  if (status === 'INTERVIEW_IN_PROGRESS' || status === 'INTERVIEW_PASSED')
    return 'interview';
  if (status === 'FINAL_ACCEPTED') return 'offer';
  return 'rejected';
}

export function stageOf(item: ApplyItem) {
  return stageMeta[toStage(item.currentStatus)];
}

export { statusLabel };

/** Generate a deterministic color from a company name */
function companyColor(name: string): string {
  const PALETTE = [
    '#3182F6', '#FEE500', '#03C75A', '#00C300', '#FF7E36',
    '#F7324C', '#4B5AFA', '#0A0A0A', '#2AC1BC', '#35C5F0',
    '#ED1C24', '#742DDD', '#FF6B00', '#1F8CE6', '#5F0080',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function CompanyAvatar({
  item,
  size = 36,
}: {
  item: ApplyItem;
  size?: number;
}) {
  const bgColor = companyColor(item.company);
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold shrink-0 ring-1 ring-black/5 shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.42,
      }}
    >
      {item.company[0]}
    </div>
  );
}

export function StageBadge({ item }: { item: ApplyItem }) {
  const s = stageOf(item);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {statusLabel(item.currentStatus)}
    </span>
  );
}

export function dDayLabel(deadline: string | null) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diff > 0) return { label: `D-${diff}`, days: diff };
  if (diff === 0) return { label: 'D-DAY', days: 0 };
  return { label: `D+${-diff}`, days: diff };
}
