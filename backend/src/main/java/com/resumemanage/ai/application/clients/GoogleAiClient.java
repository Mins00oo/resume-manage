package com.resumemanage.ai.application.clients;

import com.fasterxml.jackson.databind.JsonNode;
import com.resumemanage.ai.config.AiProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Gemini 2.5 Pro 클라이언트 (Google AI Studio Generative Language REST API v1beta).
 * role: S3 Refiner — 원문·초안·비평 모두 컨텍스트에 넣고 최종 정제.
 */
@Slf4j
@Component("googleAiClient")
public class GoogleAiClient implements AiClient {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    private final AiProperties properties;
    private final WebClient webClient;

    public GoogleAiClient(AiProperties properties, WebClient.Builder builder) {
        this.properties = properties;
        this.webClient = builder
                .baseUrl(BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public Mono<String> complete(String systemPrompt, String userMessage) {
        AiProperties.Google cfg = properties.google();
        if (cfg == null || cfg.apiKey() == null || cfg.apiKey().isBlank()) {
            return Mono.error(new IllegalStateException("Google API key not configured"));
        }

        // Gemini REST: systemInstruction + contents(parts.text). responseMimeType=application/json 으로 JSON 강제.
        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userMessage))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/{model}:generateContent")
                        .queryParam("key", cfg.apiKey())
                        .build(cfg.model()))
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .map(this::extractText)
                .doOnError(e -> log.warn("Google call failed: {}", e.getMessage()));
    }

    private String extractText(JsonNode res) {
        // { "candidates": [ { "content": { "parts": [ { "text": "..." } ] } } ] }
        JsonNode candidates = res.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (JsonNode p : parts) sb.append(p.path("text").asText());
                return sb.toString();
            }
        }
        log.warn("Gemini unexpected response: {}", res.toString().substring(0, Math.min(500, res.toString().length())));
        return "";
    }
}
