/**
 * 경력 담당업무 AI 교차검증 요약 — SSE 스트림 구독.
 *
 * EventSource 는 Authorization 헤더를 설정할 수 없어서,
 * `fetch` + `ReadableStream` + 수동 SSE 파서로 처리한다.
 *
 * 주의: 서버가 done 이벤트를 보낸 직후 스트림을 닫으면 Spring 쪽이
 *       flush 중에 AsyncRequestNotUsableException 을 던지며 소켓을
 *       abrupt close 하는 케이스가 있다. 이 때 fetch reader 가
 *       'network error' 를 throw 하면서 성공한 결과를 덮어쓰는 문제가
 *       있었다. 여기서는 **done / error 가 한 번이라도 도착하면 그 이후
 *       발생하는 네트워크 예외는 모두 무시**한다.
 */

export type CareerSummaryRequest = {
  rawText: string;
  companyName?: string;
  position?: string;
  /** 지원 JD 전문 (선택). 있으면 S1/S3 가 bullet 선별·어휘에 반영. */
  jobDescription?: string;
};

export type AiPhase = 'draft' | 'critique' | 'refine';
export type AiModel = 'claude' | 'gpt' | 'gemini';

/** done 이벤트가 담아주는 추가 메타. */
export type AiSummaryDone = {
  bullets: string[];
  reflection: string[];
  /** 원문 정보가 부족해 사용자 추가 입력이 필요한 상태 */
  needsUserInput: boolean;
  /** 어떤 정보가 더 있으면 품질이 올라가는지 */
  remainingGaps: string[];
  /** S1 Drafter 가 수집한 사용자 역질문 (수치 보강용) */
  missingQuantifications: string[];
};

export type AiSummaryHandlers = {
  onPhase?: (phase: AiPhase, model: AiModel) => void;
  onStageOutput?: (phase: AiPhase, rawJson: string) => void;
  onDone?: (done: AiSummaryDone) => void;
  onError?: (message: string) => void;
};

/**
 * @returns AbortController — 호출부가 언마운트 시 abort() 로 취소 가능
 */
export function streamCareerSummary(
  req: CareerSummaryRequest,
  handlers: AiSummaryHandlers,
): AbortController {
  const controller = new AbortController();
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
  const token = localStorage.getItem('authToken');

  // 최종 이벤트(done 또는 error)가 이미 사용자에게 전달됐는지 여부.
  // true 가 되면 이후 스트림 종료 시 발생하는 네트워크 예외는 삼킨다.
  let finalized = false;

  const wrapped: AiSummaryHandlers = {
    onPhase: (p, m) => handlers.onPhase?.(p, m),
    onStageOutput: (p, raw) => handlers.onStageOutput?.(p, raw),
    onDone: (d) => {
      if (finalized) return;
      finalized = true;
      handlers.onDone?.(d);
      // 서버 쪽 뒷정리 flush 에서 나오는 IOException 을 미리 차단
      controller.abort();
    },
    onError: (m) => {
      if (finalized) return;
      finalized = true;
      handlers.onError?.(m);
      controller.abort();
    },
  };

  (async () => {
    try {
      const res = await fetch(`${baseUrl}/api/ai/career-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      if (!res.ok) {
        let msg = '요청 실패';
        try {
          const j = await res.json();
          msg = j?.error?.message ?? msg;
        } catch { /* ignore */ }
        wrapped.onError?.(msg);
        return;
      }
      if (!res.body) {
        wrapped.onError?.('스트림을 받을 수 없어요.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE: "event: name\ndata: {...}\n\n"  blocks
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          parseSseBlock(chunk, wrapped);
        }
      }
    } catch (err) {
      // 이미 done/error 로 종료됐거나 우리가 abort 했으면 네트워크 예외 무시
      if (finalized || controller.signal.aborted) return;
      wrapped.onError?.(err instanceof Error ? err.message : String(err));
    }
  })();

  return controller;
}

function parseSseBlock(chunk: string, h: AiSummaryHandlers) {
  let eventName = 'message';
  let dataBuf = '';
  for (const line of chunk.split('\n')) {
    if (line.startsWith('event:')) eventName = line.slice(6).trim();
    else if (line.startsWith('data:')) dataBuf += line.slice(5).trim();
  }
  if (!dataBuf) return;
  let json: unknown;
  try { json = JSON.parse(dataBuf); } catch { return; }

  switch (eventName) {
    case 'phase': {
      const d = json as { phase?: AiPhase; model?: AiModel };
      if (d.phase && d.model) h.onPhase?.(d.phase, d.model);
      break;
    }
    case 'stage-output': {
      const d = json as { phase?: AiPhase; content?: string };
      if (d.phase && d.content) h.onStageOutput?.(d.phase, d.content);
      break;
    }
    case 'done': {
      const d = json as {
        bullets?: string[];
        reflection?: string[];
        needsUserInput?: boolean;
        remainingGaps?: string[];
        missingQuantifications?: string[];
      };
      h.onDone?.({
        bullets: d.bullets ?? [],
        reflection: d.reflection ?? [],
        needsUserInput: !!d.needsUserInput,
        remainingGaps: d.remainingGaps ?? [],
        missingQuantifications: d.missingQuantifications ?? [],
      });
      break;
    }
    case 'error': {
      const d = json as { message?: string };
      h.onError?.(d.message ?? '알 수 없는 오류');
      break;
    }
  }
}
