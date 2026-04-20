package com.resumemanage.resume.application;

import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeCoverLetter;
import com.resumemanage.resume.dto.ResumeDetailResponse;
import com.resumemanage.resume.dto.section.*;
import com.resumemanage.resume.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * 이력서의 모든 섹션 데이터를 조합하여 상세 응답을 생성한다.
 */
@Component
@RequiredArgsConstructor
public class ResumeDetailAssembler {

    private final ResumeBasicInfoRepository basicInfoRepository;
    private final ResumeEducationRepository educationRepository;
    private final ResumeCareerRepository careerRepository;
    private final ResumeLanguageRepository languageRepository;
    private final ResumeCertificateRepository certificateRepository;
    private final ResumeAwardRepository awardRepository;
    private final ResumeTrainingRepository trainingRepository;
    private final ResumeCoverLetterRepository coverLetterRepository;
    private final ResumeCoverLetterSectionRepository coverLetterSectionRepository;

    public ResumeDetailResponse assemble(Resume resume) {
        Long resumeId = resume.getId();

        ResumeBasicInfoResponse basicInfo = basicInfoRepository.findById(resumeId)
                .map(ResumeBasicInfoResponse::from)
                .orElse(null);

        List<ResumeEducationResponse> educations = educationRepository
                .findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream().map(ResumeEducationResponse::from).toList();

        List<ResumeCareerResponse> careers = careerRepository
                .findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream().map(ResumeCareerResponse::from).toList();

        List<ResumeLanguageResponse> languages = languageRepository
                .findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream().map(ResumeLanguageResponse::from).toList();

        List<ResumeCertificateResponse> certificates = certificateRepository
                .findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream().map(ResumeCertificateResponse::from).toList();

        List<ResumeAwardResponse> awards = awardRepository
                .findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream().map(ResumeAwardResponse::from).toList();

        List<ResumeTrainingResponse> trainings = trainingRepository
                .findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream().map(ResumeTrainingResponse::from).toList();

        ResumeCoverLetter coverLetterEntity = coverLetterRepository.findById(resumeId).orElse(null);
        ResumeCoverLetterResponse coverLetter = coverLetterEntity != null
                ? ResumeCoverLetterResponse.from(coverLetterEntity) : null;

        List<ResumeCoverLetterSectionResponse> coverLetterSections = coverLetterEntity != null
                ? coverLetterSectionRepository
                    .findAllByCoverLetterResumeIdOrderByOrderIndexAsc(resumeId)
                    .stream().map(ResumeCoverLetterSectionResponse::from).toList()
                : Collections.emptyList();

        return new ResumeDetailResponse(
                resume.getId(),
                resume.getTitle(),
                resume.isMaster(),
                resume.getCompletionRate(),
                resume.getHiddenSections(),
                resume.getCreatedAt(),
                resume.getUpdatedAt(),
                basicInfo,
                educations,
                careers,
                languages,
                certificates,
                awards,
                trainings,
                coverLetter,
                coverLetterSections
        );
    }
}
