package com.resumemanage.resume.dto.section;

import com.resumemanage.resume.domain.ResumeCoverLetterSection;

public record ResumeCoverLetterSectionResponse(
        Long id,
        String question,
        String answer,
        Integer charLimit,
        short orderIndex
) {
    public static ResumeCoverLetterSectionResponse from(ResumeCoverLetterSection entity) {
        return new ResumeCoverLetterSectionResponse(
                entity.getId(),
                entity.getQuestion(),
                entity.getAnswer(),
                entity.getCharLimit(),
                entity.getOrderIndex()
        );
    }
}
