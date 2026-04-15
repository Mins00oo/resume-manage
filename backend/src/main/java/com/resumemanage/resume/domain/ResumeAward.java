package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_awards")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeAward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(length = 200)
    private String title;

    @Column(length = 100)
    private String issuer;

    @Column(name = "awarded_at")
    private LocalDate awardedAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeAward(Resume resume, String title, String issuer, LocalDate awardedAt,
                        String description, short orderIndex) {
        this.resume = resume;
        this.title = title;
        this.issuer = issuer;
        this.awardedAt = awardedAt;
        this.description = description;
        this.orderIndex = orderIndex;
    }

    public void update(String title, String issuer, LocalDate awardedAt, String description) {
        this.title = title;
        this.issuer = issuer;
        this.awardedAt = awardedAt;
        this.description = description;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
