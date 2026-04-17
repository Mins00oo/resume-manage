package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.file.domain.UploadedFile;
import com.resumemanage.file.repository.UploadedFileRepository;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeBasicInfo;
import com.resumemanage.resume.dto.section.ResumeBasicInfoRequest;
import com.resumemanage.resume.dto.section.ResumeBasicInfoResponse;
import com.resumemanage.resume.repository.ResumeBasicInfoRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeBasicInfoService {

    private final ResumeRepository resumeRepository;
    private final ResumeBasicInfoRepository basicInfoRepository;
    private final UploadedFileRepository uploadedFileRepository;

    @Transactional(readOnly = true)
    public ResumeBasicInfoResponse get(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return basicInfoRepository.findById(resumeId)
                .map(ResumeBasicInfoResponse::from)
                .orElse(null);
    }

    public void upsert(Long resumeId, Long userId, ResumeBasicInfoRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeBasicInfo info = basicInfoRepository.findById(resumeId)
                .orElseGet(() -> basicInfoRepository.save(
                        ResumeBasicInfo.builder().resume(resume).build()
                ));

        info.updateNames(req.nameKo(), req.nameEn());
        info.updateContact(req.email(), req.phone(), req.address());
        info.updatePersonal(req.gender(), req.birthDate(), req.shortIntro());
        info.updateMilitaryAndPreferences(req.militaryStatus(), req.disabilityStatus(), req.veteranStatus());
        info.updateAddressDetail(req.addressDetail());

        // Profile image attachment
        if (req.profileImageFileId() != null) {
            UploadedFile file = uploadedFileRepository.findById(req.profileImageFileId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
            if (!file.getUser().getId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
            info.attachProfileImage(file);
        } else if (info.getProfileImageFile() != null) {
            info.detachProfileImage();
        }

        // Career description file attachment
        if (req.careerDescriptionFileId() != null) {
            UploadedFile file = uploadedFileRepository.findById(req.careerDescriptionFileId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
            if (!file.getUser().getId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
            info.attachCareerDescriptionFile(file);
        } else if (info.getCareerDescriptionFile() != null) {
            info.detachCareerDescriptionFile();
        }

        // Portfolio file attachment
        if (req.portfolioFileId() != null) {
            UploadedFile file = uploadedFileRepository.findById(req.portfolioFileId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
            if (!file.getUser().getId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
            info.attachPortfolioFile(file);
        } else if (info.getPortfolioFile() != null) {
            info.detachPortfolioFile();
        }
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
