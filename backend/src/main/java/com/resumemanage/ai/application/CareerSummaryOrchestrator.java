package com.resumemanage.ai.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumemanage.ai.application.clients.AiClient;
import com.resumemanage.ai.application.prompts.CriticPrompt;
import com.resumemanage.ai.application.prompts.DrafterPrompt;
import com.resumemanage.ai.application.prompts.RefinerPrompt;
import com.resumemanage.ai.config.AiProperties;
import com.resumemanage.ai.dto.CareerSummaryRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * S1 (Claude Opus 4.6) → S2 (GPT 5.4) → S3 (Gemini 2.5 Pro) 교차검증 파이프라인.
 * 각 단계 진행 상황을 SSE 이벤트로 프론트에 전달.
 *
 * 실패 정책:
 * - S1 실패  → 전체 에러
 * - S2 실패  → S1 bullets 만 반환 + 경고
 * - S3 실패  → S1 bullets 에서 HALLUCINATION 제외 (best-effort)
 */
@Slf4j
@Service
@EnableConfigurationProperties(AiProperties.class)
public class CareerSummaryOrchestrator {

    private final AiClient claude;
    private final AiClient openAi;
    private final AiClient google;
    private final AiProperties properties;
    private final ObjectMapper mapper = new ObjectMapper();

    // user id → (count, windowStartEpochSec)
    private final Map<Long, int[]> rateCounter = new ConcurrentHashMap<>();

    public CareerSummaryOrchestrator(
            @Qualifier("anthropicAiClient") AiClient claude,
            @Qualifier("openAiAiClient") AiClient openAi,
            @Qualifier("googleAiClient") AiClient google,
            AiProperties properties) {
        this.claude = claude;
        this.openAi = openAi;
        this.google = google;
        this.properties = properties;
    }

    /**
     * SSE 이벤트 스트림. 프론트는 이벤트 name 과 data(JSON) 로 상태를 해석.
     * name: phase | token | done | error
     */
    public Flux<SseEvent> run(Long userId, CareerSummaryRequest req) {
        if (!properties.isConfigured()) {
            return Flux.just(SseEvent.error("AI 기능은 관리자 설정이 필요해요."));
        }
        if (!acquire(userId)) {
            return Flux.just(SseEvent.error("요청이 너무 잦아요. 잠시 후 다시 시도해주세요."));
        }

        String rawText = req.rawText();
        String company = req.companyName();
        String position = req.position();
        String jd = req.jobDescription();

        return Flux.create(sink -> {
            // S1: Drafter
            sink.next(SseEvent.phase("draft", "claude"));
            claude.complete(DrafterPrompt.SYSTEM, DrafterPrompt.user(rawText, company, position, jd))
                    .subscribeOn(Schedulers.boundedElastic())
                    .subscribe(draft -> {
                        String draftJson = stripCodeFence(draft);
                        List<String> s1Bullets = extractBullets(draftJson);
                        List<String> missingQuantifications = extractStringArray(draftJson, "missing_quantification");
                        if (s1Bullets.isEmpty()) {
                            sink.next(SseEvent.error("초안 생성에 실패했어요. 원문을 조금 더 구체적으로 작성해보세요."));
                            sink.complete();
                            return;
                        }
                        sink.next(SseEvent.stageOutput("draft", draftJson));

                        // S2: Critic (JD 주입 — jd_alignment 계산에 필요)
                        sink.next(SseEvent.phase("critique", "gpt"));
                        openAi.complete(CriticPrompt.SYSTEM, CriticPrompt.user(rawText, draftJson, jd))
                                .subscribe(critique -> {
                                    String critiqueJson = stripCodeFence(critique);
                                    sink.next(SseEvent.stageOutput("critique", critiqueJson));

                                    // S3: Refiner
                                    sink.next(SseEvent.phase("refine", "gemini"));
                                    google.complete(RefinerPrompt.SYSTEM, RefinerPrompt.user(rawText, draftJson, critiqueJson))
                                            .subscribe(refined -> {
                                                String refinedJson = stripCodeFence(refined);
                                                sink.next(SseEvent.stageOutput("refine", refinedJson));
                                                List<String> finalBullets = extractBullets(refinedJson);
                                                if (finalBullets.isEmpty()) {
                                                    // S3 파싱 실패 → S1 fallback
                                                    List<String> fallback = fallbackFromCritique(s1Bullets, critiqueJson);
                                                    sink.next(SseEvent.done(
                                                            fallback,
                                                            List.of("정제 단계 JSON 파싱 실패 — 초안+비평 기반 fallback"),
                                                            true,
                                                            List.of("AI 정제 단계가 올바른 형식으로 응답하지 못했습니다. 원문을 더 구체적으로 작성한 뒤 다시 시도해주세요."),
                                                            missingQuantifications));
                                                } else {
                                                    List<String> reflection = extractReflection(refinedJson);
                                                    boolean needsUserInput = extractBoolean(refinedJson, "needs_user_input");
                                                    List<String> remainingGaps = extractStringArray(refinedJson, "remaining_gaps");
                                                    sink.next(SseEvent.done(finalBullets, reflection, needsUserInput, remainingGaps, missingQuantifications));
                                                }
                                                sink.complete();
                                            }, err -> {
                                                log.warn("S3 Refiner failed: {}", err.getMessage());
                                                List<String> fallback = fallbackFromCritique(s1Bullets, critiqueJson);
                                                sink.next(SseEvent.done(
                                                        fallback,
                                                        List.of("정제 단계 실패 — fallback"),
                                                        true,
                                                        List.of("정제 단계가 실패해 초안+비평 기반으로 처리했습니다."),
                                                        missingQuantifications));
                                                sink.complete();
                                            });
                                }, err -> {
                                    log.warn("S2 Critic failed: {}", err.getMessage());
                                    sink.next(SseEvent.done(
                                            s1Bullets,
                                            List.of("검증 단계 실패 — 초안 그대로 반환"),
                                            true,
                                            List.of("검증 단계가 실패했습니다. 결과는 초안 상태라 검증 없이 제공됩니다."),
                                            missingQuantifications));
                                    sink.complete();
                                });
                    }, err -> {
                        log.warn("S1 Drafter failed: {}", err.getMessage());
                        sink.next(SseEvent.error("초안 생성에 실패했어요."));
                        sink.complete();
                    });
        });
    }

    // ──────────── helpers ────────────

    private boolean acquire(Long userId) {
        AiProperties.RateLimit rl = properties.rateLimit();
        int limit = rl == null ? 3 : rl.perUserPerMinute();
        long nowMinute = Instant.now().getEpochSecond() / 60;
        int[] slot = rateCounter.compute(userId, (k, v) -> {
            if (v == null || v[1] != nowMinute) return new int[] { 0, (int) nowMinute };
            return v;
        });
        synchronized (slot) {
            if (slot[0] >= limit) return false;
            slot[0]++;
        }
        return true;
    }

    private String stripCodeFence(String raw) {
        if (raw == null) return "";
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }

    private List<String> extractBullets(String json) {
        List<String> out = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode bullets = root.path("bullets");
            if (bullets.isArray()) {
                for (JsonNode b : bullets) {
                    if (b.isTextual()) {
                        out.add(b.asText());
                    } else if (b.isObject()) {
                        String t = b.path("text").asText("");
                        if (!t.isBlank()) out.add(t);
                    }
                }
            }
        } catch (JsonProcessingException e) {
            log.warn("JSON parse failed: {}", e.getMessage());
        }
        return out;
    }

    private List<String> extractReflection(String json) {
        List<String> out = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode r = root.path("reflection");
            if (r.isArray()) {
                for (JsonNode n : r) out.add(n.asText());
            }
        } catch (JsonProcessingException ignore) { /* optional */ }
        return out;
    }

    /** 임의의 최상위 필드명으로 문자열 배열 추출 (missing_quantification, remaining_gaps 등). */
    private List<String> extractStringArray(String json, String field) {
        List<String> out = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode arr = root.path(field);
            if (arr.isArray()) {
                for (JsonNode n : arr) {
                    String s = n.asText("");
                    if (!s.isBlank()) out.add(s);
                }
            }
        } catch (JsonProcessingException ignore) { /* optional */ }
        return out;
    }

    private boolean extractBoolean(String json, String field) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode n = root.path(field);
            return n.asBoolean(false);
        } catch (JsonProcessingException e) {
            return false;
        }
    }

    /** S3 실패 시: S2 에서 HALLUCINATION 태그된 index 를 S1 bullets 에서 제거. */
    private List<String> fallbackFromCritique(List<String> s1Bullets, String critiqueJson) {
        try {
            JsonNode root = mapper.readTree(critiqueJson);
            JsonNode reviews = root.path("reviews");
            AtomicInteger kept = new AtomicInteger();
            List<String> result = new ArrayList<>();
            for (int i = 0; i < s1Bullets.size(); i++) {
                String tag = null;
                if (reviews.isArray()) {
                    for (JsonNode r : reviews) {
                        if (r.path("index").asInt(-1) == i) {
                            tag = r.path("tag").asText();
                            break;
                        }
                    }
                }
                if (!"HALLUCINATION".equals(tag)) {
                    result.add(s1Bullets.get(i));
                    kept.incrementAndGet();
                }
            }
            return result.isEmpty() ? s1Bullets : result;
        } catch (JsonProcessingException e) {
            return s1Bullets;
        }
    }

    // SSE 이벤트 표현
    public record SseEvent(String name, String jsonData) {
        public static SseEvent phase(String phase, String model) {
            return new SseEvent("phase", "{\"phase\":\"" + phase + "\",\"model\":\"" + model + "\"}");
        }

        public static SseEvent done(List<String> bullets, List<String> reflection) {
            return done(bullets, reflection, false, List.of(), List.of());
        }

        /**
         * 확장된 done 이벤트.
         * - needsUserInput: 원문 정보가 부족해 사용자에게 추가 입력을 요청해야 하는 상태
         * - remainingGaps: 어떤 정보가 더 있으면 결과가 나아지는지
         * - missingQuantifications: S1 단계에서 수집된 사용자 역질문 (수치 보강용)
         */
        public static SseEvent done(
                List<String> bullets,
                List<String> reflection,
                boolean needsUserInput,
                List<String> remainingGaps,
                List<String> missingQuantifications) {
            StringBuilder sb = new StringBuilder("{\"bullets\":[");
            appendJsonStringArray(sb, bullets);
            sb.append("],\"reflection\":[");
            appendJsonStringArray(sb, reflection);
            sb.append("],\"needsUserInput\":").append(needsUserInput);
            sb.append(",\"remainingGaps\":[");
            appendJsonStringArray(sb, remainingGaps);
            sb.append("],\"missingQuantifications\":[");
            appendJsonStringArray(sb, missingQuantifications);
            sb.append("]}");
            return new SseEvent("done", sb.toString());
        }

        private static void appendJsonStringArray(StringBuilder sb, List<String> items) {
            for (int i = 0; i < items.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append('\"').append(escape(items.get(i))).append('\"');
            }
        }

        public static SseEvent error(String message) {
            return new SseEvent("error", "{\"message\":\"" + escape(message) + "\"}");
        }

        /**
         * 각 단계가 끝난 뒤 해당 단계의 원본 JSON 을 프론트에 전달.
         * 프론트에서 <details> 로 접어볼 수 있도록 한다.
         */
        public static SseEvent stageOutput(String phase, String rawJson) {
            return new SseEvent(
                    "stage-output",
                    "{\"phase\":\"" + phase + "\",\"content\":\"" + escape(rawJson) + "\"}"
            );
        }

        private static String escape(String s) {
            if (s == null) return "";
            return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
        }
    }

    @SuppressWarnings("unused")
    private Mono<Void> noop() { return Mono.empty(); }
}
