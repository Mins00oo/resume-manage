package com.resumemanage.jobapply.domain;

import java.util.EnumSet;
import java.util.Set;

/**
 * 지원 상태 — 15개 고정.
 * 종료 상태(isTerminal)는 더 이상 전이할 수 없는 상태.
 */
public enum JobApplyStatus {
    DRAFT,                      // 작성중
    SUBMITTED,                  // 지원완료
    DOCUMENT_PASSED,            // 서류합격
    DOCUMENT_FAILED,            // 서류탈락
    CODING_IN_PROGRESS,         // 코테 진행
    CODING_PASSED,              // 코테 합격
    CODING_FAILED,              // 코테 탈락
    ASSIGNMENT_IN_PROGRESS,     // 과제 진행
    ASSIGNMENT_PASSED,          // 과제 합격
    ASSIGNMENT_FAILED,          // 과제 탈락
    INTERVIEW_IN_PROGRESS,      // 면접 진행
    INTERVIEW_PASSED,           // 면접 통과 (모든 라운드 끝, 최종 결과 대기)
    INTERVIEW_FAILED,           // 면접 탈락
    FINAL_ACCEPTED,             // 최종합격
    FINAL_REJECTED;             // 최종탈락

    private static final Set<JobApplyStatus> TERMINAL = EnumSet.of(
            DOCUMENT_FAILED,
            CODING_FAILED,
            ASSIGNMENT_FAILED,
            INTERVIEW_FAILED,
            FINAL_ACCEPTED,
            FINAL_REJECTED
    );

    public boolean isTerminal() {
        return TERMINAL.contains(this);
    }
}
