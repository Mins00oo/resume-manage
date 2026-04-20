import { useEffect, useMemo, useRef, useState } from 'react';
import { streamCareerSummary, type AiPhase, type AiSummaryDone } from '../../lib/api/ai';
import { cn } from '../../lib/cn';

type Props = {
  rawText: string;
  companyName?: string;
  position?: string;
  onClose: () => void;
  onApply: (bullets: string[]) => void;
};

type PhaseState = 'pending' | 'running' | 'done';

// UI 에는 모델명을 노출하지 않는다. 사용자는 "어떤 단계에서 무슨 역할"만 알면 된다.
const PHASES: { key: AiPhase; label: string; description: string }[] = [
  { key: 'draft', label: '1단계 · 초안 작성', description: '원문을 분석해 핵심만 추려 초안을 만들어요' },
  { key: 'critique', label: '2단계 · 검증', description: '근거·구체성·과장 여부를 엄격히 점검해요' },
  { key: 'refine', label: '3단계 · 최종 정제', description: '중복·글자수·어투를 다듬어 최종본을 만들어요' },
];

type StageOutputs = Partial<Record<AiPhase, string>>;

export default function AiSummaryPanel({ rawText, companyName, position, onClose, onApply }: Props) {
  const [phase, setPhase] = useState<AiPhase | null>(null);
  const [result, setResult] = useState<AiSummaryDone | null>(null);
  const [stageOutputs, setStageOutputs] = useState<StageOutputs>({});
  const [error, setError] = useState<string | null>(null);
  const [jd, setJd] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  const bullets = result?.bullets ?? null;
  const reflection = result?.reflection ?? [];
  const needsUserInput = !!result?.needsUserInput;
  const remainingGaps = result?.remainingGaps ?? [];
  const missingQuantifications = result?.missingQuantifications ?? [];

  const startStream = (currentJd: string) => {
    return streamCareerSummary(
      { rawText, companyName, position, jobDescription: currentJd || undefined },
      {
        onPhase: (p) => setPhase(p),
        onStageOutput: (p, raw) => setStageOutputs((prev) => ({ ...prev, [p]: raw })),
        onDone: (d) => setResult(d),
        onError: (m) => setError(m),
      },
    );
  };

  useEffect(() => {
    if (!rawText.trim()) {
      setError('담당업무가 비어있어요. 먼저 원문을 작성해주세요.');
      return;
    }
    controllerRef.current = startStream('');
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rerun = (nextJd?: string) => {
    setError(null);
    setResult(null);
    setPhase(null);
    setStageOutputs({});
    controllerRef.current?.abort();
    controllerRef.current = startStream(nextJd ?? jd);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden />

      {/* panel */}
      <aside className="w-full max-w-md bg-[var(--color-bg-surface)] border-l border-[var(--color-border-subtle)] flex flex-col h-full animate-in slide-in-from-right">
        <header className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">AI 교차검증 요약</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] flex items-center justify-center"
            aria-label="닫기"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* progress — 각 단계별 접이식 */}
          <div className="space-y-2">
            {PHASES.map((p) => {
              let state: PhaseState;
              if (stageOutputs[p.key]) state = 'done';
              else if (phase === p.key) state = 'running';
              else {
                const order = PHASES.findIndex((x) => x.key === phase);
                const here = PHASES.findIndex((x) => x.key === p.key);
                state = order > here && order > -1 ? 'done' : 'pending';
              }
              const hasOutput = !!stageOutputs[p.key];
              return (
                <details
                  key={p.key}
                  className={cn(
                    'group/phase rounded-lg border transition-colors',
                    state === 'done' ? 'border-[var(--color-border-subtle)]' : 'border-transparent',
                  )}
                >
                  <summary className={cn(
                    'flex items-start gap-3 px-3 py-2.5 cursor-pointer list-none',
                    !hasOutput && 'cursor-default',
                  )}>
                    <StepIcon state={state} />
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        'text-[13px]',
                        state === 'done' && 'text-[var(--color-text-primary)] font-medium',
                        state === 'running' && 'text-indigo-600 dark:text-indigo-400 font-semibold',
                        state === 'pending' && 'text-[var(--color-text-tertiary)]',
                      )}>
                        {p.label}
                        {state === 'running' && ' …'}
                      </div>
                      <div className="text-[11.5px] text-[var(--color-text-tertiary)] leading-snug mt-0.5">
                        {p.description}
                      </div>
                    </div>
                    {hasOutput && (
                      <svg className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0 mt-1 transition-transform group-open/phase:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                      </svg>
                    )}
                  </summary>
                  {hasOutput && (
                    <div className="px-3 pb-3 pl-11">
                      <StageDetail phase={p.key} rawJson={stageOutputs[p.key]!} />
                    </div>
                  )}
                </details>
              );
            })}
          </div>

          {/* 지원 JD (선택 입력) — 접힘 기본 */}
          <details className="rounded-lg border border-[var(--color-border-subtle)]">
            <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-[var(--color-text-primary)]">지원 공고 (선택 입력)</div>
                <div className="text-[11.5px] text-[var(--color-text-tertiary)] leading-snug mt-0.5">
                  공고 본문이 있으면 직무 키워드를 반영해 bullet 이 더 정확해져요.
                </div>
              </div>
              <svg className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-3 pb-3 space-y-2">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value.slice(0, 4000))}
                placeholder="채용 공고 본문을 그대로 붙여넣어 주세요. (최대 4000자)"
                className="input-base w-full resize-y"
                style={{ minHeight: '120px' }}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{jd.length} / 4000</span>
                <button
                  type="button"
                  onClick={() => rerun()}
                  disabled={!jd.trim() && !result}
                  className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 disabled:opacity-40"
                >
                  JD 반영해 다시 요약
                </button>
              </div>
            </div>
          </details>

          {/* error */}
          {error && (
            <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4">
              <p className="text-[13px] text-rose-600 dark:text-rose-400">{error}</p>
              <button type="button" onClick={() => rerun()} className="mt-2 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400">
                다시 시도
              </button>
            </div>
          )}

          {/* needsUserInput + remainingGaps — 정보 부족 경고 */}
          {bullets && (needsUserInput || remainingGaps.length > 0) && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span className="text-[13px] font-semibold text-amber-700 dark:text-amber-400">원문 정보가 부족해요</span>
              </div>
              {remainingGaps.length > 0 && (
                <ul className="text-[12px] text-amber-800 dark:text-amber-300 leading-relaxed list-disc pl-4 space-y-1">
                  {remainingGaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              )}
              <p className="text-[11.5px] text-amber-700/80 dark:text-amber-400/80 leading-snug">
                원문을 더 구체적으로 보강하신 뒤 다시 시도하면 bullet 품질이 올라가요.
              </p>
            </div>
          )}

          {/* 역질문 — AI 가 사용자에게 추가로 물어볼 것 */}
          {bullets && missingQuantifications.length > 0 && (
            <div className="rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px]">💡</span>
                <span className="text-[13px] font-semibold text-indigo-700 dark:text-indigo-400">수치가 있으면 더 강해져요</span>
              </div>
              <ul className="text-[12px] text-indigo-800 dark:text-indigo-200 leading-relaxed list-disc pl-4 space-y-1">
                {missingQuantifications.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
              <p className="text-[11.5px] text-indigo-700/80 dark:text-indigo-300/80 leading-snug">
                위 질문에 답할 수치가 있다면 담당업무 원문에 추가해주세요. 다시 요약 시 반영됩니다.
              </p>
            </div>
          )}

          {/* final bullets — 이력서용 • 불릿 리스트 */}
          {bullets && bullets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--color-text-tertiary)]">최종 결과</h3>
              <div className="card p-4 space-y-2">
                {bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--color-text-primary)]">
                    <span className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-[1px] select-none">•</span>
                    <span className="min-w-0 flex-1">{b}</span>
                  </div>
                ))}
              </div>
              {reflection.length > 0 && (
                <details className="text-[12px] text-[var(--color-text-tertiary)]">
                  <summary className="cursor-pointer py-1">AI 편집 과정 보기</summary>
                  <ul className="mt-2 space-y-1 pl-4 list-disc">
                    {reflection.map((r, i) => (<li key={i}>{r}</li>))}
                  </ul>
                </details>
              )}
              <p className="text-[11.5px] text-[var(--color-text-tertiary)] leading-snug">
                기존 담당업무는 이 결과로 <strong>교체</strong>돼요. 마음에 안 들면 취소를 눌러주세요.
              </p>
            </div>
          )}
        </div>

        {bullets && bullets.length > 0 && !error && (
          <footer className="shrink-0 border-t border-[var(--color-border-subtle)] p-4 flex items-center gap-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline">취소</button>
            <button type="button" onClick={() => onApply(bullets)} className="flex-1 btn-primary">이 결과 적용</button>
          </footer>
        )}
      </aside>
    </div>
  );
}

function StepIcon({ state }: { state: PhaseState }) {
  if (state === 'done') {
    return (
      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (state === 'running') {
    return (
      <span className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0 mt-0.5" />
    );
  }
  return <span className="w-5 h-5 rounded-full border border-[var(--color-border-subtle)] shrink-0 mt-0.5" />;
}

/* ─── 단계별 원본 JSON 을 구조화해 보여주는 뷰 ────────────────────── */

function StageDetail({ phase, rawJson }: { phase: AiPhase; rawJson: string }) {
  const parsed = useMemo(() => {
    try { return JSON.parse(rawJson) as Record<string, unknown>; }
    catch { return null; }
  }, [rawJson]);

  if (!parsed) {
    return (
      <pre className="text-[11px] text-[var(--color-text-tertiary)] whitespace-pre-wrap break-words">
        {rawJson}
      </pre>
    );
  }

  if (phase === 'draft') return <DraftView data={parsed} />;
  if (phase === 'critique') return <CritiqueView data={parsed} />;
  if (phase === 'refine') return <RefineView data={parsed} />;
  return null;
}

type DraftBullet = { text?: string; evidence?: string };
function DraftView({ data }: { data: Record<string, unknown> }) {
  const bullets = Array.isArray(data.bullets) ? (data.bullets as DraftBullet[]) : [];
  const reasoning = typeof data.reasoning === 'string' ? data.reasoning : '';
  const missing = Array.isArray(data.missing_quantification) ? (data.missing_quantification as string[]) : [];
  return (
    <div className="space-y-2.5 text-[12px]">
      {bullets.map((b, i) => {
        const text = typeof b === 'string' ? b : (b?.text ?? '');
        const evidence = typeof b === 'string' ? '' : (b?.evidence ?? '');
        return (
          <div key={i} className="border-l-2 border-[var(--color-border-subtle)] pl-3">
            <div className="text-[var(--color-text-primary)] leading-snug">{text}</div>
            {evidence && (
              <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1 italic">
                원문 근거 — "{evidence}"
              </div>
            )}
          </div>
        );
      })}
      {missing.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1">AI 가 묻고 싶어하는 수치</div>
          <ul className="text-[11px] text-[var(--color-text-secondary)] list-disc pl-4 space-y-0.5">
            {missing.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
      {reasoning && (
        <div className="text-[11px] text-[var(--color-text-tertiary)] leading-snug pt-1 border-t border-[var(--color-border-subtle)]">
          {reasoning}
        </div>
      )}
    </div>
  );
}

type CritiqueTag = 'VERIFIED' | 'WEAK' | 'HALLUCINATION' | 'REDUNDANT' | 'SCOPE_UNCLEAR' | 'JARGON_HEAVY' | 'JD_MISALIGNED';
type Review = { index?: number; tag?: CritiqueTag | string; reason?: string; suggestion?: string };
type JdAlignment = {
  covered_keywords?: string[];
  missing_keywords?: string[];
  coverage_score?: number | null;
};

function CritiqueView({ data }: { data: Record<string, unknown> }) {
  const reviews = Array.isArray(data.reviews) ? (data.reviews as Review[]) : [];
  const overall = data.overall as { note?: string } | undefined;
  const jd = data.jd_alignment as JdAlignment | undefined;
  const covered = jd?.covered_keywords ?? [];
  const missing = jd?.missing_keywords ?? [];
  const score = typeof jd?.coverage_score === 'number' ? jd.coverage_score : null;
  const hasJd = covered.length > 0 || missing.length > 0 || score != null;

  const tagClass = (tag?: string) => {
    switch (tag) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'WEAK':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'HALLUCINATION':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
      case 'REDUNDANT':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300 border-slate-200 dark:border-slate-500/30';
      case 'SCOPE_UNCLEAR':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/30';
      case 'JARGON_HEAVY':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      case 'JD_MISALIGNED':
        return 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/30';
      default:
        return 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]';
    }
  };
  const tagLabel = (tag?: string) => {
    switch (tag) {
      case 'VERIFIED': return '확인';
      case 'WEAK': return '미흡';
      case 'HALLUCINATION': return '근거 없음';
      case 'REDUNDANT': return '중복';
      case 'SCOPE_UNCLEAR': return '기여 불명';
      case 'JARGON_HEAVY': return '전문 용어 과다';
      case 'JD_MISALIGNED': return 'JD 불일치';
      default: return tag ?? '-';
    }
  };

  return (
    <div className="space-y-3 text-[12px]">
      {/* JD 매칭도 요약 */}
      {hasJd && (
        <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-muted)] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">JD 매칭도</span>
            {score != null && (
              <span className={cn(
                'text-[11px] font-bold tabular-nums',
                score >= 0.7 && 'text-emerald-600 dark:text-emerald-400',
                score >= 0.4 && score < 0.7 && 'text-amber-600 dark:text-amber-400',
                score < 0.4 && 'text-rose-600 dark:text-rose-400',
              )}>
                {Math.round(score * 100)}%
              </span>
            )}
          </div>
          {covered.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {covered.map((k, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  ✓ {k}
                </span>
              ))}
            </div>
          )}
          {missing.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {missing.map((k, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                  ✗ {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 각 review */}
      {reviews.map((r, i) => (
        <div key={i} className="rounded-md border border-[var(--color-border-subtle)] p-2.5 space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border', tagClass(r.tag))}>
              {tagLabel(r.tag)}
            </span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">#{(r.index ?? i) + 1}</span>
          </div>
          {r.reason && <div className="text-[var(--color-text-primary)] leading-snug">{r.reason}</div>}
          {r.suggestion && (
            <div className="text-[11px] text-[var(--color-text-secondary)] leading-snug">
              → {r.suggestion}
            </div>
          )}
        </div>
      ))}
      {overall?.note && (
        <div className="text-[11px] text-[var(--color-text-tertiary)] leading-snug italic pt-1">
          {overall.note}
        </div>
      )}
    </div>
  );
}

function RefineView({ data }: { data: Record<string, unknown> }) {
  const bullets = Array.isArray(data.bullets) ? (data.bullets as string[]) : [];
  const reflection = Array.isArray(data.reflection) ? (data.reflection as string[]) : [];
  const needsUserInput = !!data.needs_user_input;
  const remainingGaps = Array.isArray(data.remaining_gaps) ? (data.remaining_gaps as string[]) : [];
  return (
    <div className="space-y-2 text-[12px]">
      <div className="card p-3 space-y-1.5">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-indigo-500 dark:text-indigo-400 shrink-0 select-none">•</span>
            <span className="text-[var(--color-text-primary)] leading-snug">{b}</span>
          </div>
        ))}
      </div>
      {needsUserInput && remainingGaps.length > 0 && (
        <div className="text-[11px] text-amber-700 dark:text-amber-400">
          <div className="font-semibold mb-1">남은 gap</div>
          <ul className="list-disc pl-4 space-y-0.5">
            {remainingGaps.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
      {reflection.length > 0 && (
        <ul className="space-y-0.5 pl-4 list-disc text-[11px] text-[var(--color-text-tertiary)]">
          {reflection.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}
    </div>
  );
}
