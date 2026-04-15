package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 자기소개서 문항별 항목 (STRUCTURED 타입일 때 사용).
 * answer 필드가 AI 검증 대상.
 */
@Getter
@Entity
@Table(name = "resume_cover_letter_sections")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeCoverLetterSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private ResumeCoverLetter coverLetter;

    @Column(length = 500)
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(name = "char_limit")
    private Integer charLimit;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeCoverLetterSection(ResumeCoverLetter coverLetter, String question,
                                     String answer, Integer charLimit, short orderIndex) {
        this.coverLetter = coverLetter;
        this.question = question;
        this.answer = answer;
        this.charLimit = charLimit;
        this.orderIndex = orderIndex;
    }

    public void update(String question, String answer, Integer charLimit) {
        this.question = question;
        this.answer = answer;
        this.charLimit = charLimit;
    }

    public void applyAiRevisedAnswer(String revised) {
        this.answer = revised;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
