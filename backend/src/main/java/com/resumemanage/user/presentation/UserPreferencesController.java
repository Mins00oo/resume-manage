package com.resumemanage.user.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.user.application.UserPreferencesService;
import com.resumemanage.user.dto.UpdatePreferencesRequest;
import com.resumemanage.user.dto.UserPreferencesResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    @GetMapping
    public ApiResponse<UserPreferencesResponse> get(@AuthenticationPrincipal CurrentUser currentUser) {
        if (currentUser == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        return ApiResponse.ok(UserPreferencesResponse.from(preferencesService.getOrCreate(currentUser.userId())));
    }

    @PatchMapping
    public ApiResponse<UserPreferencesResponse> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        if (currentUser == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        return ApiResponse.ok(UserPreferencesResponse.from(preferencesService.update(currentUser.userId(), request)));
    }
}
