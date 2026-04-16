package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeAwardRequest(
        @Size(max = 200) String title,
        @Size(max = 100) String issuer,
        LocalDate awardedAt,
        String description,
        short orderIndex
) {
}
