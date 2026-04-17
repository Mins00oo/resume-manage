package com.resumemanage.notification.application;

import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;
import com.resumemanage.jobapply.repository.JobApplyRepository;
import com.resumemanage.user.domain.UserPreferences;
import com.resumemanage.user.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 마감 3일 전 이내 지원 내역을 모아 사용자별 Web Push 발송.
 * 매일 오전 9시 (Asia/Seoul) 실행.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineNotificationScheduler {

    private final JobApplyRepository jobApplyRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final WebPushService webPushService;

    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    @Transactional(readOnly = true)
    public void notifyUpcomingDeadlines() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysLater = today.plusDays(3);

        List<JobApply> upcoming = jobApplyRepository
                .findAllByDeadlineBetweenAndDeletedAtIsNull(today, threeDaysLater)
                .stream()
                .filter(j -> !j.getCurrentStatus().isTerminal())
                .filter(j -> j.getCurrentStatus() != JobApplyStatus.SUBMITTED)  // 이미 제출한 건 제외
                .toList();

        if (upcoming.isEmpty()) {
            log.debug("No upcoming deadlines to notify.");
            return;
        }

        Map<Long, List<JobApply>> byUser = upcoming.stream()
                .collect(Collectors.groupingBy(j -> j.getUser().getId()));

        for (Map.Entry<Long, List<JobApply>> entry : byUser.entrySet()) {
            Long userId = entry.getKey();
            List<JobApply> items = entry.getValue();

            UserPreferences prefs = preferencesRepository.findByUserId(userId).orElse(null);
            if (prefs != null && !prefs.isDeadlineNotificationsEnabled()) continue;

            String title = buildTitle(items, today);
            String body = buildBody(items);
            webPushService.sendToUser(userId, title, body, "/applies");
        }
    }

    private String buildTitle(List<JobApply> items, LocalDate today) {
        long soonestDays = items.stream()
                .mapToLong(j -> ChronoUnit.DAYS.between(today, j.getDeadline()))
                .min().orElse(3);
        if (soonestDays <= 0) return "오늘 마감! 지원 " + items.size() + "건";
        if (soonestDays == 1) return "내일 마감 지원 " + items.size() + "건";
        return soonestDays + "일 남은 지원 " + items.size() + "건";
    }

    private String buildBody(List<JobApply> items) {
        String preview = items.stream()
                .limit(3)
                .map(j -> j.getCompany() + (j.getPosition() != null ? " " + j.getPosition() : ""))
                .collect(Collectors.joining(", "));
        if (items.size() > 3) preview += " 외 " + (items.size() - 3) + "건";
        return preview;
    }
}
