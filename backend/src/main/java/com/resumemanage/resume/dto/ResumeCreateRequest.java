package com.resumemanage.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResumeCreateRequest(
        @NotBlank
        @Size(max = 200)
        String title
) {
}
