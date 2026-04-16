package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeCareerProjectRequest(
        @Size(max = 200) String title,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        short orderIndex
) {
}
