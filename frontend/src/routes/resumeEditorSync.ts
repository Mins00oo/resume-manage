/**
 * ResumeEditorPage 저장 헬퍼. 각 섹션별로 로컬 doc state 와 서버 상태를 비교해
 * create / update / delete 를 순서대로 수행한다.
 *
 * 로컬 item.id 규칙:
 *   - 숫자 문자열 & previous 에 있으면 → 서버 id, update
 *   - 그 외(Date.now() 로 만들어진 ad-hoc id) → 새 항목, create
 * previous 에 있는데 local 에 없는 항목 → delete
 */

import { resumeApi } from '../lib/api/resume';
import type { ResumeDocument, Experience, Education, Certification, Language } from '../mocks/data';
import type {
  CareerEmploymentType,
  ResumeCareer,
  ResumeEducation,
  ResumeCertificate,
  ResumeLanguage,
} from '../types/resume';

function parseServerId(localId: string): number | null {
  const n = Number(localId);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * MonthYearPicker 는 "YYYY-MM" 으로 저장하지만 서버 컬럼은 DATE (YYYY-MM-DD) 이다.
 * 저장 직전 일자(day)를 1로 붙여 LocalDate 파싱이 성공하게 변환한다.
 * 빈 문자열/null/undefined 는 null 로 그대로.
 */
export function toServerDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}$/.test(s)) return s + '-01';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s; // 알 수 없는 형식은 그대로 보냄 (서버가 거절하면 에러 노출)
}

/** 경력 diff 저장. 로컬 id → 서버 id 매핑을 반환 (프로젝트 저장 시 사용). */
export async function syncCareers(
  resumeId: number,
  local: Experience[],
  previous: ResumeCareer[],
  employmentTypes: Record<string, CareerEmploymentType | ''>,
): Promise<Record<string, number>> {
  const prevById = new Map(previous.map((c) => [c.id, c]));
  const keptServerIds = new Set<number>();
  const idMap: Record<string, number> = {};

  for (let i = 0; i < local.length; i++) {
    const exp = local[i];
    const body = {
      companyName: exp.company,
      position: exp.role,
      department: exp.location,
      startDate: toServerDate(exp.startDate),
      endDate: exp.endDate === null ? null : toServerDate(exp.endDate),
      isCurrent: exp.endDate === null,
      employmentType: (employmentTypes[exp.id] || null) as CareerEmploymentType | null,
      responsibilities: exp.bullets.filter(Boolean).join('\n'),
      orderIndex: i,
    };
    const serverId = parseServerId(exp.id);
    if (serverId != null && prevById.has(serverId)) {
      await resumeApi.updateCareer(resumeId, serverId, body);
      keptServerIds.add(serverId);
      idMap[exp.id] = serverId;
    } else {
      const created = await resumeApi.createCareer(resumeId, body);
      idMap[exp.id] = created.id;
    }
  }

  for (const c of previous) {
    if (!keptServerIds.has(c.id)) {
      await resumeApi.deleteCareer(resumeId, c.id);
    }
  }

  return idMap;
}

export async function syncEducations(
  resumeId: number,
  local: Education[],
  previous: ResumeEducation[],
): Promise<void> {
  const prevById = new Map(previous.map((e) => [e.id, e]));
  const kept = new Set<number>();

  for (let i = 0; i < local.length; i++) {
    const edu = local[i];
    const body = {
      schoolName: edu.school,
      major: edu.degree,
      degree: (edu.degreeType || null) as ResumeEducation['degree'],
      startDate: toServerDate(edu.startDate),
      endDate: toServerDate(edu.endDate),
      graduationStatus: (edu.graduationStatus || null) as ResumeEducation['graduationStatus'],
      orderIndex: i,
    };
    const serverId = parseServerId(edu.id);
    if (serverId != null && prevById.has(serverId)) {
      await resumeApi.updateEducation(resumeId, serverId, body);
      kept.add(serverId);
    } else {
      await resumeApi.createEducation(resumeId, body);
    }
  }

  for (const e of previous) {
    if (!kept.has(e.id)) await resumeApi.deleteEducation(resumeId, e.id);
  }
}

export async function syncCertificates(
  resumeId: number,
  local: Certification[],
  previous: ResumeCertificate[],
): Promise<void> {
  const prevById = new Map(previous.map((c) => [c.id, c]));
  const kept = new Set<number>();

  for (let i = 0; i < local.length; i++) {
    const cert = local[i];
    const body = {
      name: cert.name,
      issuer: cert.issuer,
      acquiredAt: toServerDate(cert.issuedAt),
      orderIndex: i,
    };
    const serverId = parseServerId(cert.id);
    if (serverId != null && prevById.has(serverId)) {
      await resumeApi.updateCertificate(resumeId, serverId, body);
      kept.add(serverId);
    } else {
      await resumeApi.createCertificate(resumeId, body);
    }
  }

  for (const c of previous) {
    if (!kept.has(c.id)) await resumeApi.deleteCertificate(resumeId, c.id);
  }
}

export async function syncLanguages(
  resumeId: number,
  local: Language[],
  previous: ResumeLanguage[],
): Promise<void> {
  const prevById = new Map(previous.map((l) => [l.id, l]));
  const kept = new Set<number>();

  for (let i = 0; i < local.length; i++) {
    const lang = local[i];
    // 로컬 level 필드는 "TOEIC 920 / Business" 같은 자유 문자열.
    // 서버는 language / testName / score 로 나뉘어 있는데, UI 제약상 한 필드로 합쳐진 상태.
    // 간단히 level 전체를 score 에 저장.
    const body = {
      language: lang.name,
      testName: '',
      score: lang.level,
      acquiredAt: null,
      orderIndex: i,
    };
    const serverId = parseServerId(lang.id);
    if (serverId != null && prevById.has(serverId)) {
      await resumeApi.updateLanguage(resumeId, serverId, body);
      kept.add(serverId);
    } else {
      await resumeApi.createLanguage(resumeId, body);
    }
  }

  for (const l of previous) {
    if (!kept.has(l.id)) await resumeApi.deleteLanguage(resumeId, l.id);
  }
}

// Re-export ResumeDocument for callers (no-op, for circular convenience)
export type { ResumeDocument };
