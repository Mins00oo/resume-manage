package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeLanguage;
import com.resumemanage.resume.dto.section.ResumeLanguageRequest;
import com.resumemanage.resume.dto.section.ResumeLanguageResponse;
import com.resumemanage.resume.repository.ResumeLanguageRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeLanguageService {

    private final ResumeRepository resumeRepository;
    private final ResumeLanguageRepository languageRepository;

    @Transactional(readOnly = true)
    public List<ResumeLanguageResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return languageRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeLanguageResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeLanguageRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeLanguage entity = ResumeLanguage.builder()
                .resume(resume)
                .language(req.language())
                .testName(req.testName())
                .score(req.score())
                .acquiredAt(req.acquiredAt())
                .orderIndex(req.orderIndex())
                .build();

        return languageRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId, ResumeLanguageRequest req) {
        loadOwned(resumeId, userId);

        ResumeLanguage entity = languageRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.language(), req.testName(), req.score(), req.acquiredAt());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeLanguage entity = languageRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        languageRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
