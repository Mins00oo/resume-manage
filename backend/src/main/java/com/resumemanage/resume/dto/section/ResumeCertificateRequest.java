package com.resumemanage.resume.dto.section;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeCertificateRequest(
        @Size(max = 100) String name,
        @Size(max = 100) String issuer,
        LocalDate acquiredAt,
        @Size(max = 100) String certificateNumber,
        @Size(max = 50) String score,
        short orderIndex
) {
}
