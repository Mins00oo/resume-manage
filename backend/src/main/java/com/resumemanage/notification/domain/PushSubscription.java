package com.resumemanage.notification.domain;

import com.resumemanage.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Web Push API 구독 정보. 마감 3일 전 푸시 알림 발송 시 사용.
 */
@Getter
@Entity
@Table(name = "push_subscriptions")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    private String endpoint;

    @Column(name = "p256dh_key", nullable = false, length = 255)
    private String p256dhKey;

    @Column(name = "auth_key", nullable = false, length = 255)
    private String authKey;

    @Column(name = "user_agent", length = 300)
    private String userAgent;

    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private PushSubscription(User user, String endpoint, String p256dhKey,
                             String authKey, String userAgent) {
        this.user = user;
        this.endpoint = endpoint;
        this.p256dhKey = p256dhKey;
        this.authKey = authKey;
        this.userAgent = userAgent;
        this.notificationsEnabled = true;
    }

    public void enable() {
        this.notificationsEnabled = true;
    }

    public void disable() {
        this.notificationsEnabled = false;
    }
}
