package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.ResumeLanguage;

import java.time.LocalDate;

public record ResumeLanguageResponse(
        Long id,
        String language,
        String testName,
        String score,
        LocalDate acquiredAt,
        short orderIndex
) {
    public static ResumeLanguageResponse from(ResumeLanguage entity) {
        return new ResumeLanguageResponse(
                entity.getId(),
                entity.getLanguage(),
                entity.getTestName(),
                entity.getScore(),
                entity.getAcquiredAt(),
                entity.getOrderIndex()
        );
    }
}
