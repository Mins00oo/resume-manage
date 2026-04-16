package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

public record ResumeCoverLetterSectionRequest(
        @Size(max = 500) String question,
        String answer,
        Integer charLimit,
        short orderIndex
) {
}
