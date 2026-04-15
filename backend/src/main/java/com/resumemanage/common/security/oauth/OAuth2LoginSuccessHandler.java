package com.resumemanage.common.security.oauth;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.common.security.jwt.JwtTokenProvider;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Value("${app.security.oauth2.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String googleSub = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");

        if (googleSub == null) {
            log.error("OAuth2 principal missing 'sub' attribute. attributes={}", oAuth2User.getAttributes());
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Google OAuth 응답에 'sub' 이 없습니다.");
        }

        User user = userRepository.findByGoogleSub(googleSub)
                .orElseThrow(() -> {
                    log.error("User not found by googleSub after OAuth2UserService processed. sub={}", googleSub);
                    return new BusinessException(ErrorCode.USER_NOT_FOUND);
                });

        String token = jwtTokenProvider.issueToken(user.getId(), email);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("token", token)
                .build()
                .toUriString();

        log.info("OAuth2 login success. userId={}, email={}, redirect={}", user.getId(), email, targetUrl);
        redirectStrategy.sendRedirect(request, response, targetUrl);
    }
}
