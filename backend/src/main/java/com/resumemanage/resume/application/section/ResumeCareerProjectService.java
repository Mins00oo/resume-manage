package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeCareer;
import com.resumemanage.resume.domain.ResumeCareerProject;
import com.resumemanage.resume.dto.section.ResumeCareerProjectRequest;
import com.resumemanage.resume.dto.section.ResumeCareerProjectResponse;
import com.resumemanage.resume.repository.ResumeCareerProjectRepository;
import com.resumemanage.resume.repository.ResumeCareerRepository;
import com.resumemanage.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeCareerProjectService {

    private final ResumeRepository resumeRepository;
    private final ResumeCareerRepository careerRepository;
    private final ResumeCareerProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ResumeCareerProjectResponse> list(Long resumeId, Long userId, Long careerId) {
        loadOwned(resumeId, userId);
        loadCareerBelongsToResume(careerId, resumeId);
        return projectRepository.findAllByCareerIdOrderByOrderIndexAsc(careerId)
                .stream()
                .map(ResumeCareerProjectResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, Long careerId, ResumeCareerProjectRequest req) {
        loadOwned(resumeId, userId);
        ResumeCareer career = loadCareerBelongsToResume(careerId, resumeId);

        ResumeCareerProject entity = ResumeCareerProject.builder()
                .career(career)
                .title(req.title())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .description(req.description())
                .orderIndex(req.orderIndex())
                .build();

        return projectRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long careerId, Long projectId,
                       ResumeCareerProjectRequest req) {
        loadOwned(resumeId, userId);
        loadCareerBelongsToResume(careerId, resumeId);

        ResumeCareerProject entity = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.title(), req.startDate(), req.endDate(), req.description());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long careerId, Long projectId) {
        loadOwned(resumeId, userId);
        loadCareerBelongsToResume(careerId, resumeId);

        ResumeCareerProject entity = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        projectRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }

    private ResumeCareer loadCareerBelongsToResume(Long careerId, Long resumeId) {
        ResumeCareer career = careerRepository.findById(careerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CAREER_NOT_FOUND));

        if (!career.getResume().getId().equals(resumeId)) {
            throw new BusinessException(ErrorCode.CAREER_NOT_FOUND);
        }
        return career;
    }
}
