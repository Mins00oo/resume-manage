import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockResumeDocument, type ResumeDocument } from '../mocks/data';
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

export default function ResumeEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<ResumeDocument>(mockResumeDocument);
  const [activeSection, setActiveSection] = useState<SectionKey>('profile');
  const [zoom, setZoom] = useState(0.72);

  const completion = useMemo(() => {
    let filled = 0;
    let total = 8;
    if (doc.profile.name && doc.profile.email) filled++;
    if (doc.about?.length > 20) filled++;
    if (doc.experiences.length > 0) filled++;
    if (doc.projects.length > 0) filled++;
    if (doc.education.length > 0) filled++;
    if (doc.skills.length > 0) filled++;
    if (doc.certifications.length > 0) filled++;
    if (doc.languages.length > 0) filled++;
    return Math.round((filled / total) * 100);
  }, [doc]);

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
            onChange={(e) => setDoc({ ...doc, title: e.target.value })}
            className="text-[16px] font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 truncate"
          />
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <IconCheck className="w-3.5 h-3.5" />
            자동 저장됨
          </span>
          <span className="text-[11px] text-slate-400">#{id ?? doc.id}</span>
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
            onClick={() => alert('PDF 다운로드는 백엔드 연동 후 사용할 수 있어요.')}
            className="btn-primary text-[12px] py-1.5 px-3"
          >
            <IconDownload className="w-3.5 h-3.5" />
            PDF
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
              −
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
