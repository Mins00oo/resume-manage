package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.Degree;
import com.resumemanage.resume.domain.GraduationStatus;
import com.resumemanage.resume.domain.ResumeEducation;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResumeEducationResponse(
        Long id,
        String schoolName,
        String major,
        Degree degree,
        LocalDate startDate,
        LocalDate endDate,
        GraduationStatus graduationStatus,
        BigDecimal gpa,
        BigDecimal gpaMax,
        short orderIndex
) {
    public static ResumeEducationResponse from(ResumeEducation entity) {
        return new ResumeEducationResponse(
                entity.getId(),
                entity.getSchoolName(),
                entity.getMajor(),
                entity.getDegree(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getGraduationStatus(),
                entity.getGpa(),
                entity.getGpaMax(),
                entity.getOrderIndex()
        );
    }
}
