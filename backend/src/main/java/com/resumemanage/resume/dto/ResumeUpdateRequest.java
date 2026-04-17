package com.resumemanage.resume.dto;

import jakarta.validation.constraints.Size;

public record ResumeUpdateRequest(
        @Size(max = 200)
        String title
) {
}
