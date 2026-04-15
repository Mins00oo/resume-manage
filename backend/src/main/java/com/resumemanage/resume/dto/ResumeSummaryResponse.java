package com.resumemanage.resume.dto;

import com.resumemanage.resume.domain.Resume;

import java.time.LocalDateTime;

public record ResumeSummaryResponse(
        Long id,
        String title,
        boolean isMaster,
        int completionRate,
        LocalDateTime updatedAt
) {
    public static ResumeSummaryResponse from(Resume resume) {
        return new ResumeSummaryResponse(
                resume.getId(),
                resume.getTitle(),
                resume.isMaster(),
                resume.getCompletionRate(),
                resume.getUpdatedAt()
        );
    }
}
