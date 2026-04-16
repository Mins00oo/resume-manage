package com.resumemanage.resume.dto;

import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.dto.section.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record ResumeDetailResponse(
        Long id,
        String title,
        boolean isMaster,
        int completionRate,
        List<String> hiddenSections,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        ResumeBasicInfoResponse basicInfo,
        List<ResumeEducationResponse> educations,
        List<ResumeCareerWithProjectsResponse> careers,
        List<ResumeLanguageResponse> languages,
        List<ResumeCertificateResponse> certificates,
        List<ResumeAwardResponse> awards,
        List<ResumeTrainingResponse> trainings,
        ResumeCoverLetterResponse coverLetter,
        List<ResumeCoverLetterSectionResponse> coverLetterSections
) {
    /**
     * 메타데이터만으로 간단히 생성 (하위 호환용).
     * 전체 조립은 {@link com.resumemanage.resume.application.ResumeDetailAssembler} 사용.
     */
    public static ResumeDetailResponse from(Resume resume) {
        return new ResumeDetailResponse(
                resume.getId(),
                resume.getTitle(),
                resume.isMaster(),
                resume.getCompletionRate(),
                resume.getHiddenSections(),
                resume.getCreatedAt(),
                resume.getUpdatedAt(),
                null,
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                null,
                Collections.emptyList()
        );
    }
}
