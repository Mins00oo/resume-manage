package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeAward;
import com.resumemanage.resume.dto.section.ResumeAwardRequest;
import com.resumemanage.resume.dto.section.ResumeAwardResponse;
import com.resumemanage.resume.repository.ResumeAwardRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeAwardService {

    private final ResumeRepository resumeRepository;
    private final ResumeAwardRepository awardRepository;

    @Transactional(readOnly = true)
    public List<ResumeAwardResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return awardRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeAwardResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeAwardRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeAward entity = ResumeAward.builder()
                .resume(resume)
                .title(req.title())
                .issuer(req.issuer())
                .awardedAt(req.awardedAt())
                .description(req.description())
                .orderIndex(req.orderIndex())
                .build();

        return awardRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId, ResumeAwardRequest req) {
        loadOwned(resumeId, userId);

        ResumeAward entity = awardRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.title(), req.issuer(), req.awardedAt(), req.description());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeAward entity = awardRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        awardRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
