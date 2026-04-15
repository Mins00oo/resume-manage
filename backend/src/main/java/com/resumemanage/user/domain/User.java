package com.resumemanage.user.domain;

import com.resumemanage.common.entity.SoftDeletableEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_sub", nullable = false, unique = true, length = 100)
    private String googleSub;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Builder
    private User(String googleSub, String email, String name, String profileImageUrl) {
        this.googleSub = googleSub;
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }

    public void updateProfile(String name, String profileImageUrl) {
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }

    public void markLoggedIn() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
