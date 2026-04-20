import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { resumeApi } from '../lib/api/resume';
import { fileApi } from '../lib/api/file';
import type { ResumeDetail, CareerEmploymentType } from '../types/resume';
import type { ResumeDocument } from '../mocks/data';
import { IconPlus, IconTrash } from '../components/icons/Icons';
import { formatPhone } from '../lib/formatPhone';
import PhotoUpload from '../components/resume/PhotoUpload';
import AddressSearch from '../components/resume/AddressSearch';
import ResumeBottomBar from '../components/resume/ResumeBottomBar';
import ResumeSidePanel from '../components/resume/ResumeSidePanel';
import PdfUploadSection from '../components/resume/PdfUploadSection';
import MonthYearPicker from '../components/common/MonthYearPicker';
import { useToast } from '../components/common/Toast';
import { syncCareers, syncEducations, syncCertificates, syncLanguages } from './resumeEditorSync';
import AiSummaryPanel from '../components/resume/AiSummaryPanel';

/* ─── constants ─── */

const EMPLOYMENT_TYPES: { value: CareerEmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: '정규직' },
  { value: 'CONTRACT', label: '계약직' },
  { value: 'INTERN', label: '인턴' },
  { value: 'FREELANCE', label: '프리랜서' },
  { value: 'DISPATCH', label: '파견직' },
  { value: 'PART_TIME', label: '아르바이트' },
];

const DEGREE_TYPES: { value: string; label: string }[] = [
  { value: 'HIGH_SCHOOL', label: '고등학교' },
  { value: 'ASSOCIATE', label: '대학교(전문학사)' },
  { value: 'BACHELOR', label: '대학교(학사)' },
  { value: 'MASTER', label: '대학원(석사)' },
  { value: 'DOCTOR', label: '대학원(박사)' },
];

const GRADUATION_STATUSES: { value: string; label: string }[] = [
  { value: 'ENROLLED', label: '재학' },
  { value: 'GRADUATED', label: '졸업' },
  { value: 'WITHDRAWN', label: '중퇴' },
  { value: 'LEAVE_OF_ABSENCE', label: '휴학' },
];

// 어학 "언어" Select 옵션 — 자주 쓰는 언어 + OTHER (기타 자유 입력)
const LANGUAGE_OPTIONS: string[] = [
  '영어', '중국어(간체)', '중국어(번체)', '일본어', '스페인어', '프랑스어', '독일어', '러시아어',
];
const LANGUAGE_OTHER = '__OTHER__';

/* ─── 담당업무 원문 작성 가이드 ───────────────────────────────────
   AI 요약이 좋은 결과를 내려면 원문이 충분히 구체적이어야 한다.
   개발자 사용자를 기준으로 원재료 형태의 예시 한 건을 제공한다. */

const CAREER_WRITING_MUST_HAVE: { icon: string; label: string }[] = [
  { icon: '📅', label: '프로젝트명 · 기간' },
  { icon: '👤', label: '본인 역할 (리드 / 단독 / 주도 / 참여)' },
  { icon: '🧰', label: '사용한 기술 스택' },
  { icon: '📏', label: '규모 (사용자 수 / 화면 수 / 데이터량)' },
  { icon: '📈', label: 'Before / After 비교 (숫자)' },
];

const CAREER_WRITING_BAD_EXAMPLE =
  'CRM 프론트엔드를 개발했고, 여러 프로젝트에 참여하며 다양한 경험을 쌓았습니다.';

const CAREER_WRITING_GOOD_EXAMPLE = `[CRM 대시보드 프론트엔드 고도화]
기간: 2022.03 ~ 2024.08 (약 2년 6개월)
역할: 프론트 3명 중 리드 (아키텍처 설계 + 핵심 모듈 직접 구현)
기술: React 18, TypeScript, Redux-Toolkit, Vite, Storybook

수행 내용:
- 월 활성 사용자 5만 규모 B2B CRM 신규 기능 개발 및 운영
- Webpack → Vite 마이그레이션 주도, 빌드 시간 40초 → 8초 단축
- Storybook 기반 컴포넌트 문서화로 신규 UI 개발 공수 평균 30% 감소
- 주니어 2명 코드 리뷰 및 온보딩 가이드 작성`;

/* ─── helpers ─── */

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (resp?.data?.error?.message) return resp.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했어요.';
}

function detailToDocument(detail: ResumeDetail): ResumeDocument {
  const bi = detail.basicInfo;
  return {
    id: detail.id,
    title: detail.title,
    template: 'clean',
    accentColor: '#4F46E5',
    profile: {
      name: bi?.nameKo ?? '',
      headline: bi?.shortIntro ?? '',
      email: bi?.email ?? '',
      phone: bi?.phone ?? '',
      location: bi?.address ?? '',
      links: [],
    },
    about: bi?.shortIntro ?? '',
    experiences: detail.careers.map((c) => ({
      id: String(c.id),
      company: c.companyName ?? '',
      role: c.position ?? '',
      startDate: c.startDate ?? '',
      endDate: c.isCurrent ? null : (c.endDate ?? ''),
      location: c.department ?? '',
      bullets: c.responsibilities
        ? c.responsibilities.split('\n').filter(Boolean).map(ensureBulletPrefix)
        : [],
    })),
    education: detail.educations.map((e) => ({
      id: String(e.id),
      degreeType: e.degree ?? '',
      school: e.schoolName ?? '',
      degree: e.major ?? '',
      graduationStatus: e.graduationStatus ?? '',
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      description: e.gpa != null && e.gpaMax != null ? `GPA ${e.gpa}/${e.gpaMax}` : undefined,
    })),
    certifications: detail.certificates.map((c) => ({
      id: String(c.id),
      name: c.name ?? '',
      issuer: c.issuer ?? '',
      issuedAt: c.acquiredAt ?? '',
      certificateNumber: c.certificateNumber ?? '',
      score: c.score ?? '',
    })),
    languages: detail.languages.map((l) => ({
      id: String(l.id),
      name: l.language ?? '',
      testName: l.testName ?? '',
      score: l.score ?? '',
      acquiredAt: l.acquiredAt ?? '',
    })),
  };
}

function emptyDocument(): ResumeDocument {
  return {
    id: 0, title: '', template: 'clean', accentColor: '#4F46E5',
    profile: { name: '', headline: '', email: '', phone: '', location: '', links: [] },
    about: '', experiences: [], education: [], certifications: [], languages: [],
  };
}

/* ─── bullet prefix 헬퍼 ──────────────────────────────────────────
   담당업무 textarea 는 `• xxx` 포맷으로 보여주고, 사용자가 Enter 치면
   자동으로 `\n• ` 를 삽입해 이력서 작성 감각을 유지한다.
   - 로드 시 responsibilities(서버) → bullets 로 parse 할 때 "• " prefix 를 붙임
   - 저장 시 bullets → responsibilities 로 join 할 때 "• " prefix 를 제거
   - AI 요약 결과 적용 시 bullets 에 "• " prefix 를 붙여 넣음 */
export function stripBulletPrefix(line: string): string {
  return line.replace(/^[•*\-]\s*/, '').trim();
}

export function ensureBulletPrefix(line: string): string {
  const s = line.trim();
  if (!s) return s;
  if (/^[•*\-]\s/.test(s)) return '• ' + s.replace(/^[•*\-]\s*/, '');
  return '• ' + s;
}

/**
 * 담당업무 textarea 용 onKeyDown.
 * - Enter: 다음 줄을 자동으로 "• " 로 시작
 * - 빈 불릿 줄("• " 만 있는 줄)에서 Enter: 그 줄 삭제 후 빈 줄 (= 불릿 모드 종료)
 * React 의 controlled textarea 에 dispatchEvent 로 값 전달.
 */
function handleBulletKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  setBullets: (next: string[]) => void,
) {
  if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
  const ta = e.currentTarget;
  const { selectionStart, selectionEnd, value } = ta;
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  const lineStart = before.lastIndexOf('\n') + 1;
  const currentLine = before.slice(lineStart);

  // 빈 불릿 줄 → 해당 줄 제거 (bullet 모드 종료)
  if (/^[•*\-]\s*$/.test(currentLine.trim()) && currentLine.trim().length > 0) {
    e.preventDefault();
    const next = value.slice(0, lineStart) + after;
    setBullets(next.split('\n'));
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = lineStart;
    });
    return;
  }

  // 일반 Enter: "\n• " 삽입
  e.preventDefault();
  const insert = '\n• ';
  const next = before + insert + after;
  setBullets(next.split('\n'));
  requestAnimationFrame(() => {
    const pos = selectionStart + insert.length;
    ta.selectionStart = ta.selectionEnd = pos;
  });
}

/* ─── page ─── */

export default function ResumeEditorPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();
  const isNew = !idParam || idParam === 'new';
  const resumeId = isNew ? null : Number(idParam);

  const [doc, setDoc] = useState<ResumeDocument>(emptyDocument());
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileId, setPhotoFileId] = useState<number | null>(null);
  const [addressMain, setAddressMain] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [careerDescFileId, setCareerDescFileId] = useState<number | null>(null);
  const [careerDescFileName, setCareerDescFileName] = useState<string | null>(null);
  const [portfolioFileId, setPortfolioFileId] = useState<number | null>(null);
  const [portfolioFileName, setPortfolioFileName] = useState<string | null>(null);

  // Experience extra fields (employmentType, stored separately since doc type doesn't include it)
  const [expEmploymentTypes, setExpEmploymentTypes] = useState<Record<string, CareerEmploymentType | ''>>({});

  // AI 교차검증 요약 패널 — 경력 담당업무 "AI 요약" 버튼으로 오픈
  const [aiPanel, setAiPanel] = useState<{ expIndex: number; rawText: string; company: string; position: string } | null>(null);

  const initialized = useRef(false);
  const initialDocRef = useRef<string>('');
  // 마지막으로 서버에서 받아온 detail — diff 기반 저장(섹션 item id 추적, 삭제 감지)에 사용
  const initialDetailRef = useRef<ResumeDetail | null>(null);

  // Section refs for scroll-to
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Dirty detection */
  const isDirty = useMemo(() => {
    if (!initialized.current) return false;
    return JSON.stringify(doc) !== initialDocRef.current;
  }, [doc]);

  /* Unsaved changes warning */
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  /* Fetch */
  const { data: detail, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['resume', resumeId], queryFn: () => resumeApi.get(resumeId!), enabled: resumeId != null,
  });

  useEffect(() => {
    if (detail && !initialized.current) {
      initialized.current = true;
      initialDetailRef.current = detail;
      const newDoc = detailToDocument(detail);
      setDoc(newDoc);
      initialDocRef.current = JSON.stringify(newDoc);
      if (detail.basicInfo?.profileImageFileId) {
        setPhotoFileId(detail.basicInfo.profileImageFileId);
        fileApi.fetchBlobUrl(detail.basicInfo.profileImageFileId)
          .then((url) => setPhotoPreview(url))
          .catch(() => { /* ignore - photo won't show */ });
      }
      if (detail.basicInfo?.address) setAddressMain(detail.basicInfo.address);
      if (detail.basicInfo?.addressDetail) setAddressDetail(detail.basicInfo.addressDetail);
      if (detail.basicInfo?.careerDescriptionFileId) setCareerDescFileId(detail.basicInfo.careerDescriptionFileId);
      if (detail.basicInfo?.portfolioFileId) setPortfolioFileId(detail.basicInfo.portfolioFileId);
      if (detail.hiddenSections) setHiddenSections(detail.hiddenSections);

      // Load employmentTypes
      const types: Record<string, CareerEmploymentType | ''> = {};
      detail.careers.forEach((c) => {
        types[String(c.id)] = (c.employmentType as CareerEmploymentType) ?? '';
      });
      setExpEmploymentTypes(types);
    }
  }, [detail]);

  // For new resumes, mark as initialized
  useEffect(() => {
    if (isNew && !initialized.current) {
      initialized.current = true;
      initialDocRef.current = JSON.stringify(doc);
    }
  }, [isNew, doc]);

  /* Save (manual) */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      let id = resumeId;
      const isNewResume = id == null;

      // 0. 이력서 루트 (create or updateTitle)
      if (isNewResume) {
        id = await resumeApi.create(doc.title || '새 이력서');
      } else {
        await resumeApi.updateTitle(id!, doc.title);
      }

      const resumeIdNum = id!;
      const previous = initialDetailRef.current;

      // 1. 기본 정보 (upsert)
      await resumeApi.updateBasicInfo(resumeIdNum, {
        nameKo: doc.profile.name,
        email: doc.profile.email,
        phone: doc.profile.phone,
        address: addressMain,
        addressDetail: addressDetail,
        shortIntro: doc.about || doc.profile.headline,
        profileImageFileId: photoFileId,
        careerDescriptionFileId: careerDescFileId,
        portfolioFileId: portfolioFileId,
      });

      // 2. 경력 (diff)
      const prevCareers = previous?.careers ?? [];
      await syncCareers(resumeIdNum, doc.experiences, prevCareers, expEmploymentTypes);

      // 3. 학력 (diff)
      await syncEducations(resumeIdNum, doc.education, previous?.educations ?? []);

      // 4. 자격증 (diff)
      await syncCertificates(resumeIdNum, doc.certifications, previous?.certificates ?? []);

      // 5. 어학 (diff)
      await syncLanguages(resumeIdNum, doc.languages, previous?.languages ?? []);

      // 6. 자기소개 — FREE 타입 coverLetter 로 저장
      await resumeApi.updateCoverLetter(resumeIdNum, {
        type: 'FREE',
        freeText: doc.about,
      });

      // 저장 후 서버 상태 재로딩 → doc의 로컬 id들이 서버 id로 바뀜
      if (isNewResume) {
        queryClient.invalidateQueries({ queryKey: ['resumes'] });
        navigate(`/resumes/${resumeIdNum}`, { replace: true });
        // 새 이력서는 라우트 변경으로 재마운트되며 fetch 가 다시 일어남
      } else {
        await queryClient.invalidateQueries({ queryKey: ['resume', resumeIdNum] });
        await queryClient.invalidateQueries({ queryKey: ['resumes'] });
        const next = await refetch();
        if (next.data) {
          initialDetailRef.current = next.data;
          const refreshedDoc = detailToDocument(next.data);
          setDoc(refreshedDoc);
          initialDocRef.current = JSON.stringify(refreshedDoc);
          // employmentType 재매핑
          const types: Record<string, CareerEmploymentType | ''> = {};
          next.data.careers.forEach((c) => {
            types[String(c.id)] = (c.employmentType as CareerEmploymentType) ?? '';
          });
          setExpEmploymentTypes(types);
        }
      }

      toast('저장했어요.', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }, [resumeId, doc, addressMain, addressDetail, photoFileId, careerDescFileId, portfolioFileId, expEmploymentTypes, navigate, refetch, toast]);

  /* Photo */
  const handlePhotoUpload = async (file: File) => {
    try {
      const result = await fileApi.upload(file);
      setPhotoFileId(result.id);
      setPhotoPreview(URL.createObjectURL(file));
    } catch { toast('사진 업로드에 실패했어요.', 'error'); }
  };
  const handlePhotoRemove = () => { setPhotoFileId(null); setPhotoPreview(null); };

  /* Helpers to update nested doc */
  const updateProfile = (key: string, value: string) => setDoc((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  const addExperience = () => {
    const newId = Date.now().toString();
    setDoc((prev) => ({ ...prev, experiences: [...prev.experiences, { id: newId, company: '', role: '', startDate: '', endDate: '', location: '', bullets: [] }] }));
    setExpEmploymentTypes((prev) => ({ ...prev, [newId]: '' }));
  };
  const removeExperience = (i: number) => {
    const expId = doc.experiences[i]?.id;
    setDoc((prev) => ({ ...prev, experiences: prev.experiences.filter((_, idx) => idx !== i) }));
    if (expId) setExpEmploymentTypes((prev) => { const n = { ...prev }; delete n[expId]; return n; });
  };
  const updateExperience = (i: number, key: string, value: unknown) => setDoc((prev) => ({ ...prev, experiences: prev.experiences.map((e, idx) => idx === i ? { ...e, [key]: value } : e) }));

  const addEducation = () => setDoc((prev) => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), degreeType: '', school: '', degree: '', graduationStatus: '', startDate: '', endDate: '' }] }));
  const removeEducation = (i: number) => setDoc((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  const updateEducation = (i: number, key: string, value: unknown) => setDoc((prev) => ({ ...prev, education: prev.education.map((e, idx) => idx === i ? { ...e, [key]: value } : e) }));

  const addCert = () => setDoc((prev) => ({ ...prev, certifications: [...prev.certifications, { id: Date.now().toString(), name: '', issuer: '', issuedAt: '', certificateNumber: '', score: '' }] }));
  const removeCert = (i: number) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));
  const updateCert = (i: number, key: 'name' | 'issuer' | 'issuedAt' | 'certificateNumber' | 'score', value: string) =>
    setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, [key]: value } : c) }));

  const addLang = () => setDoc((prev) => ({ ...prev, languages: [...prev.languages, { id: Date.now().toString(), name: '', testName: '', score: '', acquiredAt: '' }] }));
  const removeLang = (i: number) => setDoc((prev) => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }));
  const updateLang = (i: number, key: 'name' | 'testName' | 'score' | 'acquiredAt', value: string) =>
    setDoc((prev) => ({ ...prev, languages: prev.languages.map((l, idx) => idx === i ? { ...l, [key]: value } : l) }));

  // 순서 이동 헬퍼 — 4개 섹션에서 재사용. 배열 swap.
  const swap = <T,>(arr: T[], i: number, j: number): T[] => {
    if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return arr;
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };
  const moveExperience = (i: number, dir: -1 | 1) => setDoc((prev) => ({ ...prev, experiences: swap(prev.experiences, i, i + dir) }));
  const moveEducation = (i: number, dir: -1 | 1) => setDoc((prev) => ({ ...prev, education: swap(prev.education, i, i + dir) }));
  const moveCert = (i: number, dir: -1 | 1) => setDoc((prev) => ({ ...prev, certifications: swap(prev.certifications, i, i + dir) }));
  const moveLang = (i: number, dir: -1 | 1) => setDoc((prev) => ({ ...prev, languages: swap(prev.languages, i, i + dir) }));

  /** 담당업무에 작성 가이드 예시를 채운다. 기존 내용이 있으면 덮어쓰기 확인. */
  const fillCareerExample = async (i: number) => {
    const currentBullets = doc.experiences[i]?.bullets ?? [];
    const currentLen = currentBullets
      .map((b) => b.replace(/^[•*\-]\s*/, '').trim())
      .filter(Boolean)
      .join('\n')
      .length;
    if (currentLen > 0) {
      const ok = await confirm({
        title: '기존 내용을 예시로 덮어쓸까요?',
        description: `이미 입력된 담당업무 내용(${currentLen}자)이 있어요. 예시는 참고용이니 본인 경험으로 꼭 바꾸신 뒤 저장해주세요.`,
        confirmLabel: '덮어쓰기',
        variant: 'danger',
      });
      if (!ok) return;
    }
    // 예시는 "원재료" 포맷 (• prefix 없음). 사용자가 본인 내용으로 고쳐쓰는 참고판.
    updateExperience(i, 'bullets', CAREER_WRITING_GOOD_EXAMPLE.split('\n'));
  };

  const handleToggleSection = (key: string) => {
    setHiddenSections((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const handleScrollTo = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePreview = () => {
    if (resumeId) {
      window.open(`/resumes/${resumeId}/preview`, 'resume-preview', 'width=900,height=1200,scrollbars=yes');
    } else {
      toast('먼저 이력서를 저장해주세요.', 'warning');
    }
  };

  /* Loading states */
  if (!isNew && isLoading) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (fetchError) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3">
      <div className="text-[14px] text-rose-600">{getErrorMessage(fetchError)}</div>
      <button type="button" onClick={() => navigate('/resumes')} className="btn-outline text-[12px]">목록으로 돌아가기</button>
    </div>
  );

  return (
    <>
      <div className="flex flex-1 min-h-0">
        {/* ─── Left: form ─── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex-1 overflow-y-auto min-h-0 lg:pb-8">
            <div className="max-w-2xl mx-auto px-5 md:px-8 py-6 pb-8">

            {/* Title */}
            <div className="mb-2">
              <p className="text-[12px] text-[var(--color-text-tertiary)] mb-1">프로필명은 나에게만 보여요!</p>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => setDoc((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="예: 2026 프론트엔드 지원용"
                className="w-full text-[20px] md:text-[24px] font-bold text-[var(--color-text-primary)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
            </div>

            {/* ══ 기본 정보 ══ */}
            <div ref={(el) => { sectionRefs.current.basicInfo = el; }}>
              <SectionDivider title="기본 정보" />
              <p className="text-[11px] text-rose-500 font-medium mb-5">* 필수</p>

              <div className="mb-6">
                <PhotoUpload imageUrl={photoPreview} onUpload={handlePhotoUpload} onRemove={handlePhotoRemove} />
              </div>

              <FormField label="이름" required>
                <input type="text" value={doc.profile.name} onChange={(e) => updateProfile('name', e.target.value)} placeholder="홍길동" className="input-base w-full" />
              </FormField>

              <FormField label="한줄 소개" hint="나를 표현하는 한 문장">
                <input type="text" value={doc.profile.headline} onChange={(e) => updateProfile('headline', e.target.value)} placeholder="솔루션 개발자 (Full-Stack)" className="input-base w-full" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="이메일" required>
                  <input type="email" value={doc.profile.email} onChange={(e) => updateProfile('email', e.target.value)} placeholder="email@example.com" className="input-base w-full" />
                </FormField>
                <FormField label="전화번호" required>
                  <input
                    type="tel"
                    value={formatPhone(doc.profile.phone)}
                    onChange={(e) => updateProfile('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="01012345678"
                    className="input-base w-full"
                  />
                </FormField>
              </div>

              <FormField label="주소" hint="좋은 정보 추천을 위해 도로명(번지)까지만 적어주세요!">
                <AddressSearch
                  value={addressMain}
                  onChange={(addr) => setAddressMain(addr)}
                  detailValue={addressDetail}
                  onDetailChange={(d) => setAddressDetail(d)}
                />
              </FormField>
            </div>

            {/* ══ 경력 ══ */}
            <div ref={(el) => { sectionRefs.current.experiences = el; }}>
              <SectionDivider title="경력" count={doc.experiences.length} onAdd={addExperience} />
              {doc.experiences.length === 0 && <EmptyHint text="아직 경력이 없어요" onAdd={addExperience} addLabel="경력 추가" />}
              {doc.experiences.map((exp, i) => {
                return (
                  <ItemCard key={exp.id} label={`경력 ${String(i + 1).padStart(2, '0')}`} onRemove={() => removeExperience(i)} onMoveUp={() => moveExperience(i, -1)} onMoveDown={() => moveExperience(i, 1)} canMoveUp={i > 0} canMoveDown={i < doc.experiences.length - 1}>
                    <FormField label="회사명">
                      <input type="text" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} placeholder="코리아엑스퍼트(주)" className="input-base w-full" />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="직책">
                        <input type="text" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} placeholder="매니저" className="input-base w-full" />
                      </FormField>
                      <FormField label="부서명">
                        <input type="text" value={exp.location} onChange={(e) => updateExperience(i, 'location', e.target.value)} placeholder="솔루션개발팀" className="input-base w-full" />
                      </FormField>
                    </div>
                    <FormField label="재직 기간">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MonthYearPicker
                          value={exp.startDate}
                          onChange={(v) => updateExperience(i, 'startDate', v)}
                          placeholder="시작 년.월."
                          className="input-base w-full"
                          maxDate={exp.endDate ?? undefined}
                        />
                        {exp.endDate !== null ? (
                          <MonthYearPicker
                            value={exp.endDate ?? ''}
                            onChange={(v) => updateExperience(i, 'endDate', v)}
                            placeholder="종료 년.월."
                            className="input-base w-full"
                            minDate={exp.startDate || undefined}
                          />
                        ) : (
                          <div />
                        )}
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-[12px] text-[var(--color-text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.endDate === null}
                          onChange={(e) => updateExperience(i, 'endDate', e.target.checked ? null : '')}
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        재직중
                      </label>
                    </FormField>
                    <FormField label="근무 유형">
                      <select
                        value={expEmploymentTypes[exp.id] ?? ''}
                        onChange={(e) => setExpEmploymentTypes((prev) => ({ ...prev, [exp.id]: e.target.value as CareerEmploymentType }))}
                        className="input-base w-full sm:w-48"
                      >
                        <option value="">선택해주세요</option>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </FormField>
                    <div className="mb-5">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <label className="block text-[13px] font-semibold text-[var(--color-text-primary)]">담당 업무</label>
                        <button
                          type="button"
                          onClick={() => setAiPanel({
                            expIndex: i,
                            rawText: exp.bullets.map(stripBulletPrefix).filter(Boolean).join('\n'),
                            company: exp.company,
                            position: exp.role,
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shrink-0"
                          aria-label="AI 교차검증 요약"
                        >
                          <span>✨</span>
                          <span>AI 요약</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">채용담당자에게 특별한 인상을 줄 수 있는 지원자님만의 소개글을 작성해보세요!</p>
                      <textarea
                        value={exp.bullets.join('\n')}
                        onChange={(e) => updateExperience(i, 'bullets', e.target.value.split('\n'))}
                        onKeyDown={(e) => handleBulletKeyDown(e, (next) => updateExperience(i, 'bullets', next))}
                        placeholder="• 자사 솔루션(DiCube) 개발 및 고도화&#10;• 고객사 5곳 CRM 대시보드 설계·납품"
                        className="input-base w-full resize-none"
                        style={{ minHeight: '120px' }}
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = 'auto';
                          el.style.height = Math.max(120, el.scrollHeight) + 'px';
                        }}
                      />
                    </div>
                  </ItemCard>
                );
              })}
            </div>

            {/* ══ 경력기술서 ══ */}
            <div ref={(el) => { sectionRefs.current.careerDescription = el; }}>
              <SectionDivider title="경력기술서" />
              <PdfUploadSection
                label="경력기술서"
                hint="경력기술서를 PDF 파일로 업로드해주세요."
                fileId={careerDescFileId}
                fileName={careerDescFileName}
                onFileChange={(id, name) => { setCareerDescFileId(id); setCareerDescFileName(name); }}
              />
            </div>

            {/* ══ 포트폴리오 ══ */}
            <div ref={(el) => { sectionRefs.current.portfolio = el; }}>
              <SectionDivider title="포트폴리오" />
              <PdfUploadSection
                label="포트폴리오"
                hint="포트폴리오를 PDF 파일로 업로드해주세요."
                fileId={portfolioFileId}
                fileName={portfolioFileName}
                onFileChange={(id, name) => { setPortfolioFileId(id); setPortfolioFileName(name); }}
              />
            </div>

            {/* ══ 학력 ══ */}
            <div ref={(el) => { sectionRefs.current.education = el; }}>
              <SectionDivider title="학력" count={doc.education.length} onAdd={addEducation} />
              {doc.education.length === 0 && <EmptyHint text="아직 학력이 없어요" onAdd={addEducation} addLabel="학력 추가" />}
              {doc.education.map((edu, i) => (
                  <ItemCard key={edu.id} label={`교육 ${String(i + 1).padStart(2, '0')}`} onRemove={() => removeEducation(i)} onMoveUp={() => moveEducation(i, -1)} onMoveDown={() => moveEducation(i, 1)} canMoveUp={i > 0} canMoveDown={i < doc.education.length - 1}>
                    <FormField label="종류">
                      <select
                        value={edu.degreeType ?? ''}
                        onChange={(e) => updateEducation(i, 'degreeType', e.target.value)}
                        className="input-base w-full"
                      >
                        <option value="">선택해주세요</option>
                        {DEGREE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="소속/기관">
                        <input type="text" value={edu.school} onChange={(e) => updateEducation(i, 'school', e.target.value)} placeholder="해성고등학교" className="input-base w-full" />
                      </FormField>
                      <FormField label="전공명/전공 계열">
                        <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} placeholder="문과" className="input-base w-full" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="재학 상태">
                        <select
                          value={edu.graduationStatus ?? ''}
                          onChange={(e) => updateEducation(i, 'graduationStatus', e.target.value)}
                          className="input-base w-full"
                        >
                          <option value="">선택해주세요</option>
                          {GRADUATION_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="재학 기간">
                        <div className="flex items-center gap-2">
                          <MonthYearPicker
                            value={edu.startDate}
                            onChange={(v) => updateEducation(i, 'startDate', v)}
                            placeholder="시작"
                            className="input-base flex-1"
                            maxDate={edu.endDate || undefined}
                          />
                          <span className="text-[var(--color-text-tertiary)] shrink-0">~</span>
                          <MonthYearPicker
                            value={edu.endDate}
                            onChange={(v) => updateEducation(i, 'endDate', v)}
                            placeholder="종료"
                            className="input-base flex-1"
                            minDate={edu.startDate || undefined}
                          />
                        </div>
                      </FormField>
                    </div>
                  </ItemCard>
              ))}
            </div>

            {/* ══ 자격증 ══ */}
            <div ref={(el) => { sectionRefs.current.certifications = el; }}>
              <SectionDivider title="자격증" count={doc.certifications.length} onAdd={addCert} />
              {doc.certifications.length === 0 && <EmptyHint text="아직 자격증이 없어요" onAdd={addCert} addLabel="자격증 추가" />}
              {doc.certifications.map((cert, i) => (
                <ItemCard key={cert.id} onRemove={() => removeCert(i)} onMoveUp={() => moveCert(i, -1)} onMoveDown={() => moveCert(i, 1)} canMoveUp={i > 0} canMoveDown={i < doc.certifications.length - 1}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="자격증명">
                      <input type="text" value={cert.name} onChange={(e) => updateCert(i, 'name', e.target.value)} placeholder="정보처리기사" className="input-base w-full" />
                    </FormField>
                    <FormField label="발급기관">
                      <input type="text" value={cert.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} placeholder="한국산업인력공단" className="input-base w-full" />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="고유번호" hint="자격증에 적힌 등록/인증 번호">
                      <input type="text" value={cert.certificateNumber ?? ''} onChange={(e) => updateCert(i, 'certificateNumber', e.target.value)} placeholder="예: 24201-00123" className="input-base w-full" />
                    </FormField>
                    <FormField label="점수/등급" hint="있으면 입력">
                      <input type="text" value={cert.score ?? ''} onChange={(e) => updateCert(i, 'score', e.target.value)} placeholder="1급 / 합격 / 920점" className="input-base w-full" />
                    </FormField>
                  </div>
                  <FormField label="취득일">
                    <MonthYearPicker
                      value={cert.issuedAt}
                      onChange={(v) => updateCert(i, 'issuedAt', v)}
                      className="input-base w-full sm:w-60"
                    />
                  </FormField>
                </ItemCard>
              ))}
            </div>

            {/* ══ 어학 ══ */}
            <div ref={(el) => { sectionRefs.current.languages = el; }}>
              <SectionDivider title="어학" count={doc.languages.length} onAdd={addLang} />
              {doc.languages.length === 0 && <EmptyHint text="아직 어학 정보가 없어요" onAdd={addLang} addLabel="어학 추가" />}
              {doc.languages.map((lang, i) => {
                const isPreset = LANGUAGE_OPTIONS.includes(lang.name);
                const selectValue = !lang.name ? '' : isPreset ? lang.name : LANGUAGE_OTHER;
                return (
                  <ItemCard key={lang.id} onRemove={() => removeLang(i)} onMoveUp={() => moveLang(i, -1)} onMoveDown={() => moveLang(i, 1)} canMoveUp={i > 0} canMoveDown={i < doc.languages.length - 1}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="언어">
                        <div className="space-y-2">
                          <select
                            value={selectValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '') updateLang(i, 'name', '');
                              else if (v === LANGUAGE_OTHER) updateLang(i, 'name', '');
                              else updateLang(i, 'name', v);
                            }}
                            className="input-base w-full"
                          >
                            <option value="">선택해주세요</option>
                            {LANGUAGE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                            <option value={LANGUAGE_OTHER}>기타</option>
                          </select>
                          {selectValue === LANGUAGE_OTHER && (
                            <input
                              type="text"
                              value={lang.name}
                              onChange={(e) => updateLang(i, 'name', e.target.value)}
                              placeholder="언어명을 입력해주세요"
                              className="input-base w-full"
                            />
                          )}
                        </div>
                      </FormField>
                      <FormField label="시험명" hint="없으면 비워두세요">
                        <input
                          type="text"
                          value={lang.testName ?? ''}
                          onChange={(e) => updateLang(i, 'testName', e.target.value)}
                          placeholder="TOEIC / OPIc / JLPT / HSK ..."
                          className="input-base w-full"
                        />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="점수/등급">
                        <input
                          type="text"
                          value={lang.score ?? ''}
                          onChange={(e) => updateLang(i, 'score', e.target.value)}
                          placeholder="920 / IH / 5급 / Business"
                          className="input-base w-full"
                        />
                      </FormField>
                      <FormField label="취득일">
                        <MonthYearPicker
                          value={lang.acquiredAt ?? ''}
                          onChange={(v) => updateLang(i, 'acquiredAt', v)}
                          className="input-base w-full"
                        />
                      </FormField>
                    </div>
                  </ItemCard>
                );
              })}
            </div>

            {/* ══ 자기소개 (마지막) ══ */}
            <div ref={(el) => { sectionRefs.current.about = el; }}>
              <div className="mt-8 mb-5">
                <div className="h-2 -mx-5 md:-mx-0 bg-[var(--color-bg-muted)] mb-5 rounded" />
                <div className="flex items-center gap-3">
                  <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">자기소개</h2>
                  <span className="text-[11px] font-semibold text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400 px-2 py-0.5 rounded-full">
                    작성 시, 서류 합격률 2배 증가
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
                직무 경험과 핵심 역량 등 구체적인 내용을 작성해 보세요.
              </p>
              <div
                className="rounded-lg overflow-hidden"
                style={{ borderLeft: '4px solid var(--color-brand-500, #6366f1)' }}
              >
                <textarea
                  value={doc.about}
                  onChange={(e) => setDoc((prev) => ({ ...prev, about: e.target.value.slice(0, 2000) }))}
                  placeholder="Salesforce·Tableau 기반의 CRM·데이터 시각화 솔루션을 다수의 고객사에 맞춰 납품하는 밀버스의 업무 구조가..."
                  className="input-base w-full resize-none"
                  style={{
                    minHeight: '200px',
                    borderLeft: 'none',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    background: 'var(--color-bg-muted)',
                  }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.max(200, el.scrollHeight) + 'px';
                  }}
                />
              </div>
              <div className="text-right text-[11px] text-[var(--color-text-tertiary)] mt-1">
                {doc.about.length} / 2000자
              </div>
            </div>

          </div>
          </div>

          {/* Bottom bar (mobile) — below scroll area, always visible */}
          <div className="shrink-0 lg:hidden">
            <ResumeBottomBar
              completion={0}
              onSave={handleSave}
              saving={saving}
              saved={false}
              onPreview={handlePreview}
            />
          </div>
        </div>

        {/* ─── Right: side panel (desktop) ─── */}
        <div className="hidden lg:flex flex-col w-[300px] shrink-0 border-l border-[var(--color-border-subtle)]">
          <ResumeSidePanel
            doc={doc}
            hiddenSections={hiddenSections}
            onToggleSection={handleToggleSection}
            onScrollTo={handleScrollTo}
            onPreview={handlePreview}
            onSave={handleSave}
            saving={saving}
            careerDescFileId={careerDescFileId}
            portfolioFileId={portfolioFileId}
          />
        </div>
      </div>

      {aiPanel && (
        <AiSummaryPanel
          rawText={aiPanel.rawText}
          companyName={aiPanel.company}
          position={aiPanel.position}
          onClose={() => setAiPanel(null)}
          onApply={(bullets) => {
            // AI 결과에 "• " prefix 붙여 textarea 에도 불릿으로 보이게
            updateExperience(aiPanel.expIndex, 'bullets', bullets.map(ensureBulletPrefix));
            setAiPanel(null);
            toast('AI 요약을 적용했어요.', 'success');
          }}
        />
      )}
    </>
  );
}

/* ─── Internal components ─── */

function SectionDivider({ title, count, onAdd }: { title: string; count?: number; onAdd?: () => void }) {
  return (
    <div className="mt-8 mb-5">
      <div className="h-2 -mx-5 md:-mx-0 bg-[var(--color-bg-muted)] mb-5 rounded" />
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">
          {title}
          {count !== undefined && count > 0 && <span className="text-[13px] text-[var(--color-text-tertiary)] font-normal ml-2">{count}</span>}
        </h2>
        {onAdd && (
          <button type="button" onClick={onAdd} className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
            + 추가
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-[13px] font-semibold text-[var(--color-text-primary)]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <HintIcon text={hint} />}
      </div>
      {children}
    </div>
  );
}

/**
 * 라벨 옆에 붙는 ⓘ 아이콘. 호버(desktop) / 터치(mobile) 시 tooltip 표시.
 * - FormField hint 가 수평·수직 레이아웃을 깨지 않고 일관되도록 pop-up 형태.
 * - role="tooltip" + aria-describedby 로 접근성 유지.
 */
function HintIcon({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group/hint">
      <button
        type="button"
        aria-label={`안내: ${text}`}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:text-indigo-600 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full mt-1.5 z-20 min-w-max max-w-[280px] px-2.5 py-1.5 rounded-md text-[11.5px] leading-snug text-white bg-[var(--color-text-primary)] dark:bg-[var(--color-bg-elevated,#1f2937)] shadow-lg opacity-0 group-hover/hint:opacity-100 group-focus-within/hint:opacity-100 transition-opacity duration-150"
      >
        {text}
      </span>
    </span>
  );
}

type ItemCardProps = {
  label?: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: React.ReactNode;
};

function ItemCard({ label, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown, children }: ItemCardProps) {
  const showOrder = onMoveUp != null || onMoveDown != null;
  const actions = (
    <div className="flex items-center gap-0.5 shrink-0">
      {showOrder && (
        <>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="위로 이동"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 15 7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="아래로 이동"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>
          <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
        </>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="삭제"
        className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
      >
        <IconTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="card p-5 mb-4 relative group">
      {label && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] truncate min-w-0">{label}</h3>
          {actions}
        </div>
      )}
      {!label && (
        <div className="absolute top-3 right-3">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

function EmptyHint({ text, onAdd, addLabel }: { text: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="text-center py-8 text-[var(--color-text-tertiary)]">
      <p className="text-[13px] mb-3">{text}</p>
      <button type="button" onClick={onAdd} className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">
        <IconPlus className="w-4 h-4 inline mr-1" />{addLabel}
      </button>
    </div>
  );
}
