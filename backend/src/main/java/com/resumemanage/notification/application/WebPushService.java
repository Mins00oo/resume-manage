package com.resumemanage.notification.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumemanage.notification.config.WebPushProperties;
import com.resumemanage.notification.domain.PushSubscription;
import com.resumemanage.notification.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;

/**
 * Web Push 발송. VAPID 키가 application.yml 에 설정돼 있어야 실제 발송됨.
 * 키 미설정 시 WARN 로그만 찍고 skip (로컬 개발 편의).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@EnableConfigurationProperties(WebPushProperties.class)
public class WebPushService {

    private final WebPushProperties properties;
    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private PushService pushService;

    @PostConstruct
    void init() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        if (!properties.isConfigured()) {
            log.warn("VAPID keys not configured — push notifications are disabled. "
                    + "Set APP_WEB_PUSH_PUBLIC_KEY / APP_WEB_PUSH_PRIVATE_KEY to enable.");
            return;
        }
        try {
            this.pushService = new PushService(properties.publicKey(), properties.privateKey(), properties.subject());
            log.info("WebPushService initialized.");
        } catch (Exception e) {
            log.error("Failed to initialize PushService", e);
        }
    }

    @Transactional
    public void sendToUser(Long userId, String title, String body, String url) {
        if (pushService == null) return;
        List<PushSubscription> subs = subscriptionRepository.findAllByUserIdAndNotificationsEnabledTrue(userId);
        if (subs.isEmpty()) return;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "body", body,
                    "url", url != null ? url : "/"
            ));
        } catch (Exception e) {
            log.error("Failed to serialize push payload", e);
            return;
        }

        for (PushSubscription sub : subs) {
            try {
                Subscription subscription = new Subscription(
                        sub.getEndpoint(),
                        new Subscription.Keys(sub.getP256dhKey(), sub.getAuthKey())
                );
                Notification notification = new Notification(subscription, payload);
                Future<HttpResponse> future = pushService.sendAsync(notification);
                HttpResponse response = future.get();
                int status = response.getStatusLine().getStatusCode();
                if (status == 404 || status == 410) {
                    // 구독 만료/취소 — 자동 삭제
                    log.info("Push subscription expired (status={}). Removing id={}", status, sub.getId());
                    subscriptionRepository.delete(sub);
                } else if (status >= 400) {
                    log.warn("Push send failed: userId={} status={}", userId, status);
                }
            } catch (Exception e) {
                log.warn("Push send error userId={} subId={} : {}", userId, sub.getId(), e.getMessage());
            }
        }
    }

    public String getPublicKey() {
        return properties.publicKey();
    }
}
