package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeTraining;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeTrainingRepository extends JpaRepository<ResumeTraining, Long> {

    List<ResumeTraining> findAllByResumeIdOrderByOrderIndexAsc(Long resumeId);
}
