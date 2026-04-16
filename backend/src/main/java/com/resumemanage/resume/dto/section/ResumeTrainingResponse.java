package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.ResumeTraining;

import java.time.LocalDate;

public record ResumeTrainingResponse(
        Long id,
        String name,
        String institution,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        short orderIndex
) {
    public static ResumeTrainingResponse from(ResumeTraining entity) {
        return new ResumeTrainingResponse(
                entity.getId(),
                entity.getName(),
                entity.getInstitution(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getDescription(),
                entity.getOrderIndex()
        );
    }
}
