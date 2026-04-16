package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeCoverLetter;
import com.resumemanage.resume.dto.section.ResumeCoverLetterRequest;
import com.resumemanage.resume.dto.section.ResumeCoverLetterResponse;
import com.resumemanage.resume.repository.ResumeCoverLetterRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeCoverLetterService {

    private final ResumeRepository resumeRepository;
    private final ResumeCoverLetterRepository coverLetterRepository;

    @Transactional(readOnly = true)
    public ResumeCoverLetterResponse get(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return coverLetterRepository.findById(resumeId)
                .map(ResumeCoverLetterResponse::from)
                .orElse(null);
    }

    public void upsert(Long resumeId, Long userId, ResumeCoverLetterRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeCoverLetter coverLetter = coverLetterRepository.findById(resumeId)
                .orElseGet(() -> coverLetterRepository.save(
                        ResumeCoverLetter.builder()
                                .resume(resume)
                                .type(req.type())
                                .build()
                ));

        coverLetter.changeType(req.type());
        coverLetter.updateFreeText(req.freeText());
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
