package com.resumemanage.common.security.oauth;

import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Google OAuth2 는 OIDC 라 Spring Security 가 {@link OidcUserService} 를 호출한다.
 * (DefaultOAuth2UserService 는 비-OIDC 경로용이라 호출되지 않음.)
 * 여기서 사용자 find-or-create 를 수행한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("[CustomOidcUserService] loadUser CALLED. clientRegistration={}",
                userRequest.getClientRegistration().getRegistrationId());

        OidcUser oidcUser = super.loadUser(userRequest);

        String sub = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        log.info("[CustomOidcUserService] Parsed: sub={}, email={}, name={}", sub, email, name);

        if (sub == null || email == null) {
            log.error("[CustomOidcUserService] Missing required attributes. sub={}, email={}", sub, email);
            throw new OAuth2AuthenticationException("Required OIDC attributes missing");
        }

        User user = userRepository.findByGoogleSub(sub)
                .orElseGet(() -> {
                    log.info("[CustomOidcUserService] No user by googleSub, checking email={}", email);
                    return userRepository.findByEmail(email)
                            .orElseGet(() -> {
                                log.info("[CustomOidcUserService] Creating new user. sub={}, email={}", sub, email);
                                User newUser = User.builder()
                                        .googleSub(sub)
                                        .email(email)
                                        .name(name)
                                        .profileImageUrl(picture)
                                        .build();
                                User saved = userRepository.save(newUser);
                                log.info("[CustomOidcUserService] New user saved. id={}", saved.getId());
                                return saved;
                            });
                });

        user.markLoggedIn();
        userRepository.save(user);
        log.info("[CustomOidcUserService] Resolved user. id={}, googleSub={}", user.getId(), user.getGoogleSub());

        return new DefaultOidcUser(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo()
        );
    }
}
