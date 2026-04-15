package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeCoverLetterSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeCoverLetterSectionRepository extends JpaRepository<ResumeCoverLetterSection, Long> {

    List<ResumeCoverLetterSection> findAllByCoverLetterResumeIdOrderByOrderIndexAsc(Long resumeId);
}
