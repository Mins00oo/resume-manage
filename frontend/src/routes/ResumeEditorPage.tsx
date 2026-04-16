import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { resumeApi } from '../lib/api/resume';
import { fileApi } from '../lib/api/file';
import type { ResumeDetail } from '../types/resume';
import type { ResumeDocument } from '../mocks/data';
import { IconDownload, IconPlus, IconTrash, IconCheck } from '../components/icons/Icons';
import { formatPhone } from '../lib/formatPhone';
import ResumePreview from '../components/resume/ResumePreview';
import PhotoUpload from '../components/resume/PhotoUpload';
import AddressSearch from '../components/resume/AddressSearch';
import ResumeBottomBar from '../components/resume/ResumeBottomBar';

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
        id: String(p.id), name: p.title ?? '', role: '', period: [p.startDate, p.endDate].filter(Boolean).join(' - '),
        description: p.description ?? '', bullets: [], tech: [],
      })),
    ),
    education: detail.educations.map((e) => ({
      id: String(e.id), school: e.schoolName ?? '', degree: [e.major, e.degree].filter(Boolean).join(' · '),
      startDate: e.startDate ?? '', endDate: e.endDate ?? '',
      description: e.gpa != null && e.gpaMax != null ? `GPA ${e.gpa}/${e.gpaMax}` : undefined,
    })),
    skills: [],
    certifications: detail.certificates.map((c) => ({ id: String(c.id), name: c.name ?? '', issuer: c.issuer ?? '', issuedAt: c.acquiredAt ?? '' })),
    languages: detail.languages.map((l) => ({ id: String(l.id), name: l.language ?? '', level: [l.testName, l.score].filter(Boolean).join(' ') })),
  };
}

function emptyDocument(): ResumeDocument {
  return {
    id: 0, title: '새 이력서', template: 'clean', accentColor: '#4F46E5',
    profile: { name: '', headline: '', email: '', phone: '', location: '', links: [] },
    about: '', experiences: [], projects: [], education: [], skills: [], certifications: [], languages: [],
  };
}

/* ─── page ─── */

export default function ResumeEditorPage() {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();
  const isNew = !idParam || idParam === 'new';
  const resumeId = isNew ? null : Number(idParam);

  const [doc, setDoc] = useState<ResumeDocument>(emptyDocument());
  const [zoom, setZoom] = useState(0.72);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileId, setPhotoFileId] = useState<number | null>(null);
  const [addressMain, setAddressMain] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const initialized = useRef(false);

  /* Fetch */
  const { data: detail, isLoading, error: fetchError } = useQuery({
    queryKey: ['resume', resumeId], queryFn: () => resumeApi.get(resumeId!), enabled: resumeId != null,
  });

  useEffect(() => {
    if (detail && !initialized.current) {
      initialized.current = true;
      setDoc(detailToDocument(detail));
      if (detail.basicInfo?.profileImageFileId) {
        setPhotoFileId(detail.basicInfo.profileImageFileId);
        setPhotoPreview(`/api/files/${detail.basicInfo.profileImageFileId}`);
      }
      if (detail.basicInfo?.address) {
        setAddressMain(detail.basicInfo.address);
      }
    }
  }, [detail]);

  /* Create */
  const createMutation = useMutation({
    mutationFn: (title: string) => resumeApi.create(title),
    onSuccess: (newId) => { queryClient.invalidateQueries({ queryKey: ['resumes'] }); navigate(`/resumes/${newId}`, { replace: true }); },
    onError: (err) => alert(getErrorMessage(err)),
  });

  useEffect(() => {
    if (isNew && !createMutation.isPending && !createMutation.isSuccess) createMutation.mutate('새 이력서');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  /* Title auto-save */
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => resumeApi.updateTitle(id, title),
    onSuccess: () => { setSaveStatus('saved'); queryClient.invalidateQueries({ queryKey: ['resumes'] }); },
    onError: (err) => { setSaveStatus('idle'); alert(getErrorMessage(err)); },
  });

  const handleTitleChange = useCallback((title: string) => {
    setDoc((prev) => ({ ...prev, title }));
    if (resumeId == null) return;
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    setSaveStatus('saving');
    titleTimerRef.current = setTimeout(() => updateTitleMutation.mutate({ id: resumeId, title }), 800);
  }, [resumeId, updateTitleMutation]);

  /* Basic info save */
  const saveBasicInfoMutation = useMutation({
    mutationFn: () => {
      if (resumeId == null) return Promise.resolve();
      return resumeApi.updateBasicInfo(resumeId, {
        nameKo: doc.profile.name, email: doc.profile.email, phone: doc.profile.phone,
        address: doc.profile.location, shortIntro: doc.about || doc.profile.headline,
        profileImageFileId: photoFileId,
      });
    },
    onSuccess: () => { setSaveStatus('saved'); if (resumeId != null) queryClient.invalidateQueries({ queryKey: ['resume', resumeId] }); },
    onError: (err) => { setSaveStatus('idle'); alert(getErrorMessage(err)); },
  });

  /* Auto-save debounce */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDocRef = useRef(doc);
  useEffect(() => {
    if (resumeId == null || !initialized.current) return;
    const prev = prevDocRef.current;
    prevDocRef.current = doc;
    const changed = prev.profile.name !== doc.profile.name || prev.profile.email !== doc.profile.email ||
      prev.profile.phone !== doc.profile.phone || prev.profile.location !== doc.profile.location ||
      prev.profile.headline !== doc.profile.headline || prev.about !== doc.about;
    if (changed) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus('saving');
      saveTimerRef.current = setTimeout(() => saveBasicInfoMutation.mutate(), 1200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.profile, doc.about, resumeId]);

  /* PDF download */
  const downloadPdfMutation = useMutation({
    mutationFn: () => { if (resumeId == null) return Promise.reject(new Error('이력서가 아직 생성되지 않았어요.')); return resumeApi.downloadPdf(resumeId); },
    onError: (err) => alert(getErrorMessage(err)),
  });

  /* Photo */
  const handlePhotoUpload = async (file: File) => {
    try {
      const result = await fileApi.upload(file);
      setPhotoFileId(result.id);
      setPhotoPreview(URL.createObjectURL(file));
    } catch { alert('사진 업로드에 실패했어요.'); }
  };
  const handlePhotoRemove = () => { setPhotoFileId(null); setPhotoPreview(null); };

  /* Completion */
  const completion = useMemo(() => {
    if (detail) return detail.completionRate;
    let filled = 0;
    const total = 8;
    if (doc.profile.name && doc.profile.email) filled++;
    if (doc.about?.length > 20) filled++;
    if (doc.experiences.length > 0) filled++;
    if (doc.projects.length > 0) filled++;
    if (doc.education.length > 0) filled++;
    if (doc.skills.length > 0) filled++;
    if (doc.certifications.length > 0) filled++;
    if (doc.languages.length > 0) filled++;
    return Math.round((filled / total) * 100);
  }, [doc, detail]);

  /* Helpers to update nested doc */
  const updateProfile = (key: string, value: string) => setDoc((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  const addExperience = () => setDoc((prev) => ({ ...prev, experiences: [...prev.experiences, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', location: '', bullets: [] }] }));
  const removeExperience = (i: number) => setDoc((prev) => ({ ...prev, experiences: prev.experiences.filter((_, idx) => idx !== i) }));
  const updateExperience = (i: number, key: string, value: unknown) => setDoc((prev) => ({ ...prev, experiences: prev.experiences.map((e, idx) => idx === i ? { ...e, [key]: value } : e) }));

  const addProject = () => setDoc((prev) => ({ ...prev, projects: [...prev.projects, { id: Date.now().toString(), name: '', role: '', period: '', description: '', bullets: [], tech: [] }] }));
  const removeProject = (i: number) => setDoc((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));
  const updateProject = (i: number, key: string, value: unknown) => setDoc((prev) => ({ ...prev, projects: prev.projects.map((p, idx) => idx === i ? { ...p, [key]: value } : p) }));

  const addEducation = () => setDoc((prev) => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), school: '', degree: '', startDate: '', endDate: '' }] }));
  const removeEducation = (i: number) => setDoc((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  const updateEducation = (i: number, key: string, value: string) => setDoc((prev) => ({ ...prev, education: prev.education.map((e, idx) => idx === i ? { ...e, [key]: value } : e) }));

  const addSkill = () => setDoc((prev) => ({ ...prev, skills: [...prev.skills, { id: Date.now().toString(), category: '', items: [] }] }));
  const removeSkill = (i: number) => setDoc((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));

  const addCert = () => setDoc((prev) => ({ ...prev, certifications: [...prev.certifications, { id: Date.now().toString(), name: '', issuer: '', issuedAt: '' }] }));
  const removeCert = (i: number) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));

  const addLang = () => setDoc((prev) => ({ ...prev, languages: [...prev.languages, { id: Date.now().toString(), name: '', level: '' }] }));
  const removeLang = (i: number) => setDoc((prev) => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }));

  /* Loading states */
  if (isNew && createMutation.isPending) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isNew && isLoading) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (fetchError) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3">
      <div className="text-[14px] text-rose-600">{getErrorMessage(fetchError)}</div>
      <button type="button" onClick={() => navigate('/resumes')} className="btn-outline text-[12px]">목록으로 돌아가기</button>
    </div>
  );

  return (
    <>
      <div className="flex h-[calc(100vh-56px)] md:h-[calc(100vh-64px)]">
        {/* ─── Left: scrollable form ─── */}
        <div className="flex-1 overflow-y-auto pb-[200px] lg:pb-8">
          <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">

            {/* Title */}
            <div className="mb-2">
              <p className="text-[12px] text-[var(--color-text-tertiary)] mb-1">프로필명은 나에게만 보여요!</p>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="예: 2026 프론트엔드 지원용"
                className="w-full text-[20px] md:text-[24px] font-bold text-[var(--color-text-primary)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <IconCheck className="w-3.5 h-3.5" /> 저장됨
                </span>
              )}
              {saveStatus === 'saving' && <span className="text-[11px] text-[var(--color-text-tertiary)] mt-1">저장 중...</span>}
            </div>

            {/* ══ 기본 정보 ══ */}
            <SectionDivider title="기본 정보" />
            <p className="text-[11px] text-rose-500 font-medium mb-4">* 필수</p>

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
                onChange={(addr) => {
                  setAddressMain(addr);
                  updateProfile('location', addressDetail ? `${addr} ${addressDetail}` : addr);
                }}
                detailValue={addressDetail}
                onDetailChange={(detail) => {
                  setAddressDetail(detail);
                  updateProfile('location', addressMain ? `${addressMain} ${detail}` : detail);
                }}
              />
            </FormField>

            {/* ══ 자기소개 ══ */}
            <SectionDivider title="자기소개" />
            <FormField label="한줄 소개" hint="특별한 인상을 줄 수 있는 소개글을 작성해 보세요. (600자 이내)">
              <textarea
                value={doc.about}
                onChange={(e) => setDoc((prev) => ({ ...prev, about: e.target.value.slice(0, 600) }))}
                placeholder="React와 Spring Boot를 활용한 풀스택 솔루션 개발 경험을 보유한 2년차 개발자입니다..."
                rows={6}
                className="input-base w-full resize-none"
              />
              <div className="text-right text-[11px] text-[var(--color-text-tertiary)] mt-1">
                {doc.about.length} / 600자
              </div>
            </FormField>

            {/* ══ 경력 ══ */}
            <SectionDivider title="경력" count={doc.experiences.length} onAdd={addExperience} />
            {doc.experiences.length === 0 && <EmptyHint text="아직 경력이 없어요" onAdd={addExperience} addLabel="경력 추가" />}
            {doc.experiences.map((exp, i) => (
              <ItemCard key={exp.id} onRemove={() => removeExperience(i)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="회사"><input type="text" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} placeholder="토스" className="input-base w-full" /></FormField>
                  <FormField label="직책"><input type="text" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} placeholder="프론트엔드 엔지니어" className="input-base w-full" /></FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="시작일"><input type="text" placeholder="2024.03" value={exp.startDate} onChange={(e) => updateExperience(i, 'startDate', e.target.value)} className="input-base w-full" /></FormField>
                  {exp.endDate !== null && (
                    <FormField label="종료일"><input type="text" placeholder="2024.03" value={exp.endDate ?? ''} onChange={(e) => updateExperience(i, 'endDate', e.target.value)} className="input-base w-full" /></FormField>
                  )}
                </div>
                <label className="flex items-center gap-2 mt-1 text-[12px] text-[var(--color-text-secondary)] cursor-pointer">
                  <input type="checkbox" checked={exp.endDate === null} onChange={(e) => updateExperience(i, 'endDate', e.target.checked ? null : '')} className="w-4 h-4 rounded" />
                  현재 재직 중
                </label>
                <FormField label="부서/위치"><input type="text" value={exp.location} onChange={(e) => updateExperience(i, 'location', e.target.value)} placeholder="프론트엔드팀" className="input-base w-full" /></FormField>
                <FormField label="주요 성과">
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2 mb-2">
                      <span className="text-[var(--color-text-tertiary)]">•</span>
                      <input type="text" value={b} onChange={(e) => { const bs = [...exp.bullets]; bs[bi] = e.target.value; updateExperience(i, 'bullets', bs); }} className="input-base flex-1" />
                      <button type="button" onClick={() => { const bs = exp.bullets.filter((_, j) => j !== bi); updateExperience(i, 'bullets', bs); }} className="text-[var(--color-text-tertiary)] hover:text-rose-500"><IconTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => updateExperience(i, 'bullets', [...exp.bullets, ''])} className="text-[12px] text-indigo-600 font-medium">+ 항목 추가</button>
                </FormField>
              </ItemCard>
            ))}

            {/* ══ 프로젝트 ══ */}
            <SectionDivider title="프로젝트" count={doc.projects.length} onAdd={addProject} />
            {doc.projects.length === 0 && <EmptyHint text="아직 프로젝트가 없어요" onAdd={addProject} addLabel="프로젝트 추가" />}
            {doc.projects.map((proj, i) => (
              <ItemCard key={proj.id} onRemove={() => removeProject(i)}>
                <FormField label="프로젝트명"><input type="text" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} placeholder="이력서 관리 서비스" className="input-base w-full" /></FormField>
                <FormField label="기간"><input type="text" value={proj.period} onChange={(e) => updateProject(i, 'period', e.target.value)} placeholder="2024.01 - 2024.12" className="input-base w-full" /></FormField>
                <FormField label="설명"><input type="text" value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} placeholder="프로젝트 한줄 설명" className="input-base w-full" /></FormField>
                <FormField label="기술 스택" hint="콤마로 구분">
                  <input type="text" value={proj.tech.join(', ')} onChange={(e) => updateProject(i, 'tech', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="React, TypeScript, Spring Boot" className="input-base w-full" />
                </FormField>
              </ItemCard>
            ))}

            {/* ══ 학력 ══ */}
            <SectionDivider title="학력" count={doc.education.length} onAdd={addEducation} />
            {doc.education.length === 0 && <EmptyHint text="아직 학력이 없어요" onAdd={addEducation} addLabel="학력 추가" />}
            {doc.education.map((edu, i) => (
              <ItemCard key={edu.id} onRemove={() => removeEducation(i)}>
                <FormField label="학교"><input type="text" value={edu.school} onChange={(e) => updateEducation(i, 'school', e.target.value)} placeholder="서울대학교" className="input-base w-full" /></FormField>
                <FormField label="전공 · 학위"><input type="text" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} placeholder="컴퓨터공학 · 학사" className="input-base w-full" /></FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="시작일"><input type="text" placeholder="2024.03" value={edu.startDate} onChange={(e) => updateEducation(i, 'startDate', e.target.value)} className="input-base w-full" /></FormField>
                  <FormField label="종료일"><input type="text" placeholder="2024.03" value={edu.endDate} onChange={(e) => updateEducation(i, 'endDate', e.target.value)} className="input-base w-full" /></FormField>
                </div>
              </ItemCard>
            ))}

            {/* ══ 기술 스택 ══ */}
            <SectionDivider title="기술 스택" count={doc.skills.length} onAdd={addSkill} />
            {doc.skills.length === 0 && <EmptyHint text="아직 기술 스택이 없어요" onAdd={addSkill} addLabel="기술 추가" />}
            {doc.skills.map((skill, i) => (
              <ItemCard key={skill.id} onRemove={() => removeSkill(i)}>
                <FormField label="카테고리"><input type="text" value={skill.category} onChange={(e) => setDoc((prev) => ({ ...prev, skills: prev.skills.map((s, idx) => idx === i ? { ...s, category: e.target.value } : s) }))} placeholder="프론트엔드" className="input-base w-full" /></FormField>
                <FormField label="스킬" hint="콤마로 구분">
                  <input type="text" value={skill.items.join(', ')} onChange={(e) => setDoc((prev) => ({ ...prev, skills: prev.skills.map((s, idx) => idx === i ? { ...s, items: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } : s) }))} placeholder="React, TypeScript, Next.js" className="input-base w-full" />
                </FormField>
              </ItemCard>
            ))}

            {/* ══ 자격증 ══ */}
            <SectionDivider title="자격증" count={doc.certifications.length} onAdd={addCert} />
            {doc.certifications.length === 0 && <EmptyHint text="아직 자격증이 없어요" onAdd={addCert} addLabel="자격증 추가" />}
            {doc.certifications.map((cert, i) => (
              <ItemCard key={cert.id} onRemove={() => removeCert(i)}>
                <FormField label="자격증명"><input type="text" value={cert.name} onChange={(e) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c) }))} placeholder="정보처리기사" className="input-base w-full" /></FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="발급기관"><input type="text" value={cert.issuer} onChange={(e) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, issuer: e.target.value } : c) }))} placeholder="한국산업인력공단" className="input-base w-full" /></FormField>
                  <FormField label="취득일"><input type="date" value={cert.issuedAt} onChange={(e) => setDoc((prev) => ({ ...prev, certifications: prev.certifications.map((c, idx) => idx === i ? { ...c, issuedAt: e.target.value } : c) }))} className="input-base w-full" /></FormField>
                </div>
              </ItemCard>
            ))}

            {/* ══ 어학 ══ */}
            <SectionDivider title="어학" count={doc.languages.length} onAdd={addLang} />
            {doc.languages.length === 0 && <EmptyHint text="아직 어학 정보가 없어요" onAdd={addLang} addLabel="어학 추가" />}
            {doc.languages.map((lang, i) => (
              <ItemCard key={lang.id} onRemove={() => removeLang(i)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="언어"><input type="text" value={lang.name} onChange={(e) => setDoc((prev) => ({ ...prev, languages: prev.languages.map((l, idx) => idx === i ? { ...l, name: e.target.value } : l) }))} placeholder="영어" className="input-base w-full" /></FormField>
                  <FormField label="수준"><input type="text" value={lang.level} onChange={(e) => setDoc((prev) => ({ ...prev, languages: prev.languages.map((l, idx) => idx === i ? { ...l, level: e.target.value } : l) }))} placeholder="TOEIC 920 / Business" className="input-base w-full" /></FormField>
                </div>
              </ItemCard>
            ))}

          </div>
        </div>

        {/* ─── Right: preview (desktop) ─── */}
        <div className="hidden lg:flex flex-col w-[480px] border-l border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)]">
            <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">미리보기</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))} className="w-7 h-7 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center">−</button>
              <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} className="w-7 h-7 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center">+</button>
            </div>
            <button type="button" onClick={() => downloadPdfMutation.mutate()} disabled={downloadPdfMutation.isPending} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
              <IconDownload className="w-4 h-4 inline mr-1" />{downloadPdfMutation.isPending ? '...' : 'PDF'}
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-[var(--color-bg-muted)] p-4 flex justify-center">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <ResumePreview doc={doc} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom bar (mobile) ─── */}
      <div className="lg:hidden">
        <ResumeBottomBar
          completion={completion}
          onSave={() => saveBasicInfoMutation.mutate()}
          saving={saveBasicInfoMutation.isPending}
          saved={saveStatus === 'saved'}
          onSettings={() => setMobilePreviewOpen(true)}
          onMore={() => {
            if (confirm('PDF를 다운로드할까요?')) downloadPdfMutation.mutate();
          }}
        />
      </div>

      {/* ─── Mobile preview modal ─── */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)]">
            <span className="text-[14px] font-bold text-[var(--color-text-primary)]">미리보기</span>
            <button type="button" onClick={() => setMobilePreviewOpen(false)} className="text-[13px] font-semibold text-indigo-600">닫기</button>
          </div>
          <div className="flex-1 overflow-auto bg-[var(--color-bg-muted)] p-4 flex justify-center">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <ResumePreview doc={doc} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Internal components ─── */

function SectionDivider({ title, count, onAdd }: { title: string; count?: number; onAdd?: () => void }) {
  return (
    <div className="mt-8 mb-5">
      <div className="h-2 -mx-4 md:-mx-0 bg-[var(--color-bg-muted)] mb-5 rounded" />
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

function ItemCard({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="card p-4 mb-3 relative group">
      <button type="button" onClick={onRemove} className="absolute top-3 right-3 w-7 h-7 rounded-lg text-[var(--color-text-tertiary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
        <IconTrash className="w-3.5 h-3.5" />
      </button>
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
