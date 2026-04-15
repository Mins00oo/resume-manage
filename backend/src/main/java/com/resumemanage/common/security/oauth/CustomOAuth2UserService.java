package com.resumemanage.common.security.oauth;

import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("[CustomOAuth2UserService] loadUser CALLED. clientRegistration={}",
                userRequest.getClientRegistration().getRegistrationId());

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        log.info("[CustomOAuth2UserService] Google returned attributes: {}", attributes);

        String sub = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        log.info("[CustomOAuth2UserService] Parsed: sub={}, email={}, name={}", sub, email, name);

        if (sub == null || email == null) {
            log.error("[CustomOAuth2UserService] Missing required attributes. sub={}, email={}", sub, email);
            throw new OAuth2AuthenticationException("Required OAuth2 attributes missing");
        }

        User user = userRepository.findByGoogleSub(sub)
                .orElseGet(() -> {
                    log.info("[CustomOAuth2UserService] No user found by googleSub={}, checking by email={}", sub, email);
                    return userRepository.findByEmail(email)
                            .orElseGet(() -> {
                                log.info("[CustomOAuth2UserService] No user found by email either, creating new user");
                                User newUser = User.builder()
                                        .googleSub(sub)
                                        .email(email)
                                        .name(name)
                                        .profileImageUrl(picture)
                                        .build();
                                User saved = userRepository.save(newUser);
                                log.info("[CustomOAuth2UserService] New user saved. id={}, googleSub={}", saved.getId(), saved.getGoogleSub());
                                return saved;
                            });
                });

        log.info("[CustomOAuth2UserService] Resolved user. id={}, googleSub={}, email={}", user.getId(), user.getGoogleSub(), user.getEmail());

        user.markLoggedIn();
        User updated = userRepository.save(user);
        log.info("[CustomOAuth2UserService] After markLoggedIn save. id={}, googleSub={}", updated.getId(), updated.getGoogleSub());

        Map<String, Object> enrichedAttributes = new HashMap<>(attributes);
        enrichedAttributes.put("appUserId", updated.getId());

        return new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                enrichedAttributes,
                "sub"
        );
    }
}
