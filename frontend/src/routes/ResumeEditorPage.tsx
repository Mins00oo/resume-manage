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
      id: String(c.career.id),
      company: c.career.companyName ?? '',
      role: c.career.position ?? '',
      startDate: c.career.startDate ?? '',
      endDate: c.career.isCurrent ? null : (c.career.endDate ?? ''),
      location: c.career.department ?? '',
      bullets: c.career.responsibilities ? c.career.responsibilities.split('\n').filter(Boolean) : [],
    })),
    projects: detail.careers.flatMap((c) =>
      c.projects.map((p) => ({
        id: String(p.id),
        name: p.title ?? '',
        role: '',
        period: [p.startDate, p.endDate].filter(Boolean).join(' - '),
        description: p.description ?? '',
        bullets: [],
      })),
    ),
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
    certifications: detail.certificates.map((c) => ({ id: String(c.id), name: c.name ?? '', issuer: c.issuer ?? '', issuedAt: c.acquiredAt ?? '' })),
    languages: detail.languages.map((l) => ({ id: String(l.id), name: l.language ?? '', level: [l.testName, l.score].filter(Boolean).join(' ') })),
  };
}

function emptyDocument(): ResumeDocument {
  return {
    id: 0, title: '', template: 'clean', accentColor: '#4F46E5',
    profile: { name: '', headline: '', email: '', phone: '', location: '', links: [] },
    about: '', experiences: [], projects: [], education: [], certifications: [], languages: [],
  };
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
        types[String(c.career.id)] = (c.career.employmentType as CareerEmploymentType) ?? '';
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
      const prevCareers = previous?.careers.map((c) => c.career) ?? [];
      const careerIdMap = await syncCareers(resumeIdNum, doc.experiences, prevCareers, expEmploymentTypes);

      // 3. 프로젝트 — 현재 UI는 flat 리스트. 저장 시 첫 번째 경력에 귀속.
      //    기존 프로젝트는 모두 삭제 후 재생성 (단순화).
      const prevProjectsWithCareer = previous?.careers.flatMap((c) =>
        c.projects.map((p) => ({ careerId: c.career.id, projectId: p.id })),
      ) ?? [];
      for (const p of prevProjectsWithCareer) {
        await resumeApi.deleteCareerProject(resumeIdNum, p.careerId, p.projectId);
      }
      if (doc.projects.length > 0) {
        // 프로젝트 저장을 위해서는 경력이 하나 이상 필요
        const firstExp = doc.experiences[0];
        const anchorCareerId = firstExp ? careerIdMap[firstExp.id] : null;
        if (anchorCareerId == null) {
          toast('프로젝트는 경력이 하나 이상 있어야 저장돼요.', 'warning');
        } else {
          for (let i = 0; i < doc.projects.length; i++) {
            const proj = doc.projects[i];
            const parts = proj.period.split(' - ');
            await resumeApi.createCareerProject(resumeIdNum, anchorCareerId, {
              title: proj.name,
              startDate: parts[0] || null,
              endDate: parts[1] || null,
              description: proj.description,
              orderIndex: i,
            });
          }
        }
      }

      // 4. 학력 (diff)
      await syncEducations(resumeIdNum, doc.education, previous?.educations ?? []);

      // 5. 자격증 (diff)
      await syncCertificates(resumeIdNum, doc.certifications, previous?.certificates ?? []);

      // 6. 어학 (diff)
      await syncLanguages(resumeIdNum, doc.languages, previous?.languages ?? []);

      // 7. 자기소개 — FREE 타입 coverLetter 로 저장
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
            types[String(c.career.id)] = (c.career.employmentType as CareerEmploymentType) ?? '';
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

  const addProject = () => setDoc((prev) => ({ ...prev, projects: [...prev.projects, { id: Date.now().toString(), name: '', role: '', period: '', description: '', bullets: [] }] }));
  const removeProject = (i: number) => setDoc((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));
  const updateProject = (i: number, key: string, value: unknown) => setDoc((prev) => ({ ...prev, projects: prev.projects.map((p, idx) => idx === i ? { ...p, [key]: value } : p) }));

  const addEducation = () => setDoc((prev) => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), degreeType: '', school: '', degree: '', graduationStatus: '', startDate: '', endDate: '' }] }));
  const removeEducation = (i: number) => setDoc((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  const updateEducation = (i: number, key: string, value: unknown) => setDoc((prev) => ({ ...prev, education: prev.education.map((e, idx) => idx === i ? { ...e, [key]: value } : e) }));

  const addCert = () => setDoc((prev) => ({ ...prev, certifications: [...prev.certifications, { id: Date.now().toString(), name: '', issuer: '', issuedAt: '' }] }));
  const removeCert = (i: number) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));

  const addLang = () => setDoc((prev) => ({ ...prev, languages: [...prev.languages, { id: Date.now().toString(), name: '', level: '' }] }));
  const removeLang = (i: number) => setDoc((prev) => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }));

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
                  <ItemCard key={exp.id} label={`경력 ${String(i + 1).padStart(2, '0')}`} onRemove={() => removeExperience(i)}>
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
                    <FormField label="담당 업무" hint="채용담당자에게 특별한 인상을 줄 수 있는 지원자님만의 소개글을 작성해보세요!">
                      <textarea
                        value={exp.bullets.join('\n')}
                        onChange={(e) => updateExperience(i, 'bullets', e.target.value.split('\n'))}
                        placeholder="자사 솔루션(DiCube) 개발 및 고도화&#10;• DiCube 플랫폼의 프론트엔드 아키텍처 설계·개발을 단독 담당하며..."
                        className="input-base w-full resize-none"
                        style={{ minHeight: '120px' }}
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = 'auto';
                          el.style.height = Math.max(120, el.scrollHeight) + 'px';
                        }}
                      />
                    </FormField>
                  </ItemCard>
                );
              })}
            </div>

            {/* ══ 프로젝트 ══ */}
            <div ref={(el) => { sectionRefs.current.projects = el; }}>
              <SectionDivider title="프로젝트" count={doc.projects.length} onAdd={addProject} />
              {doc.projects.length === 0 && <EmptyHint text="아직 프로젝트가 없어요" onAdd={addProject} addLabel="프로젝트 추가" />}
              {doc.projects.map((proj, i) => {
                // Parse period "YYYY-MM - YYYY-MM" to start/end
                const parts = proj.period.split(' - ');
                const projStart = parts[0] ?? '';
                const projEnd = parts[1] ?? '';
                return (
                  <ItemCard key={proj.id} label={`프로젝트 ${String(i + 1).padStart(2, '0')}`} onRemove={() => removeProject(i)}>
                    <FormField label="프로젝트명">
                      <input type="text" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} placeholder="이력서 관리 서비스" className="input-base w-full" />
                    </FormField>
                    <FormField label="프로젝트 기간">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MonthYearPicker
                          value={projStart}
                          onChange={(v) => updateProject(i, 'period', `${v} - ${projEnd}`)}
                          placeholder="시작 년.월."
                          className="input-base w-full"
                          maxDate={projEnd || undefined}
                        />
                        <MonthYearPicker
                          value={projEnd}
                          onChange={(v) => updateProject(i, 'period', `${projStart} - ${v}`)}
                          placeholder="종료 년.월."
                          className="input-base w-full"
                          minDate={projStart || undefined}
                        />
                      </div>
                    </FormField>
                    <FormField label="소속/기관">
                      <input type="text" value={proj.role} onChange={(e) => updateProject(i, 'role', e.target.value)} placeholder="코리아엑스퍼트(주)" className="input-base w-full" />
                    </FormField>
                    <FormField label="프로젝트 설명">
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(i, 'description', e.target.value)}
                        placeholder="프로젝트에 대한 설명을 작성해보세요..."
                        className="input-base w-full resize-none"
                        style={{ minHeight: '120px' }}
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = 'auto';
                          el.style.height = Math.max(120, el.scrollHeight) + 'px';
                        }}
                      />
                    </FormField>
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
                  <ItemCard key={edu.id} label={`교육 ${String(i + 1).padStart(2, '0')}`} onRemove={() => removeEducation(i)}>
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
                <ItemCard key={cert.id} onRemove={() => removeCert(i)}>
                  <FormField label="자격증명">
                    <input type="text" value={cert.name} onChange={(e) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c) }))} placeholder="정보처리기사" className="input-base w-full" />
                  </FormField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="발급기관">
                      <input type="text" value={cert.issuer} onChange={(e) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, issuer: e.target.value } : c) }))} placeholder="한국산업인력공단" className="input-base w-full" />
                    </FormField>
                    <FormField label="취득일">
                      <MonthYearPicker
                        value={cert.issuedAt}
                        onChange={(v) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, issuedAt: v } : c) }))}
                        className="input-base w-full"
                      />
                    </FormField>
                  </div>
                </ItemCard>
              ))}
            </div>

            {/* ══ 어학 ══ */}
            <div ref={(el) => { sectionRefs.current.languages = el; }}>
              <SectionDivider title="어학" count={doc.languages.length} onAdd={addLang} />
              {doc.languages.length === 0 && <EmptyHint text="아직 어학 정보가 없어요" onAdd={addLang} addLabel="어학 추가" />}
              {doc.languages.map((lang, i) => (
                <ItemCard key={lang.id} onRemove={() => removeLang(i)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="언어">
                      <input type="text" value={lang.name} onChange={(e) => setDoc((prev) => ({ ...prev, languages: prev.languages.map((l, idx) => idx === i ? { ...l, name: e.target.value } : l) }))} placeholder="영어" className="input-base w-full" />
                    </FormField>
                    <FormField label="수준">
                      <input type="text" value={lang.level} onChange={(e) => setDoc((prev) => ({ ...prev, languages: prev.languages.map((l, idx) => idx === i ? { ...l, level: e.target.value } : l) }))} placeholder="TOEIC 920 / Business" className="input-base w-full" />
                    </FormField>
                  </div>
                </ItemCard>
              ))}
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
      <label className="block text-[13px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {hint && <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function ItemCard({ label, onRemove, children }: { label?: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="card p-5 mb-4 relative group">
      {label && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)]">{label}</h3>
          <button type="button" onClick={onRemove} className="w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {!label && (
        <button type="button" onClick={onRemove} className="absolute top-3 right-3 w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
          <IconTrash className="w-3.5 h-3.5" />
        </button>
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
