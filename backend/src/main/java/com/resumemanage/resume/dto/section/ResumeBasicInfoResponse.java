package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.Gender;
import com.resumemanage.resume.domain.MilitaryStatus;
import com.resumemanage.resume.domain.ResumeBasicInfo;

import java.time.LocalDate;

public record ResumeBasicInfoResponse(
        String nameKo,
        String nameEn,
        Gender gender,
        LocalDate birthDate,
        String email,
        String phone,
        String address,
        String addressDetail,
        String shortIntro,
        MilitaryStatus militaryStatus,
        boolean disabilityStatus,
        boolean veteranStatus,
        Long profileImageFileId,
        Long careerDescriptionFileId,
        Long portfolioFileId
) {
    public static ResumeBasicInfoResponse from(ResumeBasicInfo entity) {
        return new ResumeBasicInfoResponse(
                entity.getNameKo(),
                entity.getNameEn(),
                entity.getGender(),
                entity.getBirthDate(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getAddress(),
                entity.getAddressDetail(),
                entity.getShortIntro(),
                entity.getMilitaryStatus(),
                entity.isDisabilityStatus(),
                entity.isVeteranStatus(),
                entity.getProfileImageFile() != null ? entity.getProfileImageFile().getId() : null,
                entity.getCareerDescriptionFile() != null ? entity.getCareerDescriptionFile().getId() : null,
                entity.getPortfolioFile() != null ? entity.getPortfolioFile().getId() : null
        );
    }
}
