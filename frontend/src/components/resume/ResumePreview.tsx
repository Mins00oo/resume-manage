import type { ResumeDocument } from '../../mocks/data';

type Props = {
  doc: ResumeDocument;
};

/**
 * A4 live preview that updates as the editor state changes.
 * Three templates share the same DOM but swap a few classnames.
 */
export default function ResumePreview({ doc }: Props) {
  const accent = doc.accentColor;

  return (
    <div
      className="a4-preview text-slate-900"
      style={{
        padding: '18mm 16mm',
        fontFamily:
          doc.template === 'elegant' ? 'Georgia, serif' : 'Pretendard, Inter, system-ui, sans-serif',
        fontSize: '10pt',
      }}
    >
      {/* ---------- Header ---------- */}
      <header
        style={{
          borderBottom:
            doc.template === 'clean'
              ? `3px solid ${accent}`
              : doc.template === 'modern'
                ? `1px solid #e2e8f0`
                : `1px solid ${accent}40`,
          paddingBottom: '10pt',
          marginBottom: '14pt',
        }}
      >
        {doc.template === 'modern' && (
          <div
            style={{
              display: 'inline-block',
              padding: '2pt 8pt',
              backgroundColor: `${accent}15`,
              color: accent,
              fontSize: '7.5pt',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: '4pt',
              marginBottom: '6pt',
            }}
          >
            RESUME
          </div>
        )}
        <h1
          style={{
            fontSize: doc.template === 'elegant' ? '22pt' : '20pt',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: doc.template === 'elegant' ? accent : '#0f172a',
            lineHeight: 1.1,
          }}
        >
          {doc.profile.name || '이름을 입력하세요'}
        </h1>
        {doc.profile.headline && (
          <p
            style={{
              fontSize: '11pt',
              color: '#64748b',
              marginTop: '3pt',
              fontWeight: 500,
            }}
          >
            {doc.profile.headline}
          </p>
        )}

        {/* Contact line */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10pt',
            marginTop: '8pt',
            fontSize: '8.5pt',
            color: '#475569',
          }}
        >
          {doc.profile.email && <span>✉️ {doc.profile.email}</span>}
          {doc.profile.phone && <span>📞 {doc.profile.phone}</span>}
          {doc.profile.location && <span>📍 {doc.profile.location}</span>}
          {doc.profile.links.map((l) => (
            <span key={l.url}>
              <span style={{ color: accent, fontWeight: 600 }}>{l.label}</span>{' '}
              {l.url}
            </span>
          ))}
        </div>
      </header>

      {/* ---------- About ---------- */}
      {doc.about && (
        <Section title="자기소개" accent={accent} template={doc.template}>
          <p style={{ fontSize: '9.5pt', lineHeight: 1.55, color: '#334155' }}>
            {doc.about}
          </p>
        </Section>
      )}

      {/* ---------- Experience ---------- */}
      {doc.experiences.length > 0 && (
        <Section title="경력" accent={accent} template={doc.template}>
          {doc.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10pt' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '8pt',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '11pt' }}>
                  {exp.role}
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}> · {exp.company}</span>
                </div>
                <div style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {exp.startDate} – {exp.endDate ?? '현재'}
                </div>
              </div>
              {exp.location && (
                <div style={{ fontSize: '8pt', color: '#94a3b8', marginTop: '1pt' }}>
                  {exp.location}
                </div>
              )}
              <ul
                style={{
                  marginTop: '4pt',
                  paddingLeft: '12pt',
                  fontSize: '9pt',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                {exp.bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: '2pt' }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* ---------- Projects ---------- */}
      {doc.projects.length > 0 && (
        <Section title="프로젝트" accent={accent} template={doc.template}>
          {doc.projects.map((prj) => (
            <div key={prj.id} style={{ marginBottom: '10pt' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '8pt',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '11pt' }}>
                  {prj.name}
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}> · {prj.role}</span>
                </div>
                <div style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {prj.period}
                </div>
              </div>
              {prj.description && (
                <p style={{ fontSize: '9pt', color: '#475569', marginTop: '2pt', lineHeight: 1.5 }}>
                  {prj.description}
                </p>
              )}
              <ul
                style={{
                  marginTop: '3pt',
                  paddingLeft: '12pt',
                  fontSize: '9pt',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                {prj.bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: '2pt' }}>
                    {b}
                  </li>
                ))}
              </ul>
              {prj.tech.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4pt',
                    marginTop: '4pt',
                  }}
                >
                  {prj.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '1pt 6pt',
                        fontSize: '7.5pt',
                        fontWeight: 600,
                        color: accent,
                        backgroundColor: `${accent}12`,
                        borderRadius: '3pt',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ---------- Education ---------- */}
      {doc.education.length > 0 && (
        <Section title="학력" accent={accent} template={doc.template}>
          {doc.education.map((ed) => (
            <div key={ed.id} style={{ marginBottom: '6pt' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>{ed.school}</div>
                <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
                  {ed.startDate} – {ed.endDate}
                </div>
              </div>
              <div style={{ fontSize: '9pt', color: '#475569', marginTop: '1pt' }}>
                {ed.degree}
                {ed.description && (
                  <span style={{ color: '#94a3b8' }}> · {ed.description}</span>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ---------- Skills ---------- */}
      {doc.skills.length > 0 && (
        <Section title="기술 스택" accent={accent} template={doc.template}>
          <div>
            {doc.skills.map((group) => (
              <div key={group.id} style={{ marginBottom: '5pt', display: 'flex', gap: '8pt' }}>
                <div
                  style={{
                    width: '60pt',
                    fontWeight: 700,
                    fontSize: '9pt',
                    color: '#475569',
                    flexShrink: 0,
                  }}
                >
                  {group.category}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '9pt',
                    color: '#334155',
                    lineHeight: 1.6,
                  }}
                >
                  {group.items.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------- Certifications + Languages side by side ---------- */}
      {(doc.certifications.length > 0 || doc.languages.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14pt' }}>
          {doc.certifications.length > 0 && (
            <Section title="자격증" accent={accent} template={doc.template} compact>
              {doc.certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: '3pt', fontSize: '9pt' }}>
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  <span style={{ color: '#94a3b8' }}>
                    {' '}
                    · {c.issuer} · {c.issuedAt}
                  </span>
                </div>
              ))}
            </Section>
          )}
          {doc.languages.length > 0 && (
            <Section title="언어" accent={accent} template={doc.template} compact>
              {doc.languages.map((l) => (
                <div key={l.id} style={{ marginBottom: '3pt', fontSize: '9pt' }}>
                  <span style={{ fontWeight: 700 }}>{l.name}</span>
                  <span style={{ color: '#94a3b8' }}> · {l.level}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  template,
  compact,
  children,
}: {
  title: string;
  accent: string;
  template: 'clean' | 'modern' | 'elegant';
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: compact ? '6pt' : '14pt' }}>
      <h2
        style={{
          fontSize: template === 'elegant' ? '11pt' : '9pt',
          fontWeight: 800,
          letterSpacing: template === 'elegant' ? '0' : '0.1em',
          textTransform: template === 'elegant' ? 'none' : 'uppercase',
          color: template === 'elegant' ? accent : '#0f172a',
          marginBottom: '6pt',
          paddingBottom: template === 'clean' ? '3pt' : '0',
          borderBottom: template === 'clean' ? `1px solid #e2e8f0` : 'none',
        }}
      >
        {template === 'modern' && (
          <span
            style={{
              display: 'inline-block',
              width: '10pt',
              height: '2pt',
              backgroundColor: accent,
              marginRight: '6pt',
              verticalAlign: 'middle',
            }}
          />
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}
