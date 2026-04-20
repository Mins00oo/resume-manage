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
 * GPT 5.4 클라이언트 (OpenAI Chat Completions API).
 * role: S2 Critic — JSON object response format 강제.
 */
@Slf4j
@Component("openAiAiClient")
public class OpenAiAiClient implements AiClient {

    private static final String BASE_URL = "https://api.openai.com/v1";

    private final AiProperties properties;
    private final WebClient webClient;

    public OpenAiAiClient(AiProperties properties, WebClient.Builder builder) {
        this.properties = properties;
        this.webClient = builder
                .baseUrl(BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public Mono<String> complete(String systemPrompt, String userMessage) {
        AiProperties.OpenAi cfg = properties.openai();
        if (cfg == null || cfg.apiKey() == null || cfg.apiKey().isBlank()) {
            return Mono.error(new IllegalStateException("OpenAI API key not configured"));
        }

        Map<String, Object> body = Map.of(
                "model", cfg.model(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.2
        );

        return webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + cfg.apiKey())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .map(this::extractText)
                .doOnError(e -> log.warn("OpenAI call failed: {}", e.getMessage()));
    }

    private String extractText(JsonNode res) {
        // { "choices": [ { "message": { "content": "..." } } ] }
        JsonNode choices = res.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            return choices.get(0).path("message").path("content").asText("");
        }
        log.warn("OpenAI unexpected response: {}", res.toString().substring(0, Math.min(500, res.toString().length())));
        return "";
    }
}
