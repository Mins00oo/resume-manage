package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeCoverLetter;
import com.resumemanage.resume.domain.ResumeCoverLetterSection;
import com.resumemanage.resume.dto.section.ResumeCoverLetterSectionRequest;
import com.resumemanage.resume.dto.section.ResumeCoverLetterSectionResponse;
import com.resumemanage.resume.repository.ResumeCoverLetterRepository;
import com.resumemanage.resume.repository.ResumeCoverLetterSectionRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeCoverLetterSectionService {

    private final ResumeRepository resumeRepository;
    private final ResumeCoverLetterRepository coverLetterRepository;
    private final ResumeCoverLetterSectionRepository sectionRepository;

    @Transactional(readOnly = true)
    public List<ResumeCoverLetterSectionResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return sectionRepository.findAllByCoverLetterResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeCoverLetterSectionResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeCoverLetterSectionRequest req) {
        loadOwned(resumeId, userId);
        ResumeCoverLetter coverLetter = loadCoverLetter(resumeId);

        ResumeCoverLetterSection entity = ResumeCoverLetterSection.builder()
                .coverLetter(coverLetter)
                .question(req.question())
                .answer(req.answer())
                .charLimit(req.charLimit())
                .orderIndex(req.orderIndex())
                .build();

        return sectionRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId,
                       ResumeCoverLetterSectionRequest req) {
        loadOwned(resumeId, userId);

        ResumeCoverLetterSection entity = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.question(), req.answer(), req.charLimit());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeCoverLetterSection entity = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        sectionRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }

    private ResumeCoverLetter loadCoverLetter(Long resumeId) {
        return coverLetterRepository.findById(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COVER_LETTER_NOT_FOUND));
    }
}
