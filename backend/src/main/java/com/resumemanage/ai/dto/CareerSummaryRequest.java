package com.resumemanage.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CareerSummaryRequest(
        @NotBlank @Size(max = 5000) String rawText,
        @Size(max = 100) String companyName,
        @Size(max = 100) String position,
        /** 지원 공고 JD 전문 — bullet 선별·어휘 선택에 반영. 선택 입력. */
        @Size(max = 4000) String jobDescription
) {
}
