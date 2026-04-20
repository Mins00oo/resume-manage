package com.resumemanage.resume.application;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.resume.domain.*;
import com.resumemanage.resume.dto.ResumeCreateRequest;
import com.resumemanage.resume.dto.ResumeDetailResponse;
import com.resumemanage.resume.dto.ResumeSummaryResponse;
import com.resumemanage.resume.dto.ResumeUpdateRequest;
import com.resumemanage.resume.repository.*;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeDetailAssembler detailAssembler;

    // Section repositories for deep copy
    private final ResumeBasicInfoRepository basicInfoRepository;
    private final ResumeEducationRepository educationRepository;
    private final ResumeCareerRepository careerRepository;
    private final ResumeLanguageRepository languageRepository;
    private final ResumeCertificateRepository certificateRepository;
    private final ResumeAwardRepository awardRepository;
    private final ResumeTrainingRepository trainingRepository;
    private final ResumeCoverLetterRepository coverLetterRepository;
    private final ResumeCoverLetterSectionRepository coverLetterSectionRepository;

    public Long create(CurrentUser me, ResumeCreateRequest req) {
        User user = userRepository.findById(me.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Resume resume = Resume.builder()
                .user(user)
                .title(req.title())
                .build();

        return resumeRepository.save(resume).getId();
    }

    @Transactional(readOnly = true)
    public List<ResumeSummaryResponse> listMine(Long userId) {
        return resumeRepository
                .findAllByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId)
                .stream()
                .map(ResumeSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumeDetailResponse get(Long resumeId, Long userId) {
        Resume resume = loadOwned(resumeId, userId);
        return detailAssembler.assemble(resume);
    }

    public void updateTitle(Long resumeId, Long userId, ResumeUpdateRequest req) {
        Resume resume = loadOwned(resumeId, userId);
        resume.rename(req.title());
    }

    public void softDelete(Long resumeId, Long userId) {
        Resume resume = loadOwned(resumeId, userId);
        resume.softDelete();
    }

    public Long duplicate(Long resumeId, Long userId) {
        Resume original = loadOwned(resumeId, userId);

        final Resume copy = resumeRepository.save(Resume.builder()
                .user(original.getUser())
                .title(original.getTitle() + " (복사본)")
                .build());

        // Deep copy: BasicInfo
        basicInfoRepository.findById(resumeId).ifPresent(src -> {
            ResumeBasicInfo bi = ResumeBasicInfo.builder().resume(copy).build();
            bi.updateNames(src.getNameKo(), src.getNameEn());
            bi.updateContact(src.getEmail(), src.getPhone(), src.getAddress());
            bi.updatePersonal(src.getGender(), src.getBirthDate(), src.getShortIntro());
            bi.updateMilitaryAndPreferences(src.getMilitaryStatus(),
                    src.isDisabilityStatus(), src.isVeteranStatus());
            if (src.getProfileImageFile() != null) {
                bi.attachProfileImage(src.getProfileImageFile());
            }
            basicInfoRepository.save(bi);
        });

        // Deep copy: Educations
        for (ResumeEducation src : educationRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)) {
            educationRepository.save(ResumeEducation.builder()
                    .resume(copy)
                    .schoolName(src.getSchoolName())
                    .major(src.getMajor())
                    .degree(src.getDegree())
                    .startDate(src.getStartDate())
                    .endDate(src.getEndDate())
                    .graduationStatus(src.getGraduationStatus())
                    .gpa(src.getGpa())
                    .gpaMax(src.getGpaMax())
                    .orderIndex(src.getOrderIndex())
                    .build());
        }

        // Deep copy: Careers
        for (ResumeCareer srcCareer : careerRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)) {
            careerRepository.save(ResumeCareer.builder()
                    .resume(copy)
                    .companyName(srcCareer.getCompanyName())
                    .position(srcCareer.getPosition())
                    .department(srcCareer.getDepartment())
                    .startDate(srcCareer.getStartDate())
                    .endDate(srcCareer.getEndDate())
                    .isCurrent(srcCareer.isCurrent())
                    .employmentType(srcCareer.getEmploymentType())
                    .responsibilities(srcCareer.getResponsibilities())
                    .orderIndex(srcCareer.getOrderIndex())
                    .build());
        }

        // Deep copy: Languages
        for (ResumeLanguage src : languageRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)) {
            languageRepository.save(ResumeLanguage.builder()
                    .resume(copy)
                    .language(src.getLanguage())
                    .testName(src.getTestName())
                    .score(src.getScore())
                    .acquiredAt(src.getAcquiredAt())
                    .orderIndex(src.getOrderIndex())
                    .build());
        }

        // Deep copy: Certificates
        for (ResumeCertificate src : certificateRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)) {
            certificateRepository.save(ResumeCertificate.builder()
                    .resume(copy)
                    .name(src.getName())
                    .issuer(src.getIssuer())
                    .acquiredAt(src.getAcquiredAt())
                    .orderIndex(src.getOrderIndex())
                    .build());
        }

        // Deep copy: Awards
        for (ResumeAward src : awardRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)) {
            awardRepository.save(ResumeAward.builder()
                    .resume(copy)
                    .title(src.getTitle())
                    .issuer(src.getIssuer())
                    .awardedAt(src.getAwardedAt())
                    .description(src.getDescription())
                    .orderIndex(src.getOrderIndex())
                    .build());
        }

        // Deep copy: Trainings
        for (ResumeTraining src : trainingRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)) {
            trainingRepository.save(ResumeTraining.builder()
                    .resume(copy)
                    .name(src.getName())
                    .institution(src.getInstitution())
                    .startDate(src.getStartDate())
                    .endDate(src.getEndDate())
                    .description(src.getDescription())
                    .orderIndex(src.getOrderIndex())
                    .build());
        }

        // Deep copy: CoverLetter + CoverLetterSections
        coverLetterRepository.findById(resumeId).ifPresent(srcCl -> {
            ResumeCoverLetter newCl = coverLetterRepository.save(ResumeCoverLetter.builder()
                    .resume(copy)
                    .type(srcCl.getType())
                    .build());
            newCl.updateFreeText(srcCl.getFreeText());

            for (ResumeCoverLetterSection srcSec : coverLetterSectionRepository
                    .findAllByCoverLetterResumeIdOrderByOrderIndexAsc(resumeId)) {
                coverLetterSectionRepository.save(ResumeCoverLetterSection.builder()
                        .coverLetter(newCl)
                        .question(srcSec.getQuestion())
                        .answer(srcSec.getAnswer())
                        .charLimit(srcSec.getCharLimit())
                        .orderIndex(srcSec.getOrderIndex())
                        .build());
            }
        });

        return copy.getId();
    }

    public void setAsMaster(Long resumeId, Long userId) {
        Resume target = loadOwned(resumeId, userId);

        Optional<Resume> currentMaster =
                resumeRepository.findByUserIdAndIsMasterTrueAndDeletedAtIsNull(userId);
        currentMaster.ifPresent(existing -> {
            if (!existing.getId().equals(target.getId())) {
                existing.unmarkAsMaster();
            }
        });

        target.markAsMaster();
    }

    public void unsetMaster(Long resumeId, Long userId) {
        Resume resume = loadOwned(resumeId, userId);
        resume.unmarkAsMaster();
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository
                .findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
