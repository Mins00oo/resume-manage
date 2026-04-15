package com.resumemanage.jobapply.dto;

import com.resumemanage.jobapply.domain.JobApplyStatus;
import jakarta.validation.constraints.NotNull;

public record JobApplyTransitionRequest(
        @NotNull JobApplyStatus to
) {
}
