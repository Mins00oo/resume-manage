package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeEducation;
import com.resumemanage.resume.dto.section.ResumeEducationRequest;
import com.resumemanage.resume.dto.section.ResumeEducationResponse;
import com.resumemanage.resume.repository.ResumeEducationRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeEducationService {

    private final ResumeRepository resumeRepository;
    private final ResumeEducationRepository educationRepository;

    @Transactional(readOnly = true)
    public List<ResumeEducationResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return educationRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeEducationResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeEducationRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeEducation entity = ResumeEducation.builder()
                .resume(resume)
                .schoolName(req.schoolName())
                .major(req.major())
                .degree(req.degree())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .graduationStatus(req.graduationStatus())
                .gpa(req.gpa())
                .gpaMax(req.gpaMax())
                .orderIndex(req.orderIndex())
                .build();

        return educationRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId, ResumeEducationRequest req) {
        loadOwned(resumeId, userId);

        ResumeEducation entity = educationRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.schoolName(), req.major(), req.degree(),
                req.startDate(), req.endDate(), req.graduationStatus(),
                req.gpa(), req.gpaMax());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeEducation entity = educationRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        educationRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
