package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findAllByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(Long userId);

    Optional<Resume> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    Optional<Resume> findByUserIdAndIsMasterTrueAndDeletedAtIsNull(Long userId);
}
