package com.resumemanage.jobapply.dto;

import com.resumemanage.jobapply.domain.EmploymentType;

import java.time.LocalDate;

public record JobApplyUpdateRequest(
        String company,
        String position,
        String jobPostingUrl,
        EmploymentType employmentType,
        String channel,
        LocalDate deadline,
        String memo
) {
}
