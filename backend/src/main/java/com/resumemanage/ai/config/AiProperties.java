package com.resumemanage.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * app.ai.* — Claude Opus 4.6, GPT 5.4, Gemini 2.5 Pro API 키 및 모델 id 바인딩.
 * 키가 비어있으면 관련 파이프라인은 503 으로 차단된다.
 */
@ConfigurationProperties(prefix = "app.ai")
public record AiProperties(
        Anthropic anthropic,
        OpenAi openai,
        Google google,
        RateLimit rateLimit
) {
    public record Anthropic(String apiKey, String model) {}
    public record OpenAi(String apiKey, String model) {}
    public record Google(String apiKey, String model) {}
    public record RateLimit(int perUserPerMinute, int maxRawTextChars) {}

    public boolean isConfigured() {
        return isSet(anthropic != null ? anthropic.apiKey() : null)
                && isSet(openai != null ? openai.apiKey() : null)
                && isSet(google != null ? google.apiKey() : null);
    }

    private static boolean isSet(String s) {
        return s != null && !s.isBlank();
    }
}
