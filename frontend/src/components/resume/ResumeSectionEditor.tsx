import type { ResumeDocument, Experience, Project, Education, SkillGroup, Certification, Language } from '../../mocks/data';
import { IconPlus, IconTrash } from '../icons/Icons';

type SectionKey =
  | 'profile'
  | 'about'
  | 'experiences'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages';

type Props = {
  doc: ResumeDocument;
  setDoc: (doc: ResumeDocument) => void;
  section: SectionKey;
};

export default function ResumeSectionEditor({ doc, setDoc, section }: Props) {
  if (section === 'profile') return <ProfileEditor doc={doc} setDoc={setDoc} />;
  if (section === 'about') return <AboutEditor doc={doc} setDoc={setDoc} />;
  if (section === 'experiences') return <ExperienceEditor doc={doc} setDoc={setDoc} />;
  if (section === 'projects') return <ProjectEditor doc={doc} setDoc={setDoc} />;
  if (section === 'education') return <EducationEditor doc={doc} setDoc={setDoc} />;
  if (section === 'skills') return <SkillsEditor doc={doc} setDoc={setDoc} />;
  if (section === 'certifications') return <CertEditor doc={doc} setDoc={setDoc} />;
  if (section === 'languages') return <LangEditor doc={doc} setDoc={setDoc} />;
  return null;
}

/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  subtitle,
  onAdd,
}: {
  title: string;
  subtitle: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-[11.5px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {onAdd && (
        <button type="button" onClick={onAdd} className="btn-outline text-[11.5px] py-1.5 px-3">
          <IconPlus className="w-3.5 h-3.5" />
          추가
        </button>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {children}
    </label>
  );
}

function Card({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4 mb-3">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}

/* ---------- Profile ---------- */

function ProfileEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const p = doc.profile;
  const update = (patch: Partial<typeof p>) => setDoc({ ...doc, profile: { ...p, ...patch } });

  return (
    <div>
      <SectionHeader title="기본 정보" subtitle="이력서 최상단에 표시되는 정보예요" />
      <div className="space-y-4">
        <div>
          <Label>이름</Label>
          <input className="input-base" value={p.name} onChange={(e) => update({ name: e.target.value })} />
        </div>
        <div>
          <Label>한줄 소개</Label>
          <input
            className="input-base"
            value={p.headline}
            onChange={(e) => update({ headline: e.target.value })}
            placeholder="예: 프론트엔드 엔지니어 · React/TypeScript"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>이메일</Label>
            <input className="input-base" value={p.email} onChange={(e) => update({ email: e.target.value })} />
          </div>
          <div>
            <Label>전화번호</Label>
            <input className="input-base" value={p.phone} onChange={(e) => update({ phone: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>지역</Label>
          <input className="input-base" value={p.location} onChange={(e) => update({ location: e.target.value })} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>링크</Label>
            <button
              type="button"
              onClick={() =>
                update({ links: [...p.links, { label: 'New', url: '' }] })
              }
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + 링크 추가
            </button>
          </div>
          <div className="space-y-2">
            {p.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input-base w-28"
                  value={link.label}
                  onChange={(e) => {
                    const next = [...p.links];
                    next[i] = { ...link, label: e.target.value };
                    update({ links: next });
                  }}
                />
                <input
                  className="input-base flex-1"
                  value={link.url}
                  onChange={(e) => {
                    const next = [...p.links];
                    next[i] = { ...link, url: e.target.value };
                    update({ links: next });
                  }}
                />
                <button
                  type="button"
                  onClick={() => update({ links: p.links.filter((_, idx) => idx !== i) })}
                  className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- About ---------- */

function AboutEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  return (
    <div>
      <SectionHeader title="자기소개" subtitle="3~5줄로 본인을 간결하게 소개해보세요" />
      <textarea
        className="input-base min-h-[220px] resize-none leading-relaxed"
        value={doc.about}
        onChange={(e) => setDoc({ ...doc, about: e.target.value })}
        placeholder="어떤 문제를 푸는 데 흥미가 있고, 어떤 강점이 있는지 한 단락으로 적어보세요."
      />
      <div className="mt-2 text-[11px] text-slate-400 text-right">
        {doc.about.length} / 500자
      </div>
    </div>
  );
}

/* ---------- Experiences ---------- */

function ExperienceEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const add = () => {
    const n: Experience = {
      id: `exp${Date.now()}`,
      company: '',
      role: '',
      startDate: '',
      endDate: null,
      location: '',
      bullets: [''],
    };
    setDoc({ ...doc, experiences: [...doc.experiences, n] });
  };
  const update = (id: string, patch: Partial<Experience>) =>
    setDoc({
      ...doc,
      experiences: doc.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  const remove = (id: string) =>
    setDoc({ ...doc, experiences: doc.experiences.filter((e) => e.id !== id) });

  return (
    <div>
      <SectionHeader title="경력" subtitle="최근 경력부터 역순으로 작성해요" onAdd={add} />
      {doc.experiences.map((exp) => (
        <Card key={exp.id} onRemove={() => remove(exp.id)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>회사</Label>
              <input
                className="input-base"
                value={exp.company}
                onChange={(e) => update(exp.id, { company: e.target.value })}
              />
            </div>
            <div>
              <Label>직책</Label>
              <input
                className="input-base"
                value={exp.role}
                onChange={(e) => update(exp.id, { role: e.target.value })}
              />
            </div>
            <div>
              <Label>시작일</Label>
              <input
                className="input-base"
                placeholder="2022.03"
                value={exp.startDate}
                onChange={(e) => update(exp.id, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>종료일</Label>
              <input
                className="input-base"
                placeholder="재직 중은 비우기"
                value={exp.endDate ?? ''}
                onChange={(e) =>
                  update(exp.id, { endDate: e.target.value || null })
                }
              />
            </div>
          </div>
          <div className="mt-3">
            <Label>위치</Label>
            <input
              className="input-base"
              value={exp.location}
              onChange={(e) => update(exp.id, { location: e.target.value })}
            />
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label>주요 성과</Label>
              <button
                type="button"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                onClick={() =>
                  update(exp.id, { bullets: [...exp.bullets, ''] })
                }
              >
                + 항목 추가
              </button>
            </div>
            <div className="space-y-2">
              {exp.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-300 text-sm mt-2.5">•</span>
                  <input
                    className="input-base flex-1"
                    value={b}
                    onChange={(e) => {
                      const next = [...exp.bullets];
                      next[i] = e.target.value;
                      update(exp.id, { bullets: next });
                    }}
                    placeholder="숫자로 임팩트를 드러내면 좋아요"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(exp.id, {
                        bullets: exp.bullets.filter((_, idx) => idx !== i),
                      })
                    }
                    className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Projects ---------- */

function ProjectEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const add = () => {
    const n: Project = {
      id: `prj${Date.now()}`,
      name: '',
      role: '',
      period: '',
      description: '',
      bullets: [''],
      tech: [],
    };
    setDoc({ ...doc, projects: [...doc.projects, n] });
  };
  const update = (id: string, patch: Partial<Project>) =>
    setDoc({
      ...doc,
      projects: doc.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  const remove = (id: string) =>
    setDoc({ ...doc, projects: doc.projects.filter((p) => p.id !== id) });

  return (
    <div>
      <SectionHeader title="프로젝트" subtitle="인상적인 프로젝트를 3개 이내로" onAdd={add} />
      {doc.projects.map((prj) => (
        <Card key={prj.id} onRemove={() => remove(prj.id)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>프로젝트명</Label>
              <input
                className="input-base"
                value={prj.name}
                onChange={(e) => update(prj.id, { name: e.target.value })}
              />
            </div>
            <div>
              <Label>역할</Label>
              <input
                className="input-base"
                value={prj.role}
                onChange={(e) => update(prj.id, { role: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3">
            <Label>기간</Label>
            <input
              className="input-base"
              placeholder="2024.01 - 2024.12"
              value={prj.period}
              onChange={(e) => update(prj.id, { period: e.target.value })}
            />
          </div>
          <div className="mt-3">
            <Label>한줄 설명</Label>
            <input
              className="input-base"
              value={prj.description}
              onChange={(e) => update(prj.id, { description: e.target.value })}
            />
          </div>
          <div className="mt-3">
            <Label>기술 스택 (쉼표로 구분)</Label>
            <input
              className="input-base"
              value={prj.tech.join(', ')}
              onChange={(e) =>
                update(prj.id, {
                  tech: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label>주요 성과</Label>
              <button
                type="button"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                onClick={() => update(prj.id, { bullets: [...prj.bullets, ''] })}
              >
                + 항목 추가
              </button>
            </div>
            <div className="space-y-2">
              {prj.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-300 text-sm mt-2.5">•</span>
                  <input
                    className="input-base flex-1"
                    value={b}
                    onChange={(e) => {
                      const next = [...prj.bullets];
                      next[i] = e.target.value;
                      update(prj.id, { bullets: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(prj.id, {
                        bullets: prj.bullets.filter((_, idx) => idx !== i),
                      })
                    }
                    className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Education ---------- */

function EducationEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const add = () => {
    const n: Education = {
      id: `edu${Date.now()}`,
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
    };
    setDoc({ ...doc, education: [...doc.education, n] });
  };
  const update = (id: string, patch: Partial<Education>) =>
    setDoc({ ...doc, education: doc.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const remove = (id: string) =>
    setDoc({ ...doc, education: doc.education.filter((e) => e.id !== id) });

  return (
    <div>
      <SectionHeader title="학력" subtitle="최종 학력만 적어도 충분해요" onAdd={add} />
      {doc.education.map((ed) => (
        <Card key={ed.id} onRemove={() => remove(ed.id)}>
          <div>
            <Label>학교</Label>
            <input className="input-base" value={ed.school} onChange={(e) => update(ed.id, { school: e.target.value })} />
          </div>
          <div className="mt-3">
            <Label>전공 · 학위</Label>
            <input className="input-base" value={ed.degree} onChange={(e) => update(ed.id, { degree: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label>시작일</Label>
              <input className="input-base" value={ed.startDate} onChange={(e) => update(ed.id, { startDate: e.target.value })} />
            </div>
            <div>
              <Label>종료일</Label>
              <input className="input-base" value={ed.endDate} onChange={(e) => update(ed.id, { endDate: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <Label>비고 (GPA 등)</Label>
            <input
              className="input-base"
              value={ed.description ?? ''}
              onChange={(e) => update(ed.id, { description: e.target.value })}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Skills ---------- */

function SkillsEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const add = () => {
    const n: SkillGroup = { id: `sk${Date.now()}`, category: '', items: [] };
    setDoc({ ...doc, skills: [...doc.skills, n] });
  };
  const update = (id: string, patch: Partial<SkillGroup>) =>
    setDoc({ ...doc, skills: doc.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const remove = (id: string) =>
    setDoc({ ...doc, skills: doc.skills.filter((s) => s.id !== id) });

  return (
    <div>
      <SectionHeader title="기술 스택" subtitle="카테고리별로 그룹화해보세요" onAdd={add} />
      {doc.skills.map((group) => (
        <Card key={group.id} onRemove={() => remove(group.id)}>
          <div>
            <Label>카테고리</Label>
            <input
              className="input-base"
              value={group.category}
              onChange={(e) => update(group.id, { category: e.target.value })}
              placeholder="예: 프론트엔드"
            />
          </div>
          <div className="mt-3">
            <Label>스킬 (쉼표로 구분)</Label>
            <input
              className="input-base"
              value={group.items.join(', ')}
              onChange={(e) =>
                update(group.id, {
                  items: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="React, TypeScript, Next.js"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Certifications ---------- */

function CertEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const add = () => {
    const n: Certification = { id: `cert${Date.now()}`, name: '', issuer: '', issuedAt: '' };
    setDoc({ ...doc, certifications: [...doc.certifications, n] });
  };
  const update = (id: string, patch: Partial<Certification>) =>
    setDoc({
      ...doc,
      certifications: doc.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  const remove = (id: string) =>
    setDoc({ ...doc, certifications: doc.certifications.filter((c) => c.id !== id) });

  return (
    <div>
      <SectionHeader title="자격증" subtitle="관련 자격증을 간단히 기재" onAdd={add} />
      {doc.certifications.map((c) => (
        <Card key={c.id} onRemove={() => remove(c.id)}>
          <div>
            <Label>자격증명</Label>
            <input className="input-base" value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label>발급기관</Label>
              <input className="input-base" value={c.issuer} onChange={(e) => update(c.id, { issuer: e.target.value })} />
            </div>
            <div>
              <Label>취득일</Label>
              <input className="input-base" value={c.issuedAt} onChange={(e) => update(c.id, { issuedAt: e.target.value })} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Languages ---------- */

function LangEditor({ doc, setDoc }: { doc: ResumeDocument; setDoc: (d: ResumeDocument) => void }) {
  const add = () => {
    const n: Language = { id: `lan${Date.now()}`, name: '', level: '' };
    setDoc({ ...doc, languages: [...doc.languages, n] });
  };
  const update = (id: string, patch: Partial<Language>) =>
    setDoc({
      ...doc,
      languages: doc.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  const remove = (id: string) =>
    setDoc({ ...doc, languages: doc.languages.filter((l) => l.id !== id) });

  return (
    <div>
      <SectionHeader title="언어" subtitle="사용 가능한 언어와 수준" onAdd={add} />
      {doc.languages.map((l) => (
        <Card key={l.id} onRemove={() => remove(l.id)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>언어</Label>
              <input className="input-base" value={l.name} onChange={(e) => update(l.id, { name: e.target.value })} />
            </div>
            <div>
              <Label>레벨</Label>
              <input
                className="input-base"
                value={l.level}
                onChange={(e) => update(l.id, { level: e.target.value })}
                placeholder="예: Business"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
