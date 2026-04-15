package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeEducation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeEducationRepository extends JpaRepository<ResumeEducation, Long> {

    List<ResumeEducation> findAllByResumeIdOrderByOrderIndexAsc(Long resumeId);
}
