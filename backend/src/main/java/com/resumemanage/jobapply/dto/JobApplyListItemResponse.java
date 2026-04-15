package com.resumemanage.jobapply.dto;

import com.resumemanage.jobapply.domain.EmploymentType;
import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplyListItemResponse(
        Long id,
        String company,
        String position,
        JobApplyStatus currentStatus,
        EmploymentType employmentType,
        String channel,
        LocalDate deadline,
        LocalDate submittedAt,
        LocalDateTime updatedAt
) {
    public static JobApplyListItemResponse from(JobApply entity) {
        return new JobApplyListItemResponse(
                entity.getId(),
                entity.getCompany(),
                entity.getPosition(),
                entity.getCurrentStatus(),
                entity.getEmploymentType(),
                entity.getChannel(),
                entity.getDeadline(),
                entity.getSubmittedAt(),
                entity.getUpdatedAt()
        );
    }
}
