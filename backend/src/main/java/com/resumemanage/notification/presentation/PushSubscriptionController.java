package com.resumemanage.notification.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.notification.application.WebPushService;
import com.resumemanage.notification.domain.PushSubscription;
import com.resumemanage.notification.dto.PushSubscriptionRequest;
import com.resumemanage.notification.dto.VapidKeyResponse;
import com.resumemanage.notification.repository.PushSubscriptionRepository;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final WebPushService webPushService;

    @GetMapping("/vapid-public-key")
    public ApiResponse<VapidKeyResponse> vapidPublicKey() {
        return ApiResponse.ok(new VapidKeyResponse(webPushService.getPublicKey()));
    }

    @PostMapping("/subscriptions")
    @Transactional
    public ApiResponse<Void> subscribe(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody PushSubscriptionRequest request) {
        if (currentUser == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        User user = userRepository.findById(currentUser.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        subscriptionRepository.findByEndpoint(request.endpoint())
                .ifPresentOrElse(
                        PushSubscription::enable,
                        () -> subscriptionRepository.save(PushSubscription.builder()
                                .user(user)
                                .endpoint(request.endpoint())
                                .p256dhKey(request.p256dhKey())
                                .authKey(request.authKey())
                                .userAgent(request.userAgent())
                                .build())
                );
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/subscriptions")
    @Transactional
    public ApiResponse<Void> unsubscribe(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam String endpoint) {
        if (currentUser == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        subscriptionRepository.findByEndpoint(endpoint)
                .ifPresent(subscriptionRepository::delete);
        return ApiResponse.ok(null);
    }
}
