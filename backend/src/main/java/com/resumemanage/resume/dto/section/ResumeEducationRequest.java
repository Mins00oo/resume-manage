package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.Degree;
import com.resumemanage.resume.domain.GraduationStatus;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResumeEducationRequest(
        @Size(max = 100) String schoolName,
        @Size(max = 100) String major,
        Degree degree,
        LocalDate startDate,
        LocalDate endDate,
        GraduationStatus graduationStatus,
        BigDecimal gpa,
        BigDecimal gpaMax,
        short orderIndex
) {
}
