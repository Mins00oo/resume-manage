package com.resumemanage.resume.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_careers")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeCareer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(length = 100)
    private String position;

    @Column(length = 100)
    private String department;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(name = "order_index", nullable = false)
    private short orderIndex;

    @Builder
    private ResumeCareer(Resume resume, String companyName, String position, String department,
                         LocalDate startDate, LocalDate endDate, boolean isCurrent,
                         String responsibilities, short orderIndex) {
        this.resume = resume;
        this.companyName = companyName;
        this.position = position;
        this.department = department;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.responsibilities = responsibilities;
        this.orderIndex = orderIndex;
    }

    public void update(String companyName, String position, String department,
                       LocalDate startDate, LocalDate endDate, boolean isCurrent,
                       String responsibilities) {
        this.companyName = companyName;
        this.position = position;
        this.department = department;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.responsibilities = responsibilities;
    }

    public void changeOrder(short orderIndex) {
        this.orderIndex = orderIndex;
    }
}
