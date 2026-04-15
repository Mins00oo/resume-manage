package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeLanguageRepository extends JpaRepository<ResumeLanguage, Long> {

    List<ResumeLanguage> findAllByResumeIdOrderByOrderIndexAsc(Long resumeId);
}
