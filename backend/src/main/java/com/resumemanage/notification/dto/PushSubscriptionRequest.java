package com.resumemanage.notification.dto;

import jakarta.validation.constraints.NotBlank;

public record PushSubscriptionRequest(
        @NotBlank String endpoint,
        @NotBlank String p256dhKey,
        @NotBlank String authKey,
        String userAgent
) {
}
