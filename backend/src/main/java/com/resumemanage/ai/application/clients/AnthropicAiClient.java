package com.resumemanage.ai.application.clients;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * Claude Opus 4.6 클라이언트 (Anthropic Messages API).
 * role: S1 Drafter.
 */
@Slf4j
@Component("anthropicAiClient")
public class AnthropicAiClient implements AiClient {

    private static final String BASE_URL = "https://api.anthropic.com/v1";
    private static final String VERSION = "2023-06-01";

    private final AiProperties properties;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnthropicAiClient(AiProperties properties, WebClient.Builder builder) {
        this.properties = properties;
        this.webClient = builder
                .baseUrl(BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("anthropic-version", VERSION)
                .build();
    }

    @Override
    public Mono<String> complete(String systemPrompt, String userMessage) {
        AiProperties.Anthropic cfg = properties.anthropic();
        if (cfg == null || cfg.apiKey() == null || cfg.apiKey().isBlank()) {
            return Mono.error(new IllegalStateException("Anthropic API key not configured"));
        }

        Map<String, Object> body = Map.of(
                "model", cfg.model(),
                "max_tokens", 2048,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", userMessage))
        );

        return webClient.post()
                .uri("/messages")
                .header("x-api-key", cfg.apiKey())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .map(this::extractText)
                .doOnError(e -> log.warn("Anthropic call failed: {}", e.getMessage()));
    }

    private String extractText(JsonNode res) {
        // { "content": [ { "type": "text", "text": "..." } ] }
        JsonNode content = res.path("content");
        if (content.isArray() && !content.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode block : content) {
                if ("text".equals(block.path("type").asText())) {
                    sb.append(block.path("text").asText());
                }
            }
            return sb.toString();
        }
        log.warn("Anthropic unexpected response: {}", res.toString().substring(0, Math.min(500, res.toString().length())));
        return "";
    }

    @SuppressWarnings("unused")
    private ObjectMapper getObjectMapper() { return objectMapper; }
}
