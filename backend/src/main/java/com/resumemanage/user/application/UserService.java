package com.resumemanage.user.application;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.file.domain.UploadedFile;
import com.resumemanage.file.repository.UploadedFileRepository;
import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.repository.JobApplyRepository;
import com.resumemanage.notification.repository.PushSubscriptionRepository;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.repository.ResumeRepository;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * User 계정 수명 관리. 탈퇴(soft delete), 복구, 최종 물리 삭제.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final JobApplyRepository jobApplyRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    /**
     * 계정 탈퇴 — soft delete.
     * - User + Resume + JobApply + UploadedFile: deleted_at 세팅
     * - PushSubscription: 즉시 물리 삭제 (탈퇴 후 알림 수신 금지)
     * - UserPreferences: 보존 (소유자 FK로 cascade 삭제됨 — 최종 물리 삭제 시)
     */
    public void softDeleteSelf(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.isDeleted()) return;

        List<Resume> resumes = resumeRepository.findAllByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId);
        resumes.forEach(Resume::softDelete);

        List<JobApply> applies = jobApplyRepository.findAllByUserIdAndDeletedAtIsNull(userId);
        applies.forEach(JobApply::softDelete);

        List<UploadedFile> files = uploadedFileRepository.findAllByUserIdAndDeletedAtIsNull(userId);
        files.forEach(UploadedFile::softDelete);

        pushSubscriptionRepository.deleteAll(
                pushSubscriptionRepository.findAllByUserIdAndNotificationsEnabledTrue(userId)
        );

        user.softDelete();
    }
}
