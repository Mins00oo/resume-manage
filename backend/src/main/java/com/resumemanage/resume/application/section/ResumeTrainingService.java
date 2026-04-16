package com.resumemanage.resume.application.section;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.domain.ResumeTraining;
import com.resumemanage.resume.dto.section.ResumeTrainingRequest;
import com.resumemanage.resume.dto.section.ResumeTrainingResponse;
import com.resumemanage.resume.repository.ResumeRepository;
import com.resumemanage.resume.repository.ResumeTrainingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeTrainingService {

    private final ResumeRepository resumeRepository;
    private final ResumeTrainingRepository trainingRepository;

    @Transactional(readOnly = true)
    public List<ResumeTrainingResponse> list(Long resumeId, Long userId) {
        loadOwned(resumeId, userId);
        return trainingRepository.findAllByResumeIdOrderByOrderIndexAsc(resumeId)
                .stream()
                .map(ResumeTrainingResponse::from)
                .toList();
    }

    public Long create(Long resumeId, Long userId, ResumeTrainingRequest req) {
        Resume resume = loadOwned(resumeId, userId);

        ResumeTraining entity = ResumeTraining.builder()
                .resume(resume)
                .name(req.name())
                .institution(req.institution())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .description(req.description())
                .orderIndex(req.orderIndex())
                .build();

        return trainingRepository.save(entity).getId();
    }

    public void update(Long resumeId, Long userId, Long sectionId, ResumeTrainingRequest req) {
        loadOwned(resumeId, userId);

        ResumeTraining entity = trainingRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        entity.update(req.name(), req.institution(), req.startDate(), req.endDate(), req.description());
        entity.changeOrder(req.orderIndex());
    }

    public void delete(Long resumeId, Long userId, Long sectionId) {
        loadOwned(resumeId, userId);

        ResumeTraining entity = trainingRepository.findById(sectionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SECTION_NOT_FOUND));

        trainingRepository.delete(entity);
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
