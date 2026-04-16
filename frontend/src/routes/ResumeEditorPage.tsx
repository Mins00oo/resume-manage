import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { resumeApi } from '../lib/api/resume';
import type { ResumeDetail } from '../types/resume';
import type { ResumeDocument } from '../mocks/data';
import {
  IconChevronLeft,
  IconDownload,
  IconSparkles,
  IconPlus,
  IconTrash,
  IconCheck,
} from '../components/icons/Icons';
import { cn } from '../lib/cn';
import ResumePreview from '../components/resume/ResumePreview';
import ResumeSectionEditor from '../components/resume/ResumeSectionEditor';

type SectionKey =
  | 'profile'
  | 'about'
  | 'experiences'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages';

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: 'profile', label: '기본 정보', icon: '👤' },
  { key: 'about', label: '자기소개', icon: '✍️' },
  { key: 'experiences', label: '경력', icon: '💼' },
  { key: 'projects', label: '프로젝트', icon: '🚀' },
  { key: 'education', label: '학력', icon: '🎓' },
  { key: 'skills', label: '기술 스택', icon: '🛠️' },
  { key: 'certifications', label: '자격증', icon: '📜' },
  { key: 'languages', label: '언어', icon: '🌍' },
];

const TEMPLATES: { key: 'clean' | 'modern' | 'elegant'; label: string; color: string }[] = [
  { key: 'clean', label: 'Clean', color: '#4F46E5' },
  { key: 'modern', label: 'Modern', color: '#EC4899' },
  { key: 'elegant', label: 'Elegant', color: '#0F766E' },
];

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (resp?.data?.error?.message) return resp.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했어요.';
}

/** Convert backend ResumeDetail to the local ResumeDocument shape used by the preview/editor. */
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
      bullets: c.career.responsibilities
        ? c.career.responsibilities.split('\n').filter(Boolean)
        : [],
    })),
    projects: detail.careers.flatMap((c) =>
      c.projects.map((p) => ({
        id: String(p.id),
        name: p.title ?? '',
        role: '',
        period: [p.startDate, p.endDate].filter(Boolean).join(' - '),
        description: p.description ?? '',
        bullets: [],
        tech: [],
      })),
    ),
    education: detail.educations.map((e) => ({
      id: String(e.id),
      school: e.schoolName ?? '',
      degree: [e.major, e.degree].filter(Boolean).join(' · '),
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      description: e.gpa != null && e.gpaMax != null ? `GPA ${e.gpa}/${e.gpaMax}` : undefined,
    })),
    skills: [],
    certifications: detail.certificates.map((c) => ({
      id: String(c.id),
      name: c.name ?? '',
      issuer: c.issuer ?? '',
      issuedAt: c.acquiredAt ?? '',
    })),
    languages: detail.languages.map((l) => ({
      id: String(l.id),
      name: l.language ?? '',
      level: [l.testName, l.score].filter(Boolean).join(' '),
    })),
  };
}

/** Build an empty ResumeDocument for new resume creation. */
function emptyDocument(): ResumeDocument {
  return {
    id: 0,
    title: '새 이력서',
    template: 'clean',
    accentColor: '#4F46E5',
    profile: { name: '', headline: '', email: '', phone: '', location: '', links: [] },
    about: '',
    experiences: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  };
}

export default function ResumeEditorPage() {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();
  const isNew = !idParam || idParam === 'new';
  const resumeId = isNew ? null : Number(idParam);

  const [doc, setDoc] = useState<ResumeDocument>(emptyDocument());
  const [activeSection, setActiveSection] = useState<SectionKey>('profile');
  const [zoom, setZoom] = useState(0.72);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const initialized = useRef(false);

  /* Fetch resume detail */
  const {
    data: detail,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.get(resumeId!),
    enabled: resumeId != null,
  });

  /* Sync fetched detail to local state (once) */
  useEffect(() => {
    if (detail && !initialized.current) {
      initialized.current = true;
      setDoc(detailToDocument(detail));
    }
  }, [detail]);

  /* Create new resume */
  const createMutation = useMutation({
    mutationFn: (title: string) => resumeApi.create(title),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resumes/${newId}`, { replace: true });
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  /* Auto-create on mount for /resumes/new */
  useEffect(() => {
    if (isNew && !createMutation.isPending && !createMutation.isSuccess) {
      createMutation.mutate('새 이력서');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  /* Title update */
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      resumeApi.updateTitle(id, title),
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err) => {
      setSaveStatus('idle');
      alert(getErrorMessage(err));
    },
  });

  const handleTitleChange = useCallback(
    (title: string) => {
      setDoc((prev) => ({ ...prev, title }));
      if (resumeId == null) return;
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      setSaveStatus('saving');
      titleTimerRef.current = setTimeout(() => {
        updateTitleMutation.mutate({ id: resumeId, title });
      }, 800);
    },
    [resumeId, updateTitleMutation],
  );

  /* Save basic info */
  const saveBasicInfoMutation = useMutation({
    mutationFn: () => {
      if (resumeId == null) return Promise.resolve();
      return resumeApi.updateBasicInfo(resumeId, {
        nameKo: doc.profile.name,
        email: doc.profile.email,
        phone: doc.profile.phone,
        address: doc.profile.location,
        shortIntro: doc.about || doc.profile.headline,
      });
    },
    onSuccess: () => {
      setSaveStatus('saved');
      if (resumeId != null) {
        queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      }
    },
    onError: (err) => {
      setSaveStatus('idle');
      alert(getErrorMessage(err));
    },
  });

  /* Auto-save basic info on profile/about changes (debounced) */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDocRef = useRef(doc);
  useEffect(() => {
    if (resumeId == null || !initialized.current) return;
    const prev = prevDocRef.current;
    prevDocRef.current = doc;

    const profileChanged =
      prev.profile.name !== doc.profile.name ||
      prev.profile.email !== doc.profile.email ||
      prev.profile.phone !== doc.profile.phone ||
      prev.profile.location !== doc.profile.location ||
      prev.profile.headline !== doc.profile.headline;
    const aboutChanged = prev.about !== doc.about;

    if (profileChanged || aboutChanged) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus('saving');
      saveTimerRef.current = setTimeout(() => {
        saveBasicInfoMutation.mutate();
      }, 1200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.profile, doc.about, resumeId]);

  /* PDF download */
  const downloadPdfMutation = useMutation({
    mutationFn: () => {
      if (resumeId == null) return Promise.reject(new Error('이력서가 아직 생성되지 않았어요.'));
      return resumeApi.downloadPdf(resumeId);
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

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

  /* Loading / creating state */
  if (isNew && createMutation.isPending) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-[14px] text-slate-500">이력서를 생성하는 중...</div>
      </div>
    );
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-[14px] text-slate-500">이력서를 불러오는 중...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3">
        <div className="text-[14px] text-rose-600">{getErrorMessage(fetchError)}</div>
        <button
          type="button"
          onClick={() => navigate('/resumes')}
          className="btn-outline text-[12px]"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Editor top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/resumes')}
            className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={doc.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-[16px] font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 truncate"
          />
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <IconCheck className="w-3.5 h-3.5" />
              저장됨
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-[11px] text-slate-400 font-medium">저장 중...</span>
          )}
          {resumeId != null && (
            <span className="text-[11px] text-slate-400">#{resumeId}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Template selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() =>
                  setDoc({ ...doc, template: t.key, accentColor: t.color })
                }
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-all',
                  doc.template === t.key
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                {t.label}
              </button>
            ))}
          </div>

          {/* Completion */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="text-right leading-tight">
              <div className="text-[9.5px] font-semibold uppercase text-slate-500 tracking-wider">
                완성도
              </div>
              <div className="text-[13px] font-bold text-slate-900">
                {completion}%
              </div>
            </div>
            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('AI 리뷰 기능은 준비 중이에요.')}
            className="btn-outline text-[12px] py-1.5 px-3"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            AI 리뷰
          </button>
          <button
            type="button"
            onClick={() => downloadPdfMutation.mutate()}
            disabled={downloadPdfMutation.isPending || resumeId == null}
            className="btn-primary text-[12px] py-1.5 px-3 disabled:opacity-50"
          >
            <IconDownload className="w-3.5 h-3.5" />
            {downloadPdfMutation.isPending ? '...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Body split */}
      <div className="flex-1 flex min-h-0">
        {/* Left: section nav + editor */}
        <div className="w-[520px] shrink-0 border-r border-slate-200/80 bg-white flex flex-col">
          {/* Section tabs */}
          <nav className="flex items-center gap-1 px-3 py-2 border-b border-slate-200/80 overflow-x-auto shrink-0">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveSection(s.key)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors',
                  activeSection === s.key
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60'
                    : 'text-slate-500 hover:bg-slate-100',
                )}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>

          {/* Editor panel */}
          <div className="flex-1 overflow-y-auto p-6">
            <ResumeSectionEditor
              doc={doc}
              setDoc={setDoc}
              section={activeSection}
            />
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 bg-slate-100 relative overflow-auto">
          {/* Zoom controls */}
          <div className="sticky top-0 z-10 flex items-center justify-center gap-2 py-2 bg-slate-100/80 backdrop-blur border-b border-slate-200/60">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-sm font-bold"
            >
              -
            </button>
            <div className="text-[11px] font-semibold text-slate-600 w-12 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </div>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}
              className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-sm font-bold"
            >
              +
            </button>
          </div>

          <div className="p-10 flex justify-center">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <ResumePreview doc={doc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export helpers so section editor can import common bits
export { SECTIONS };
export type { SectionKey };

// Silence unused-imports if any
void IconPlus;
void IconTrash;
