package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 경력 내 프로젝트. AI 검증(description 필드) 대상.
 */
@Getter
@Entity
@Table(name = "resume_career_projects")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeCareerProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "career_id", nullable = false)
    private ResumeCareer career;

    @Column(length = 200)
    private String title;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeCareerProject(ResumeCareer career, String title, LocalDate startDate,
                                LocalDate endDate, String description, short orderIndex) {
        this.career = career;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.orderIndex = orderIndex;
    }

    public void update(String title, LocalDate startDate, LocalDate endDate, String description) {
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    /**
     * AI 검증 결과로 설명을 교체한다.
     */
    public void applyAiRevisedDescription(String revised) {
        this.description = revised;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
