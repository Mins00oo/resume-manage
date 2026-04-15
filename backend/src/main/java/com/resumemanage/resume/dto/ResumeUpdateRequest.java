package com.resumemanage.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResumeUpdateRequest(
        @NotBlank
        @Size(max = 200)
        String title
) {
}
