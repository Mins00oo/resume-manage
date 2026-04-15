package com.resumemanage.jobapply.application;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;
import com.resumemanage.jobapply.dto.JobApplyCreateRequest;
import com.resumemanage.jobapply.dto.JobApplyDetailResponse;
import com.resumemanage.jobapply.dto.JobApplyListItemResponse;
import com.resumemanage.jobapply.dto.JobApplyUpdateRequest;
import com.resumemanage.jobapply.repository.JobApplyRepository;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class JobApplyService {

    private final JobApplyRepository jobApplyRepository;
    private final UserRepository userRepository;

    public Long create(CurrentUser me, JobApplyCreateRequest req) {
        User user = userRepository.findById(me.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        JobApply entity = JobApply.builder()
                .user(user)
                .company(req.company())
                .position(req.position())
                .jobPostingUrl(req.jobPostingUrl())
                .employmentType(req.employmentType())
                .channel(req.channel())
                .deadline(req.deadline())
                .memo(req.memo())
                .build();

        return jobApplyRepository.save(entity).getId();
    }

    @Transactional(readOnly = true)
    public List<JobApplyListItemResponse> list(
            Long userId,
            JobApplyStatus statusFilter,
            LocalDate from,
            LocalDate to,
            String search
    ) {
        List<JobApply> all = jobApplyRepository.findAllByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId);

        String searchLower = (search == null || search.isBlank()) ? null : search.toLowerCase();

        return all.stream()
                .filter(ja -> statusFilter == null || ja.getCurrentStatus() == statusFilter)
                .filter(ja -> {
                    if (from == null && to == null) {
                        return true;
                    }
                    LocalDate d = ja.getDeadline();
                    if (d == null) {
                        return false;
                    }
                    if (from != null && d.isBefore(from)) {
                        return false;
                    }
                    if (to != null && d.isAfter(to)) {
                        return false;
                    }
                    return true;
                })
                .filter(ja -> {
                    if (searchLower == null) {
                        return true;
                    }
                    String company = ja.getCompany();
                    return company != null && company.toLowerCase().contains(searchLower);
                })
                .map(JobApplyListItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobApplyDetailResponse get(Long id, Long userId) {
        JobApply entity = loadOwned(id, userId);
        return JobApplyDetailResponse.from(entity);
    }

    public void update(Long id, Long userId, JobApplyUpdateRequest req) {
        JobApply entity = loadOwned(id, userId);

        entity.updateBasicInfo(
                req.company() != null ? req.company() : entity.getCompany(),
                req.position() != null ? req.position() : entity.getPosition(),
                req.jobPostingUrl() != null ? req.jobPostingUrl() : entity.getJobPostingUrl(),
                req.employmentType() != null ? req.employmentType() : entity.getEmploymentType(),
                req.channel() != null ? req.channel() : entity.getChannel(),
                req.deadline() != null ? req.deadline() : entity.getDeadline(),
                req.memo() != null ? req.memo() : entity.getMemo()
        );
    }

    public void softDelete(Long id, Long userId) {
        JobApply entity = loadOwned(id, userId);
        entity.softDelete();
    }

    public void transitionStatus(Long id, Long userId, JobApplyStatus to) {
        JobApply entity = loadOwned(id, userId);
        try {
            entity.transitionTo(to);
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, e.getMessage());
        }
    }

    private JobApply loadOwned(Long id, Long userId) {
        return jobApplyRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.JOB_APPLY_NOT_FOUND));
    }
}
