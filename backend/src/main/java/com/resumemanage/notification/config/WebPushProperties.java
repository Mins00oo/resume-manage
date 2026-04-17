package com.resumemanage.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * app.web-push.* 값 바인딩.
 * public-key, private-key 가 비어 있으면 푸시 발송은 skip.
 */
@ConfigurationProperties(prefix = "app.web-push")
public record WebPushProperties(String publicKey, String privateKey, String subject) {

    public boolean isConfigured() {
        return publicKey != null && !publicKey.isBlank()
                && privateKey != null && !privateKey.isBlank();
    }
}
