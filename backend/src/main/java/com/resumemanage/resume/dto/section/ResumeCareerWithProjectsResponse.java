package com.resumemanage.resume.dto.section;

import java.util.List;

public record ResumeCareerWithProjectsResponse(
        ResumeCareerResponse career,
        List<ResumeCareerProjectResponse> projects
) {
}
