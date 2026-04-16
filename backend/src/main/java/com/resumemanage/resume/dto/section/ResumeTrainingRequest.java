package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeTrainingRequest(
        @Size(max = 200) String name,
        @Size(max = 100) String institution,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        short orderIndex
) {
}
