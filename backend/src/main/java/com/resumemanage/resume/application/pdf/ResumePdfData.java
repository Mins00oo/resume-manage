package com.resumemanage.resume.application.pdf;

import com.resumemanage.resume.domain.ResumeAward;
import com.resumemanage.resume.domain.ResumeBasicInfo;
import com.resumemanage.resume.domain.ResumeCareer;
import com.resumemanage.resume.domain.ResumeCertificate;
import com.resumemanage.resume.domain.ResumeCoverLetter;
import com.resumemanage.resume.domain.ResumeCoverLetterSection;
import com.resumemanage.resume.domain.ResumeEducation;
import com.resumemanage.resume.domain.ResumeLanguage;
import com.resumemanage.resume.domain.ResumeTraining;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 이력서 PDF 렌더링 템플릿에 주입되는 모든 데이터의 집합.
 *
 * <p>Thymeleaf 템플릿에서 접근하는 변수명과 필드명이 일치해야 한다.
 * nullable 필드들은 템플릿에서 반드시 null-check 해야 한다.
 */
public record ResumePdfData(
        String title,
        LocalDateTime updatedAt,
        ResumeBasicInfo basicInfo,
        List<ResumeEducation> educations,
        List<ResumeCareer> careers,
        List<ResumeLanguage> languages,
        List<ResumeCertificate> certificates,
        List<ResumeAward> awards,
        List<ResumeTraining> trainings,
        ResumeCoverLetter coverLetter,
        List<ResumeCoverLetterSection> coverLetterSections,
        Set<String> hiddenSections
) {
}
