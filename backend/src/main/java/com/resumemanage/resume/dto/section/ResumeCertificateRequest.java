package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeCertificateRequest(
        @Size(max = 100) String name,
        @Size(max = 100) String issuer,
        LocalDate acquiredAt,
        short orderIndex
) {
}
