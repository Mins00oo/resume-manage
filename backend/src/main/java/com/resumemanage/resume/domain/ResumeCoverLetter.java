package com.resumemanage.resume.domain;

import com.resumemanage.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 자기소개서. 이력서와 1:1.
 * FREE (자유형식 텍스트) 또는 STRUCTURED (문항별 Q&A) 타입.
 * 타입 전환 시 반대편 데이터는 보존(숨김).
 */
@Getter
@Entity
@Table(name = "resume_cover_letter")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeCoverLetter extends BaseTimeEntity {

    @Id
    @Column(name = "resume_id")
    private Long resumeId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CoverLetterType type;

    @Column(name = "free_text", columnDefinition = "TEXT")
    private String freeText;

    @Builder
    private ResumeCoverLetter(Resume resume, CoverLetterType type) {
        this.resume = resume;
        this.type = type != null ? type : CoverLetterType.FREE;
    }

    public void updateFreeText(String text) {
        this.freeText = text;
    }

    /**
     * 타입을 전환한다. 반대편 데이터는 보존된다.
     */
    public void changeType(CoverLetterType newType) {
        this.type = newType;
    }

    public void applyAiRevisedFreeText(String revised) {
        this.freeText = revised;
    }
}
