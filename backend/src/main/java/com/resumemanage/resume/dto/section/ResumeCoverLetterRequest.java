package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.CoverLetterType;
import jakarta.validation.constraints.NotNull;

public record ResumeCoverLetterRequest(
        @NotNull CoverLetterType type,
        String freeText
) {
}
