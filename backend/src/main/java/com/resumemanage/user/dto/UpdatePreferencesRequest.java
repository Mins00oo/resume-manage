package com.resumemanage.user.dto;

import jakarta.validation.constraints.Pattern;

/**
 * 부분 업데이트. 각 필드 null이면 변경하지 않음.
 */
public record UpdatePreferencesRequest(
        @Pattern(regexp = "light|dark|system", message = "theme must be light, dark, or system")
        String theme,
        Boolean deadlineNotificationsEnabled,
        Boolean interviewNotificationsEnabled,
        Boolean googleCalendarSyncEnabled
) {
}
