package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeAward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeAwardRepository extends JpaRepository<ResumeAward, Long> {

    List<ResumeAward> findAllByResumeIdOrderByOrderIndexAsc(Long resumeId);
}
