package com.resumemanage.jobapply.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.jobapply.application.JobApplyService;
import com.resumemanage.jobapply.domain.JobApplyStatus;
import com.resumemanage.jobapply.dto.JobApplyCreateRequest;
import com.resumemanage.jobapply.dto.JobApplyDetailResponse;
import com.resumemanage.jobapply.dto.JobApplyListItemResponse;
import com.resumemanage.jobapply.dto.JobApplyTransitionRequest;
import com.resumemanage.jobapply.dto.JobApplyUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-applies")
@RequiredArgsConstructor
public class JobApplyController {

    private final JobApplyService jobApplyService;

    @GetMapping
    public ApiResponse<List<JobApplyListItemResponse>> list(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(required = false) JobApplyStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.ok(
                jobApplyService.list(currentUser.userId(), status, from, to, search)
        );
    }

    @PostMapping
    public ApiResponse<Map<String, Long>> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody JobApplyCreateRequest request
    ) {
        Long id = jobApplyService.create(currentUser, request);
        return ApiResponse.ok(Map.of("id", id));
    }

    @GetMapping("/{id}")
    public ApiResponse<JobApplyDetailResponse> get(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        return ApiResponse.ok(jobApplyService.get(id, currentUser.userId()));
    }

    @PatchMapping("/{id}")
    public ApiResponse<Void> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody JobApplyUpdateRequest request
    ) {
        jobApplyService.update(id, currentUser.userId(), request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id
    ) {
        jobApplyService.softDelete(id, currentUser.userId());
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/transition")
    public ApiResponse<Void> transition(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody JobApplyTransitionRequest request
    ) {
        jobApplyService.transitionStatus(id, currentUser.userId(), request.to());
        return ApiResponse.ok();
    }
}
