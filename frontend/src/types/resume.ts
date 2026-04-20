/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type MilitaryStatus = 'EXEMPTED' | 'COMPLETED' | 'UNFULFILLED' | 'NOT_APPLICABLE';

export type Degree = 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTOR';

export type GraduationStatus = 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN' | 'LEAVE_OF_ABSENCE';

export type CoverLetterType = 'FREE' | 'STRUCTURED';

/* ------------------------------------------------------------------ */
/* Response types                                                      */
/* ------------------------------------------------------------------ */

export type ResumeSummary = {
  id: number;
  title: string;
  isMaster: boolean;
  completionRate: number;
  updatedAt: string;
};

export type ResumeBasicInfo = {
  nameKo: string | null;
  nameEn: string | null;
  gender: Gender | null;
  birthDate: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  addressDetail: string | null;
  shortIntro: string | null;
  militaryStatus: MilitaryStatus | null;
  disabilityStatus: boolean;
  veteranStatus: boolean;
  profileImageFileId: number | null;
  careerDescriptionFileId: number | null;
  portfolioFileId: number | null;
};

export type ResumeEducation = {
  id: number;
  schoolName: string | null;
  major: string | null;
  degree: Degree | null;
  startDate: string | null;
  endDate: string | null;
  graduationStatus: GraduationStatus | null;
  gpa: number | null;
  gpaMax: number | null;
  orderIndex: number;
};

export type ResumeCareer = {
  id: number;
  companyName: string | null;
  position: string | null;
  department: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  employmentType: CareerEmploymentType | null;
  responsibilities: string | null;
  orderIndex: number;
};

export type ResumeLanguage = {
  id: number;
  language: string | null;
  testName: string | null;
  score: string | null;
  acquiredAt: string | null;
  orderIndex: number;
};

export type ResumeCertificate = {
  id: number;
  name: string | null;
  issuer: string | null;
  acquiredAt: string | null;
  certificateNumber: string | null;
  score: string | null;
  orderIndex: number;
};

export type ResumeAward = {
  id: number;
  title: string | null;
  issuer: string | null;
  awardedAt: string | null;
  description: string | null;
  orderIndex: number;
};

export type ResumeTraining = {
  id: number;
  name: string | null;
  institution: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  orderIndex: number;
};

export type ResumeCoverLetter = {
  type: CoverLetterType;
  freeText: string | null;
};

export type ResumeCoverLetterSection = {
  id: number;
  question: string | null;
  answer: string | null;
  charLimit: number | null;
  orderIndex: number;
};

export type ResumeDetail = {
  id: number;
  title: string;
  isMaster: boolean;
  completionRate: number;
  hiddenSections: string[];
  createdAt: string;
  updatedAt: string;
  basicInfo: ResumeBasicInfo | null;
  educations: ResumeEducation[];
  careers: ResumeCareer[];
  languages: ResumeLanguage[];
  certificates: ResumeCertificate[];
  awards: ResumeAward[];
  trainings: ResumeTraining[];
  coverLetter: ResumeCoverLetter | null;
  coverLetterSections: ResumeCoverLetterSection[];
};

/* ------------------------------------------------------------------ */
/* Request types                                                       */
/* ------------------------------------------------------------------ */

export type ResumeBasicInfoRequest = {
  nameKo?: string;
  nameEn?: string;
  gender?: Gender | null;
  birthDate?: string | null;
  email?: string;
  phone?: string;
  address?: string;
  addressDetail?: string;
  shortIntro?: string;
  militaryStatus?: MilitaryStatus | null;
  disabilityStatus?: boolean;
  veteranStatus?: boolean;
  profileImageFileId?: number | null;
  careerDescriptionFileId?: number | null;
  portfolioFileId?: number | null;
};

export type ResumeEducationRequest = {
  schoolName?: string;
  major?: string;
  degree?: Degree | null;
  startDate?: string | null;
  endDate?: string | null;
  graduationStatus?: GraduationStatus | null;
  gpa?: number | null;
  gpaMax?: number | null;
  orderIndex: number;
};

export type CareerEmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN' | 'FREELANCE' | 'DISPATCH' | 'PART_TIME';

export type ResumeCareerRequest = {
  companyName?: string;
  position?: string;
  department?: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  employmentType?: CareerEmploymentType | null;
  responsibilities?: string;
  orderIndex: number;
};

export type ResumeLanguageRequest = {
  language?: string;
  testName?: string;
  score?: string;
  acquiredAt?: string | null;
  orderIndex: number;
};

export type ResumeCertificateRequest = {
  name?: string;
  issuer?: string;
  acquiredAt?: string | null;
  certificateNumber?: string;
  score?: string;
  orderIndex: number;
};

export type ResumeAwardRequest = {
  title?: string;
  issuer?: string;
  awardedAt?: string | null;
  description?: string;
  orderIndex: number;
};

export type ResumeTrainingRequest = {
  name?: string;
  institution?: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string;
  orderIndex: number;
};

export type ResumeCoverLetterRequest = {
  type: CoverLetterType;
  freeText?: string;
};

export type ResumeCoverLetterSectionRequest = {
  question?: string;
  answer?: string;
  charLimit?: number | null;
  orderIndex: number;
};
