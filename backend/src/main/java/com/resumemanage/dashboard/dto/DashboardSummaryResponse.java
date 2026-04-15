package com.resumemanage.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DashboardSummaryResponse(
        PeriodDto period,
        MasterResumeDto masterResume,
        List<DeadlineDto> upcomingDeadlines,
        SummaryStripDto summaryStrip,
        PassRatesDto passRates,
        List<ActivityGrassPointDto> activityGrass
) {
    public record PeriodDto(
            String from,
            String to
    ) {
    }

    public record MasterResumeDto(
            Long id,
            String title,
            int completionRate,
            String updatedAt
    ) {
    }

    public record DeadlineDto(
            Long id,
            String company,
            String position,
            String deadline,
            long dDay
    ) {
    }

    public record SummaryStripDto(
            long draft,
            long submitted,
            long inProgress,
            long accepted,
            long rejected
    ) {
    }

    public record PassRateDto(
            long passed,
            long total,
            double rate
    ) {
    }

    public record PassRatesDto(
            PassRateDto document,
            PassRateDto interview,
            @JsonProperty("final") PassRateDto final_
    ) {
    }

    public record ActivityGrassPointDto(
            String date,
            long count
    ) {
    }
}
