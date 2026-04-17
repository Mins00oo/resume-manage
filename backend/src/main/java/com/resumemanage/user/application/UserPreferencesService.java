package com.resumemanage.user.application;

import com.resumemanage.user.domain.UserPreferences;
import com.resumemanage.user.dto.UpdatePreferencesRequest;
import com.resumemanage.user.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserPreferencesService {

    private final UserPreferencesRepository repository;

    /**
     * 설정이 없으면 기본값으로 생성하여 반환.
     */
    @Transactional
    public UserPreferences getOrCreate(Long userId) {
        return repository.findByUserId(userId)
                .orElseGet(() -> repository.save(UserPreferences.defaultsFor(userId)));
    }

    @Transactional
    public UserPreferences update(Long userId, UpdatePreferencesRequest request) {
        UserPreferences prefs = getOrCreate(userId);
        prefs.update(
                request.theme(),
                request.deadlineNotificationsEnabled(),
                request.interviewNotificationsEnabled(),
                request.googleCalendarSyncEnabled()
        );
        return prefs;
    }
}
