package com.resumemanage.jobapply.dto;

import com.resumemanage.jobapply.domain.EmploymentType;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record JobApplyCreateRequest(
        @NotBlank String company,
        String position,
        String jobPostingUrl,
        EmploymentType employmentType,
        String channel,
        LocalDate deadline,
        String memo
) {
}
