package com.resumemanage.user.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.user.application.UserService;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.dto.MeResponse;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<MeResponse> me(@AuthenticationPrincipal CurrentUser currentUser) {
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        User user = userRepository.findById(currentUser.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return ApiResponse.ok(MeResponse.from(user));
    }

    /**
     * 계정 탈퇴 (soft delete).
     * 30일 후 UserPurgeScheduler가 물리 삭제한다.
     */
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMe(@AuthenticationPrincipal CurrentUser currentUser) {
        if (currentUser == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        userService.softDeleteSelf(currentUser.userId());
        return ApiResponse.ok(null);
    }
}
