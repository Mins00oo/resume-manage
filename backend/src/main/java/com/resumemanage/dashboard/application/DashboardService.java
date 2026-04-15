package com.resumemanage.dashboard.application;

import com.resumemanage.dashboard.dto.DashboardSummaryResponse;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.ActivityGrassPointDto;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.DeadlineDto;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.MasterResumeDto;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.PassRateDto;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.PassRatesDto;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.PeriodDto;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse.SummaryStripDto;
import com.resumemanage.dashboard.dto.PassRateDetailsResponse;
import com.resumemanage.dashboard.dto.PassRateDetailsResponse.PassRateItemDto;
import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;
import com.resumemanage.jobapply.repository.JobApplyRepository;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * 서류 단계를 통과한 것으로 볼 상태들.
     * (document stage passed = DOCUMENT_PASSED 이후 단계 어디든 도달)
     */
    private static final Set<JobApplyStatus> DOCUMENT_PASSED_STATES = EnumSet.of(
            JobApplyStatus.DOCUMENT_PASSED,
            JobApplyStatus.CODING_IN_PROGRESS,
            JobApplyStatus.CODING_PASSED,
            JobApplyStatus.CODING_FAILED,
            JobApplyStatus.ASSIGNMENT_IN_PROGRESS,
            JobApplyStatus.ASSIGNMENT_PASSED,
            JobApplyStatus.ASSIGNMENT_FAILED,
            JobApplyStatus.INTERVIEW_IN_PROGRESS,
            JobApplyStatus.INTERVIEW_PASSED,
            JobApplyStatus.INTERVIEW_FAILED,
            JobApplyStatus.FINAL_ACCEPTED,
            JobApplyStatus.FINAL_REJECTED
    );

    /**
     * 면접 단계를 통과한 것으로 볼 상태들.
     */
    private static final Set<JobApplyStatus> INTERVIEW_PASSED_STATES = EnumSet.of(
            JobApplyStatus.INTERVIEW_PASSED,
            JobApplyStatus.FINAL_ACCEPTED,
            JobApplyStatus.FINAL_REJECTED
    );

    private final JobApplyRepository jobApplyRepository;
    private final ResumeRepository resumeRepository;

    public DashboardSummaryResponse getSummary(
            Long userId,
            String period,
            LocalDate customFrom,
            LocalDate customTo
    ) {
        PeriodWindow window = resolvePeriod(period, customFrom, customTo);
        LocalDate today = LocalDate.now();

        // Master resume
        MasterResumeDto masterResumeDto = resumeRepository
                .findByUserIdAndIsMasterTrueAndDeletedAtIsNull(userId)
                .map(this::toMasterResumeDto)
                .orElse(null);

        // All non-deleted job applies for this user
        List<JobApply> all = jobApplyRepository.findAllByUserIdAndDeletedAtIsNull(userId);

        // Upcoming deadlines: within 7 days from today, non-terminal
        List<DeadlineDto> upcomingDeadlines = jobApplyRepository
                .findAllByUserIdAndDeadlineBetweenAndDeletedAtIsNull(userId, today, today.plusDays(7))
                .stream()
                .filter(ja -> !ja.getCurrentStatus().isTerminal())
                .sorted(Comparator.comparing(JobApply::getDeadline))
                .limit(10)
                .map(ja -> new DeadlineDto(
                        ja.getId(),
                        ja.getCompany(),
                        ja.getPosition(),
                        ja.getDeadline().format(DATE_FMT),
                        ChronoUnit.DAYS.between(today, ja.getDeadline())
                ))
                .toList();

        // Summary strip
        SummaryStripDto summaryStrip = buildSummaryStrip(all, window);

        // Applies whose submittedAt falls within the period window
        List<JobApply> submittedInWindow = all.stream()
                .filter(ja -> ja.getSubmittedAt() != null)
                .filter(ja -> inWindow(ja.getSubmittedAt(), window))
                .toList();

        // Pass rates
        PassRatesDto passRates = buildPassRates(submittedInWindow);

        // Activity grass
        List<ActivityGrassPointDto> activityGrass = buildActivityGrass(submittedInWindow, window);

        PeriodDto periodDto = new PeriodDto(
                window.from().format(DATE_FMT),
                window.to().format(DATE_FMT)
        );

        return new DashboardSummaryResponse(
                periodDto,
                masterResumeDto,
                upcomingDeadlines,
                summaryStrip,
                passRates,
                activityGrass
        );
    }

    public PassRateDetailsResponse getPassRateDetails(
            Long userId,
            String stage,
            String period,
            LocalDate customFrom,
            LocalDate customTo
    ) {
        PeriodWindow window = resolvePeriod(period, customFrom, customTo);

        List<JobApply> submittedInWindow = jobApplyRepository
                .findAllByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .filter(ja -> ja.getSubmittedAt() != null)
                .filter(ja -> inWindow(ja.getSubmittedAt(), window))
                .toList();

        String normalizedStage = stage == null ? "" : stage.toLowerCase();

        List<JobApply> passed;
        List<JobApply> failed;

        switch (normalizedStage) {
            case "document" -> {
                passed = submittedInWindow.stream()
                        .filter(JobApply::isWentThroughDocument)
                        .filter(ja -> DOCUMENT_PASSED_STATES.contains(ja.getCurrentStatus()))
                        .toList();
                failed = submittedInWindow.stream()
                        .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.DOCUMENT_FAILED)
                        .toList();
            }
            case "interview" -> {
                passed = submittedInWindow.stream()
                        .filter(JobApply::isWentThroughInterview)
                        .filter(ja -> INTERVIEW_PASSED_STATES.contains(ja.getCurrentStatus()))
                        .toList();
                failed = submittedInWindow.stream()
                        .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.INTERVIEW_FAILED)
                        .toList();
            }
            case "final" -> {
                passed = submittedInWindow.stream()
                        .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.FINAL_ACCEPTED)
                        .toList();
                failed = submittedInWindow.stream()
                        .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.FINAL_REJECTED)
                        .toList();
            }
            default -> {
                passed = List.of();
                failed = List.of();
            }
        }

        return new PassRateDetailsResponse(
                normalizedStage.isBlank() ? stage : normalizedStage,
                passed.stream().map(this::toPassRateItem).toList(),
                failed.stream().map(this::toPassRateItem).toList()
        );
    }

    private PassRateItemDto toPassRateItem(JobApply ja) {
        return new PassRateItemDto(
                ja.getId(),
                ja.getCompany(),
                ja.getPosition(),
                ja.getSubmittedAt() != null ? ja.getSubmittedAt().format(DATE_FMT) : null
        );
    }

    private SummaryStripDto buildSummaryStrip(List<JobApply> all, PeriodWindow window) {
        long draft = 0;
        long submitted = 0;
        long inProgress = 0;
        long accepted = 0;
        long rejected = 0;

        for (JobApply ja : all) {
            JobApplyStatus s = ja.getCurrentStatus();
            if (s == JobApplyStatus.DRAFT) {
                draft++;
            }
            if (ja.getSubmittedAt() != null && inWindow(ja.getSubmittedAt(), window)) {
                submitted++;
            }
            if (ja.getSubmittedAt() != null && !s.isTerminal()) {
                inProgress++;
            }
            if (s == JobApplyStatus.FINAL_ACCEPTED) {
                accepted++;
            }
            if (s == JobApplyStatus.DOCUMENT_FAILED
                    || s == JobApplyStatus.CODING_FAILED
                    || s == JobApplyStatus.ASSIGNMENT_FAILED
                    || s == JobApplyStatus.INTERVIEW_FAILED
                    || s == JobApplyStatus.FINAL_REJECTED) {
                rejected++;
            }
        }
        return new SummaryStripDto(draft, submitted, inProgress, accepted, rejected);
    }

    private PassRatesDto buildPassRates(List<JobApply> submittedInWindow) {
        // Document
        long docPassed = submittedInWindow.stream()
                .filter(JobApply::isWentThroughDocument)
                .filter(ja -> DOCUMENT_PASSED_STATES.contains(ja.getCurrentStatus()))
                .count();
        long docFailed = submittedInWindow.stream()
                .filter(JobApply::isWentThroughDocument)
                .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.DOCUMENT_FAILED)
                .count();
        PassRateDto document = buildPassRate(docPassed, docPassed + docFailed);

        // Interview
        long intPassed = submittedInWindow.stream()
                .filter(JobApply::isWentThroughInterview)
                .filter(ja -> INTERVIEW_PASSED_STATES.contains(ja.getCurrentStatus()))
                .count();
        long intFailed = submittedInWindow.stream()
                .filter(JobApply::isWentThroughInterview)
                .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.INTERVIEW_FAILED)
                .count();
        PassRateDto interview = buildPassRate(intPassed, intPassed + intFailed);

        // Final: total = all with submittedAt in window
        long finalTotal = submittedInWindow.size();
        long finalPassed = submittedInWindow.stream()
                .filter(ja -> ja.getCurrentStatus() == JobApplyStatus.FINAL_ACCEPTED)
                .count();
        PassRateDto finalPR = buildPassRate(finalPassed, finalTotal);

        return new PassRatesDto(document, interview, finalPR);
    }

    private PassRateDto buildPassRate(long passed, long total) {
        double rate = total == 0 ? 0.0 : (double) passed / (double) total;
        return new PassRateDto(passed, total, rate);
    }

    private List<ActivityGrassPointDto> buildActivityGrass(
            List<JobApply> submittedInWindow,
            PeriodWindow window
    ) {
        Map<LocalDate, Long> counts = new HashMap<>();
        for (JobApply ja : submittedInWindow) {
            counts.merge(ja.getSubmittedAt(), 1L, Long::sum);
        }

        List<ActivityGrassPointDto> out = new ArrayList<>();
        LocalDate cursor = window.from();
        while (!cursor.isAfter(window.to())) {
            long c = counts.getOrDefault(cursor, 0L);
            out.add(new ActivityGrassPointDto(cursor.format(DATE_FMT), c));
            cursor = cursor.plusDays(1);
        }
        return out;
    }

    private MasterResumeDto toMasterResumeDto(Resume r) {
        return new MasterResumeDto(
                r.getId(),
                r.getTitle(),
                r.getCompletionRate(),
                r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null
        );
    }

    private boolean inWindow(LocalDate date, PeriodWindow window) {
        return !date.isBefore(window.from()) && !date.isAfter(window.to());
    }

    private PeriodWindow resolvePeriod(String period, LocalDate customFrom, LocalDate customTo) {
        LocalDate today = LocalDate.now();
        String p = period == null ? "3m" : period.toLowerCase();

        return switch (p) {
            case "1m" -> new PeriodWindow(today.minusDays(30), today);
            case "3m" -> new PeriodWindow(today.minusDays(90), today);
            case "6m" -> new PeriodWindow(today.minusDays(180), today);
            case "all" -> new PeriodWindow(today.minusYears(10), today);
            case "custom" -> {
                LocalDate from = customFrom != null ? customFrom : today.minusDays(90);
                LocalDate to = customTo != null ? customTo : today;
                yield new PeriodWindow(from, to);
            }
            default -> new PeriodWindow(today.minusDays(90), today);
        };
    }

    private record PeriodWindow(LocalDate from, LocalDate to) {
    }
}
