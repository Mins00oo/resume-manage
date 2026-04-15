package com.resumemanage.jobapply.domain;

import com.resumemanage.common.entity.SoftDeletableEntity;
import com.resumemanage.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "job_applies")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobApply extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(length = 100)
    private String position;

    @Column(name = "job_posting_url", length = 1000)
    private String jobPostingUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType;

    @Column(length = 50)
    private String channel;

    @Column
    private LocalDate deadline;

    @Column(name = "submitted_at")
    private LocalDate submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 30)
    private JobApplyStatus currentStatus;

    @Column(name = "went_through_document", nullable = false)
    private boolean wentThroughDocument;

    @Column(name = "went_through_coding", nullable = false)
    private boolean wentThroughCoding;

    @Column(name = "went_through_assignment", nullable = false)
    private boolean wentThroughAssignment;

    @Column(name = "went_through_interview", nullable = false)
    private boolean wentThroughInterview;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Builder
    private JobApply(User user, String company, String position, String jobPostingUrl,
                     EmploymentType employmentType, String channel, LocalDate deadline, String memo) {
        this.user = user;
        this.company = company;
        this.position = position;
        this.jobPostingUrl = jobPostingUrl;
        this.employmentType = employmentType;
        this.channel = channel;
        this.deadline = deadline;
        this.memo = memo;
        this.currentStatus = JobApplyStatus.DRAFT;
    }

    public void updateBasicInfo(String company, String position, String jobPostingUrl,
                                EmploymentType employmentType, String channel,
                                LocalDate deadline, String memo) {
        this.company = company;
        this.position = position;
        this.jobPostingUrl = jobPostingUrl;
        this.employmentType = employmentType;
        this.channel = channel;
        this.deadline = deadline;
        this.memo = memo;
    }

    /**
     * 상태 전이. 진입한 단계에 따라 경유 플래그를 자동으로 세팅한다.
     * SUBMITTED 로 전이 시 submittedAt 에 오늘 날짜가 기록된다.
     */
    public void transitionTo(JobApplyStatus next) {
        if (this.currentStatus.isTerminal()) {
            throw new IllegalStateException(
                    "종료 상태(%s)에서는 전이할 수 없습니다.".formatted(this.currentStatus));
        }
        this.currentStatus = next;

        if (next == JobApplyStatus.SUBMITTED && this.submittedAt == null) {
            this.submittedAt = LocalDate.now();
        }

        switch (next) {
            case DOCUMENT_PASSED, DOCUMENT_FAILED -> this.wentThroughDocument = true;
            case CODING_IN_PROGRESS, CODING_PASSED, CODING_FAILED -> this.wentThroughCoding = true;
            case ASSIGNMENT_IN_PROGRESS, ASSIGNMENT_PASSED, ASSIGNMENT_FAILED -> this.wentThroughAssignment = true;
            case INTERVIEW_IN_PROGRESS, INTERVIEW_PASSED, INTERVIEW_FAILED -> this.wentThroughInterview = true;
            default -> {
                // DRAFT, SUBMITTED, FINAL_* — 플래그 변화 없음
            }
        }
    }
}
