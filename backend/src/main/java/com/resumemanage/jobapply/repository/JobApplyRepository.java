package com.resumemanage.jobapply.repository;

import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplyRepository extends JpaRepository<JobApply, Long>, JpaSpecificationExecutor<JobApply> {

    List<JobApply> findAllByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(Long userId);

    List<JobApply> findAllByUserIdAndDeletedAtIsNull(Long userId);

    Optional<JobApply> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    List<JobApply> findAllByUserIdAndCurrentStatusAndDeletedAtIsNull(Long userId, JobApplyStatus status);

    List<JobApply> findAllByUserIdAndDeadlineBetweenAndDeletedAtIsNull(Long userId, LocalDate from, LocalDate to);

    List<JobApply> findAllByDeadlineBetweenAndDeletedAtIsNull(LocalDate from, LocalDate to);
}
