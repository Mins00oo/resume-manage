package com.resumemanage.resume.domain;

import com.resumemanage.common.entity.SoftDeletableEntity;
import com.resumemanage.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name = "resumes")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Resume extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "is_master", nullable = false)
    private boolean isMaster;

    @Column(name = "completion_rate", nullable = false)
    private short completionRate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hidden_sections", columnDefinition = "json")
    private List<String> hiddenSections = new ArrayList<>();

    @Builder
    private Resume(User user, String title) {
        this.user = user;
        this.title = title;
        this.isMaster = false;
        this.completionRate = 0;
        this.hiddenSections = new ArrayList<>();
    }

    public void rename(String title) {
        this.title = title;
    }

    public void markAsMaster() {
        this.isMaster = true;
    }

    public void unmarkAsMaster() {
        this.isMaster = false;
    }

    public void updateCompletionRate(int rate) {
        if (rate < 0 || rate > 100) {
            throw new IllegalArgumentException("completion rate must be 0~100");
        }
        this.completionRate = (short) rate;
    }

    public void updateHiddenSections(List<String> sections) {
        this.hiddenSections = sections != null ? new ArrayList<>(sections) : new ArrayList<>();
    }
}
