package com.resumemanage.common.security;

public record CurrentUser(
        Long userId,
        String email,
        String name
) {
}
