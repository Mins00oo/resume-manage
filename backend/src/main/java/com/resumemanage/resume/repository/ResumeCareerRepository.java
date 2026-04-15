package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeCareer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeCareerRepository extends JpaRepository<ResumeCareer, Long> {

    List<ResumeCareer> findAllByResumeIdOrderByOrderIndexAsc(Long resumeId);
}
