export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-indexed current page
  size: number;
  first: boolean;
  last: boolean;
};

export type JobApplyStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENT_PASSED'
  | 'DOCUMENT_FAILED'
  | 'CODING_IN_PROGRESS'
  | 'CODING_PASSED'
  | 'CODING_FAILED'
  | 'ASSIGNMENT_IN_PROGRESS'
  | 'ASSIGNMENT_PASSED'
  | 'ASSIGNMENT_FAILED'
  | 'INTERVIEW_IN_PROGRESS'
  | 'INTERVIEW_PASSED'
  | 'INTERVIEW_FAILED'
  | 'FINAL_ACCEPTED'
  | 'FINAL_REJECTED';

export type EmploymentType = 'NEW' | 'EXPERIENCED' | 'INTERN' | 'CONTRACT';

export type JobApplyListItem = {
  id: number;
  company: string;
  position: string | null;
  currentStatus: JobApplyStatus;
  employmentType: EmploymentType | null;
  channel: string | null;
  deadline: string | null;
  submittedAt: string | null;
  updatedAt: string;
};

export type JobApplyDetail = JobApplyListItem & {
  jobPostingUrl: string | null;
  wentThroughDocument: boolean;
  wentThroughCoding: boolean;
  wentThroughAssignment: boolean;
  wentThroughInterview: boolean;
  memo: string | null;
  createdAt: string;
};

export type JobApplyCreateRequest = {
  company: string;
  position?: string;
  jobPostingUrl?: string;
  employmentType?: EmploymentType;
  channel?: string;
  deadline?: string;
  memo?: string;
};
