package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.CareerEmploymentType;
import com.resumemanage.resume.domain.ResumeCareer;

import java.time.LocalDate;

public record ResumeCareerResponse(
        Long id,
        String companyName,
        String position,
        String department,
        LocalDate startDate,
        LocalDate endDate,
        boolean isCurrent,
        String responsibilities,
        CareerEmploymentType employmentType,
        short orderIndex
) {
    public static ResumeCareerResponse from(ResumeCareer entity) {
        return new ResumeCareerResponse(
                entity.getId(),
                entity.getCompanyName(),
                entity.getPosition(),
                entity.getDepartment(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.isCurrent(),
                entity.getResponsibilities(),
                entity.getEmploymentType(),
                entity.getOrderIndex()
        );
    }
}
