package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.ResumeCertificate;

import java.time.LocalDate;

public record ResumeCertificateResponse(
        Long id,
        String name,
        String issuer,
        LocalDate acquiredAt,
        short orderIndex
) {
    public static ResumeCertificateResponse from(ResumeCertificate entity) {
        return new ResumeCertificateResponse(
                entity.getId(),
                entity.getName(),
                entity.getIssuer(),
                entity.getAcquiredAt(),
                entity.getOrderIndex()
        );
    }
}
