package com.resumemanage.resume.application;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.resume.domain.Resume;
import com.resumemanage.resume.dto.ResumeCreateRequest;
import com.resumemanage.resume.dto.ResumeDetailResponse;
import com.resumemanage.resume.dto.ResumeSummaryResponse;
import com.resumemanage.resume.dto.ResumeUpdateRequest;
import com.resumemanage.resume.repository.ResumeRepository;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public Long create(CurrentUser me, ResumeCreateRequest req) {
        User user = userRepository.findById(me.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Resume resume = Resume.builder()
                .user(user)
                .title(req.title())
                .build();

        return resumeRepository.save(resume).getId();
    }

    @Transactional(readOnly = true)
    public List<ResumeSummaryResponse> listMine(Long userId) {
        return resumeRepository
                .findAllByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId)
                .stream()
                .map(ResumeSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumeDetailResponse get(Long resumeId, Long userId) {
        Resume resume = loadOwned(resumeId, userId);
        return ResumeDetailResponse.from(resume);
    }

    public void updateTitle(Long resumeId, Long userId, ResumeUpdateRequest req) {
        Resume resume = loadOwned(resumeId, userId);
        resume.rename(req.title());
    }

    public void softDelete(Long resumeId, Long userId) {
        Resume resume = loadOwned(resumeId, userId);
        resume.softDelete();
    }

    public Long duplicate(Long resumeId, Long userId) {
        Resume original = loadOwned(resumeId, userId);

        // TODO: child entities (basic info, educations, careers, languages,
        //       certificates, awards, training, cover letter, etc.) are NOT
        //       copied yet. Implement deep-copy in a follow-up task once child
        //       section CRUD lands.
        Resume copy = Resume.builder()
                .user(original.getUser())
                .title(original.getTitle() + " (복사본)")
                .build();

        return resumeRepository.save(copy).getId();
    }

    public void setAsMaster(Long resumeId, Long userId) {
        Resume target = loadOwned(resumeId, userId);

        // Enforce only-one-master at the application level (MySQL doesn't
        // support partial unique indexes).
        Optional<Resume> currentMaster =
                resumeRepository.findByUserIdAndIsMasterTrueAndDeletedAtIsNull(userId);
        currentMaster.ifPresent(existing -> {
            if (!existing.getId().equals(target.getId())) {
                existing.unmarkAsMaster();
            }
        });

        target.markAsMaster();
    }

    public void unsetMaster(Long resumeId, Long userId) {
        Resume resume = loadOwned(resumeId, userId);
        resume.unmarkAsMaster();
    }

    private Resume loadOwned(Long resumeId, Long userId) {
        return resumeRepository
                .findByIdAndUserIdAndDeletedAtIsNull(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
    }
}
