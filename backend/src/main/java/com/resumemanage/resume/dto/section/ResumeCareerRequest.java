package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeCareerRequest(
        @Size(max = 100) String companyName,
        @Size(max = 100) String position,
        @Size(max = 100) String department,
        LocalDate startDate,
        LocalDate endDate,
        boolean isCurrent,
        String responsibilities,
        short orderIndex
) {
}
