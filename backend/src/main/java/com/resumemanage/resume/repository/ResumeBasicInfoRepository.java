package com.resumemanage.resume.repository;

import com.resumemanage.resume.domain.ResumeBasicInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeBasicInfoRepository extends JpaRepository<ResumeBasicInfo, Long> {
}
