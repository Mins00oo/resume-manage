package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_educations")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "school_name", length = 100)
    private String schoolName;

    @Column(length = 100)
    private String major;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Degree degree;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "graduation_status", length = 20)
    private GraduationStatus graduationStatus;

    @Column(precision = 3, scale = 2)
    private BigDecimal gpa;

    @Column(name = "gpa_max", precision = 3, scale = 2)
    private BigDecimal gpaMax;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeEducation(Resume resume, String schoolName, String major, Degree degree,
                            LocalDate startDate, LocalDate endDate, GraduationStatus graduationStatus,
                            BigDecimal gpa, BigDecimal gpaMax, short orderIndex) {
        this.resume = resume;
        this.schoolName = schoolName;
        this.major = major;
        this.degree = degree;
        this.startDate = startDate;
        this.endDate = endDate;
        this.graduationStatus = graduationStatus;
        this.gpa = gpa;
        this.gpaMax = gpaMax;
        this.orderIndex = orderIndex;
    }

    public void update(String schoolName, String major, Degree degree,
                       LocalDate startDate, LocalDate endDate, GraduationStatus graduationStatus,
                       BigDecimal gpa, BigDecimal gpaMax) {
        this.schoolName = schoolName;
        this.major = major;
        this.degree = degree;
        this.startDate = startDate;
        this.endDate = endDate;
        this.graduationStatus = graduationStatus;
        this.gpa = gpa;
        this.gpaMax = gpaMax;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
