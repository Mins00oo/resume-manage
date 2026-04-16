package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeCareer;
import com.resumemanage.resume.dto.section.ResumeCareerRequest;
import com.resumemanage.resume.dto.section.ResumeCareerResponse;
import com.resumemanage.resume.repository.ResumeCareerRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeCareerService {

    private final ResumeRepository resumeRepository;
    private final ResumeCareerRepository careerRepository;

    @Transactional(readOnly = true)
    public List<ResumeCareerResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return careerRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeCareerResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeCareerRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeCareer entity = ResumeCareer.builder()
                .resume(resume)
                .companyName(req.companyName())
                .position(req.position())
                .department(req.department())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .isCurrent(req.isCurrent())
                .responsibilities(req.responsibilities())
                .orderIndex(req.orderIndex())
                .build();

        return careerRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId, ResumeCareerRequest req) {
        loadOwned(resumeId, userId);

        ResumeCareer entity = careerRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.companyName(), req.position(), req.department(),
                req.startDate(), req.endDate(), req.isCurrent(),
                req.responsibilities());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeCareer entity = careerRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        careerRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
