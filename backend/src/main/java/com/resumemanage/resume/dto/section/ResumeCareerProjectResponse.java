package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.ResumeCareerProject;

import java.time.LocalDate;

public record ResumeCareerProjectResponse(
        Long id,
        String title,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        short orderIndex
) {
    public static ResumeCareerProjectResponse from(ResumeCareerProject entity) {
        return new ResumeCareerProjectResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getDescription(),
                entity.getOrderIndex()
        );
    }
}
