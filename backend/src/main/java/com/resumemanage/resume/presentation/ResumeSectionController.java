package com.resumemanage.resume.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.resume.application.section.*;
import com.resumemanage.resume.dto.section.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes/{resumeId}")
@RequiredArgsConstructor
public class ResumeSectionController {

    private final ResumeBasicInfoService basicInfoService;
    private final ResumeEducationService educationService;
    private final ResumeCareerService careerService;
    private final ResumeLanguageService languageService;
    private final ResumeCertificateService certificateService;
    private final ResumeAwardService awardService;
    private final ResumeTrainingService trainingService;
    private final ResumeCoverLetterService coverLetterService;
    private final ResumeCoverLetterSectionService coverLetterSectionService;

    // ── BasicInfo (1:1 upsert) ──────────────────────────────────────

    @GetMapping("/basic-info")
    public ApiResponse<ResumeBasicInfoResponse> getBasicInfo(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(basicInfoService.get(resumeId, currentUser.userId()));
    }

    @PutMapping("/basic-info")
    public ApiResponse<Void> upsertBasicInfo(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeBasicInfoRequest request
    ) {
        basicInfoService.upsert(resumeId, currentUser.userId(), request);
        return ApiResponse.ok();
    }

    // ── Education ───────────────────────────────────────────────────

    @GetMapping("/educations")
    public ApiResponse<List<ResumeEducationResponse>> listEducations(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(educationService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/educations")
    public ApiResponse<Map<String, Long>> createEducation(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeEducationRequest request
    ) {
        Long id = educationService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/educations/{sectionId}")
    public ApiResponse<Void> updateEducation(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeEducationRequest request
    ) {
        educationService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/educations/{sectionId}")
    public ApiResponse<Void> deleteEducation(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        educationService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }

    // ── Career ──────────────────────────────────────────────────────

    @GetMapping("/careers")
    public ApiResponse<List<ResumeCareerResponse>> listCareers(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(careerService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/careers")
    public ApiResponse<Map<String, Long>> createCareer(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeCareerRequest request
    ) {
        Long id = careerService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/careers/{sectionId}")
    public ApiResponse<Void> updateCareer(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeCareerRequest request
    ) {
        careerService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/careers/{sectionId}")
    public ApiResponse<Void> deleteCareer(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        careerService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }

    // ── Language ─────────────────────────────────────────────────────

    @GetMapping("/languages")
    public ApiResponse<List<ResumeLanguageResponse>> listLanguages(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(languageService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/languages")
    public ApiResponse<Map<String, Long>> createLanguage(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeLanguageRequest request
    ) {
        Long id = languageService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/languages/{sectionId}")
    public ApiResponse<Void> updateLanguage(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeLanguageRequest request
    ) {
        languageService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/languages/{sectionId}")
    public ApiResponse<Void> deleteLanguage(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        languageService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }

    // ── Certificate ─────────────────────────────────────────────────

    @GetMapping("/certificates")
    public ApiResponse<List<ResumeCertificateResponse>> listCertificates(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(certificateService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/certificates")
    public ApiResponse<Map<String, Long>> createCertificate(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeCertificateRequest request
    ) {
        Long id = certificateService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/certificates/{sectionId}")
    public ApiResponse<Void> updateCertificate(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeCertificateRequest request
    ) {
        certificateService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/certificates/{sectionId}")
    public ApiResponse<Void> deleteCertificate(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        certificateService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }

    // ── Award ───────────────────────────────────────────────────────

    @GetMapping("/awards")
    public ApiResponse<List<ResumeAwardResponse>> listAwards(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(awardService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/awards")
    public ApiResponse<Map<String, Long>> createAward(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeAwardRequest request
    ) {
        Long id = awardService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/awards/{sectionId}")
    public ApiResponse<Void> updateAward(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeAwardRequest request
    ) {
        awardService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/awards/{sectionId}")
    public ApiResponse<Void> deleteAward(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        awardService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }

    // ── Training ────────────────────────────────────────────────────

    @GetMapping("/trainings")
    public ApiResponse<List<ResumeTrainingResponse>> listTrainings(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(trainingService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/trainings")
    public ApiResponse<Map<String, Long>> createTraining(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeTrainingRequest request
    ) {
        Long id = trainingService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/trainings/{sectionId}")
    public ApiResponse<Void> updateTraining(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeTrainingRequest request
    ) {
        trainingService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/trainings/{sectionId}")
    public ApiResponse<Void> deleteTraining(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        trainingService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }

    // ── CoverLetter (1:1 upsert) ───────────────────────────────────

    @GetMapping("/cover-letter")
    public ApiResponse<ResumeCoverLetterResponse> getCoverLetter(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(coverLetterService.get(resumeId, currentUser.userId()));
    }

    @PutMapping("/cover-letter")
    public ApiResponse<Void> upsertCoverLetter(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeCoverLetterRequest request
    ) {
        coverLetterService.upsert(resumeId, currentUser.userId(), request);
        return ApiResponse.ok();
    }

    // ── CoverLetterSection ──────────────────────────────────────────

    @GetMapping("/cover-letter/sections")
    public ApiResponse<List<ResumeCoverLetterSectionResponse>> listCoverLetterSections(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId
    ) {
        return ApiResponse.ok(coverLetterSectionService.list(resumeId, currentUser.userId()));
    }

    @PostMapping("/cover-letter/sections")
    public ApiResponse<Map<String, Long>> createCoverLetterSection(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeCoverLetterSectionRequest request
    ) {
        Long id = coverLetterSectionService.create(resumeId, currentUser.userId(), request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/cover-letter/sections/{sectionId}")
    public ApiResponse<Void> updateCoverLetterSection(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId,
            @Valid @RequestBody ResumeCoverLetterSectionRequest request
    ) {
        coverLetterSectionService.update(resumeId, currentUser.userId(), sectionId, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/cover-letter/sections/{sectionId}")
    public ApiResponse<Void> deleteCoverLetterSection(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long resumeId,
            @PathVariable Long sectionId
    ) {
        coverLetterSectionService.delete(resumeId, currentUser.userId(), sectionId);
        return ApiResponse.ok();
    }
}
