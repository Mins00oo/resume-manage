package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_languages")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(length = 50)
    private String language;

    @Column(name = "test_name", length = 50)
    private String testName;

    @Column(length = 20)
    private String score;

    @Column(name = "acquired_at")
    private LocalDate acquiredAt;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeLanguage(Resume resume, String language, String testName, String score,
                           LocalDate acquiredAt, short orderIndex) {
        this.resume = resume;
        this.language = language;
        this.testName = testName;
        this.score = score;
        this.acquiredAt = acquiredAt;
        this.orderIndex = orderIndex;
    }

    public void update(String language, String testName, String score, LocalDate acquiredAt) {
        this.language = language;
        this.testName = testName;
        this.score = score;
        this.acquiredAt = acquiredAt;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
