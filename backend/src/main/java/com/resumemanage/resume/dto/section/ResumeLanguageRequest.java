package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeLanguageRequest(
        @Size(max = 50) String language,
        @Size(max = 50) String testName,
        @Size(max = 20) String score,
        LocalDate acquiredAt,
        short orderIndex
) {
}
