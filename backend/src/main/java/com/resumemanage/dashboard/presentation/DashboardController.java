package com.resumemanage.dashboard.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.dashboard.application.DashboardService;
import com.resumemanage.dashboard.dto.DashboardSummaryResponse;
import com.resumemanage.dashboard.dto.PassRateDetailsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> getSummary(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(required = false, defaultValue = "3m") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.ok(
                dashboardService.getSummary(currentUser.userId(), period, from, to)
        );
    }

    @GetMapping("/pass-rate-details")
    public ApiResponse<PassRateDetailsResponse> getPassRateDetails(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam String stage,
            @RequestParam(required = false, defaultValue = "3m") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.ok(
                dashboardService.getPassRateDetails(currentUser.userId(), stage, period, from, to)
        );
    }
}
