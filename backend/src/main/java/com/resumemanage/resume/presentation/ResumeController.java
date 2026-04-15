package com.resumemanage.resume.presentation;

// TODO: Child section endpoints (educations, careers, etc.) will be added
//       in a follow-up task. This controller currently exposes only the
//       resume root CRUD operations.

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.resume.application.ResumeService;
import com.resumemanage.resume.application.pdf.ResumePdfResult;
import com.resumemanage.resume.application.pdf.ResumePdfService;
import com.resumemanage.resume.dto.ResumeCreateRequest;
import com.resumemanage.resume.dto.ResumeDetailResponse;
import com.resumemanage.resume.dto.ResumeSummaryResponse;
import com.resumemanage.resume.dto.ResumeUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumePdfService resumePdfService;

    @GetMapping
    public ApiResponse<List<ResumeSummaryResponse>> list(
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return ApiResponse.ok(resumeService.listMine(currentUser.userId()));
    }

    @PostMapping
    public ApiResponse<Map<String, Long>> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody ResumeCreateRequest request
    ) {
        Long id = resumeService.create(currentUser, request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @GetMapping("/{id}")
    public ApiResponse<ResumeDetailResponse> get(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        return ApiResponse.ok(resumeService.get(id, currentUser.userId()));
    }

    @PatchMapping("/{id}")
    public ApiResponse<Void> updateTitle(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody ResumeUpdateRequest request
    ) {
        resumeService.updateTitle(id, currentUser.userId(), request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        resumeService.softDelete(id, currentUser.userId());
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/duplicate")
    public ApiResponse<Map<String, Long>> duplicate(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        Long newId = resumeService.duplicate(id, currentUser.userId());
        return ApiResponse.ok(Map.of("id", newId));
    }

    @PostMapping("/{id}/master")
    public ApiResponse<Void> setMaster(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        resumeService.setAsMaster(id, currentUser.userId());
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}/master")
    public ApiResponse<Void> unsetMaster(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        resumeService.unsetMaster(id, currentUser.userId());
        return ApiResponse.ok();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        ResumePdfResult result = resumePdfService.generate(id, currentUser.userId());
        String encoded = URLEncoder.encode(result.filename(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encoded)
                .body(result.bytes());
    }
}
