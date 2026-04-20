package com.resumemanage.ai.presentation;

import com.resumemanage.ai.application.CareerSummaryOrchestrator;
import com.resumemanage.ai.application.CareerSummaryOrchestrator.SseEvent;
import com.resumemanage.ai.dto.CareerSummaryRequest;
import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Flux 를 SseEmitter 로 브리지한다.
 * - Flux 구독 결과를 SseEmitter 에 push
 * - 한 쪽이라도 종료되면 반대편 정리
 * - 클라이언트가 먼저 끊어도 조용히 Disposable dispose 로 LLM 호출 중단
 *
 * 이 방식이 {@code Flux<ServerSentEvent>} 직접 반환보다 Servlet 환경에서
 * 예외가 덜 발생한다 (AsyncRequestNotUsableException 억제).
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class CareerSummaryController {

    private static final long TIMEOUT_MS = TimeUnit.MINUTES.toMillis(3);

    private final CareerSummaryOrchestrator orchestrator;

    @PostMapping(value = "/career-summary", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter careerSummary(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody CareerSummaryRequest request) {
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);

        Disposable subscription = orchestrator.run(currentUser.userId(), request)
                .subscribe(
                        event -> safeSend(emitter, event),
                        err -> {
                            log.warn("Orchestrator error: {}", err.getMessage());
                            safeSend(emitter, SseEvent.error("AI 요약 중 오류가 발생했어요."));
                            emitter.complete();
                        },
                        emitter::complete
                );

        emitter.onCompletion(subscription::dispose);
        emitter.onTimeout(() -> {
            subscription.dispose();
            emitter.complete();
        });
        emitter.onError((t) -> subscription.dispose());

        return emitter;
    }

    private void safeSend(SseEmitter emitter, SseEvent event) {
        try {
            emitter.send(SseEmitter.event().name(event.name()).data(event.jsonData()));
        } catch (IOException e) {
            // 클라이언트가 이미 끊음 — 조용히 무시
            log.debug("SSE send skipped (client disconnected): {}", e.getMessage());
        } catch (IllegalStateException e) {
            // emitter 가 이미 complete 됨
            log.debug("SSE emitter already completed: {}", e.getMessage());
        }
    }
}
