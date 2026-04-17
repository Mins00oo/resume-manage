package com.resumemanage.user.dto;

import com.resumemanage.user.domain.UserPreferences;

public record UserPreferencesResponse(
        String theme,
        boolean deadlineNotificationsEnabled,
        boolean interviewNotificationsEnabled,
        boolean googleCalendarSyncEnabled
) {
    public static UserPreferencesResponse from(UserPreferences p) {
        return new UserPreferencesResponse(
                p.getTheme(),
                p.isDeadlineNotificationsEnabled(),
                p.isInterviewNotificationsEnabled(),
                p.isGoogleCalendarSyncEnabled()
        );
    }
}
