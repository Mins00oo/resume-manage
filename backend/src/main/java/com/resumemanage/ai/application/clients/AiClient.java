package com.resumemanage.ai.application.clients;

import reactor.core.publisher.Mono;

/**
 * 3개 LLM 공급자 공통 호출 인터페이스. 시스템 프롬프트 + 사용자 메시지를 받아
 * 모델 응답 문자열(보통 JSON 본문)을 반환한다.
 *
 * 스트리밍은 이번 단계에서는 완결 응답만 지원 — 프론트에는 단계(phase) 단위로
 * 진행 상황을 SSE 로 전송한다.
 */
public interface AiClient {

    /**
     * @return 모델이 반환한 본문 문자열 (공백·코드블록 stripping 전)
     */
    Mono<String> complete(String systemPrompt, String userMessage);
}
