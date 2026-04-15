package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeCertificateRepository extends JpaRepository<ResumeCertificate, Long> {

    List<ResumeCertificate> findAllByResumeIdOrderByOrderIndexAsc(Long resumeId);
}
