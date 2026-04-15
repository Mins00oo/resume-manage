package com.resumemanage.resume.dto;

import com.resumemanage.resume.domain.Resume;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeDetailResponse(
        Long id,
        String title,
        boolean isMaster,
        int completionRate,
        List<String> hiddenSections,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ResumeDetailResponse from(Resume resume) {
        return new ResumeDetailResponse(
                resume.getId(),
                resume.getTitle(),
                resume.isMaster(),
                resume.getCompletionRate(),
                resume.getHiddenSections(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}
