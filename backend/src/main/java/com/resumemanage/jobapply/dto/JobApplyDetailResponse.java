package com.resumemanage.jobapply.dto;

import com.resumemanage.jobapply.domain.EmploymentType;
import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplyDetailResponse(
        Long id,
        String company,
        String position,
        JobApplyStatus currentStatus,
        EmploymentType employmentType,
        String channel,
        LocalDate deadline,
        LocalDate submittedAt,
        LocalDateTime updatedAt,
        String jobPostingUrl,
        boolean wentThroughDocument,
        boolean wentThroughCoding,
        boolean wentThroughAssignment,
        boolean wentThroughInterview,
        String memo,
        LocalDateTime createdAt
) {
    public static JobApplyDetailResponse from(JobApply entity) {
        return new JobApplyDetailResponse(
                entity.getId(),
                entity.getCompany(),
                entity.getPosition(),
                entity.getCurrentStatus(),
                entity.getEmploymentType(),
                entity.getChannel(),
                entity.getDeadline(),
                entity.getSubmittedAt(),
                entity.getUpdatedAt(),
                entity.getJobPostingUrl(),
                entity.isWentThroughDocument(),
                entity.isWentThroughCoding(),
                entity.isWentThroughAssignment(),
                entity.isWentThroughInterview(),
                entity.getMemo(),
                entity.getCreatedAt()
        );
    }
}
