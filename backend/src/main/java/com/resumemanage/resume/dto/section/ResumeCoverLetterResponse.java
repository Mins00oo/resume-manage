package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.CoverLetterType;
import com.resumemanage.resume.domain.ResumeCoverLetter;

public record ResumeCoverLetterResponse(
        CoverLetterType type,
        String freeText
) {
    public static ResumeCoverLetterResponse from(ResumeCoverLetter entity) {
        return new ResumeCoverLetterResponse(
                entity.getType(),
                entity.getFreeText()
        );
    }
}
