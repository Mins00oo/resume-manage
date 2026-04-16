package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.Gender;
import com.resumemanage.resume.domain.MilitaryStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResumeBasicInfoRequest(
        @Size(max = 50) String nameKo,
        @Size(max = 100) String nameEn,
        Gender gender,
        LocalDate birthDate,
        @Email @Size(max = 255) String email,
        @Size(max = 20) String phone,
        @Size(max = 300) String address,
        @Size(max = 500) String shortIntro,
        MilitaryStatus militaryStatus,
        boolean disabilityStatus,
        boolean veteranStatus,
        Long profileImageFileId
) {
}
