import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resumeApi } from '../lib/api/resume';
import ResumePreview from '../components/resume/ResumePreview';
import type { ResumeDocument } from '../mocks/data';
import type { ResumeDetail } from '../types/resume';
import { useState } from 'react';

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

export default function ResumePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const resumeId = Number(id);
  const [zoom, setZoom] = useState(0.85);

  const { data: detail, isLoading, error } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.get(resumeId),
    enabled: !!resumeId,
    refetchInterval: 5000, // Poll every 5s to catch saves
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg-muted)]">
        <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg-muted)]">
        <p className="text-[14px] text-rose-600">이력서를 불러올 수 없어요.</p>
      </div>
    );
  }

  const doc = detailToDocument(detail);

  const handleDownloadPdf = () => {
    const prevTitle = document.title;
    document.title = doc.title || '이력서';
    window.print();
    document.title = prevTitle;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)]">
      {/* Toolbar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 backdrop-blur-lg print:hidden"
        style={{
          background: 'color-mix(in srgb, var(--color-bg-surface) 85%, transparent)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
          {doc.title || '제목 없음'} — 미리보기
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
            className="w-7 h-7 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center"
          >
            −
          </button>
          <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="w-7 h-7 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center"
          >
            +
          </button>
          <div className="w-px h-5 bg-[var(--color-border-subtle)] mx-1" />
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 transition-colors"
            title="PDF로 저장"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center p-6 print:p-0">
        <div
          className="print:!scale-100"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <ResumePreview doc={doc} />
        </div>
      </div>
    </div>
  );
}
