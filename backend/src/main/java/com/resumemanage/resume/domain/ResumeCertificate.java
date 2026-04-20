package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_certificates")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(length = 100)
    private String name;

    @Column(length = 100)
    private String issuer;

    @Column(name = "acquired_at")
    private LocalDate acquiredAt;

    @Column(name = "certificate_number", length = 100)
    private String certificateNumber;

    @Column(length = 50)
    private String score;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeCertificate(Resume resume, String name, String issuer,
                              LocalDate acquiredAt, String certificateNumber, String score,
                              short orderIndex) {
        this.resume = resume;
        this.name = name;
        this.issuer = issuer;
        this.acquiredAt = acquiredAt;
        this.certificateNumber = certificateNumber;
        this.score = score;
        this.orderIndex = orderIndex;
    }

    public void update(String name, String issuer, LocalDate acquiredAt,
                       String certificateNumber, String score) {
        this.name = name;
        this.issuer = issuer;
        this.acquiredAt = acquiredAt;
        this.certificateNumber = certificateNumber;
        this.score = score;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
