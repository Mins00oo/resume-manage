package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_trainings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeTraining {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(length = 200)
    private String name;

    @Column(length = 100)
    private String institution;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeTraining(Resume resume, String name, String institution,
                           LocalDate startDate, LocalDate endDate, String description,
                           short orderIndex) {
        this.resume = resume;
        this.name = name;
        this.institution = institution;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.orderIndex = orderIndex;
    }

    public void update(String name, String institution, LocalDate startDate,
                       LocalDate endDate, String description) {
        this.name = name;
        this.institution = institution;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
