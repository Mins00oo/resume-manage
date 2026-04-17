package com.resumemanage.user.domain;

import com.resumemanage.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자별 앱 설정. 알림/테마/캘린더 동기화 토글 저장.
 * User 와 1:1. user_id UNIQUE.
 */
@Getter
@Entity
@Table(name = "user_preferences")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserPreferences extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, length = 10)
    private String theme;

    @Column(name = "deadline_notifications_enabled", nullable = false)
    private boolean deadlineNotificationsEnabled;

    @Column(name = "interview_notifications_enabled", nullable = false)
    private boolean interviewNotificationsEnabled;

    @Column(name = "google_calendar_sync_enabled", nullable = false)
    private boolean googleCalendarSyncEnabled;

    @Builder
    private UserPreferences(Long userId) {
        this.userId = userId;
        this.theme = "system";
        this.deadlineNotificationsEnabled = true;
        this.interviewNotificationsEnabled = true;
        this.googleCalendarSyncEnabled = false;
    }

    public static UserPreferences defaultsFor(Long userId) {
        return UserPreferences.builder().userId(userId).build();
    }

    public void update(String theme,
                       Boolean deadlineNotificationsEnabled,
                       Boolean interviewNotificationsEnabled,
                       Boolean googleCalendarSyncEnabled) {
        if (theme != null) this.theme = theme;
        if (deadlineNotificationsEnabled != null) this.deadlineNotificationsEnabled = deadlineNotificationsEnabled;
        if (interviewNotificationsEnabled != null) this.interviewNotificationsEnabled = interviewNotificationsEnabled;
        if (googleCalendarSyncEnabled != null) this.googleCalendarSyncEnabled = googleCalendarSyncEnabled;
    }
}
