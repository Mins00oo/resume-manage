package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.ResumeAward;

import java.time.LocalDate;

public record ResumeAwardResponse(
        Long id,
        String title,
        String issuer,
        LocalDate awardedAt,
        String description,
        short orderIndex
) {
    public static ResumeAwardResponse from(ResumeAward entity) {
        return new ResumeAwardResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getIssuer(),
                entity.getAwardedAt(),
                entity.getDescription(),
                entity.getOrderIndex()
        );
    }
}
