package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeCertificate;
import com.resumemanage.resume.dto.section.ResumeCertificateRequest;
import com.resumemanage.resume.dto.section.ResumeCertificateResponse;
import com.resumemanage.resume.repository.ResumeCertificateRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeCertificateService {

    private final ResumeRepository resumeRepository;
    private final ResumeCertificateRepository certificateRepository;

    @Transactional(readOnly = true)
    public List<ResumeCertificateResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return certificateRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeCertificateResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeCertificateRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeCertificate entity = ResumeCertificate.builder()
                .resume(resume)
                .name(req.name())
                .issuer(req.issuer())
                .acquiredAt(req.acquiredAt())
                .certificateNumber(req.certificateNumber())
                .score(req.score())
                .orderIndex(req.orderIndex())
                .build();

        return certificateRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId, ResumeCertificateRequest req) {
        loadOwned(resumeId, userId);

        ResumeCertificate entity = certificateRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.name(), req.issuer(), req.acquiredAt(),
                req.certificateNumber(), req.score());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeCertificate entity = certificateRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        certificateRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
