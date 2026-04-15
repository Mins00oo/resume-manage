package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeCareerProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeCareerProjectRepository extends JpaRepository<ResumeCareerProject, Long> {

    List<ResumeCareerProject> findAllByCareerIdOrderByOrderIndexAsc(Long careerId);
}
