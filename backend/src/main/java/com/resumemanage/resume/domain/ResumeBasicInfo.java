package com.resumemanage.resume.domain;

import com.resumemanage.file.domain.UploadedFile;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "resume_basic_info")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumeBasicInfo {

    @Id
    @Column(name = "resume_id")
    private Long resumeId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(name = "name_ko", length = 50)
    private String nameKo;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 300)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_image_file_id")
    private UploadedFile profileImageFile;

    @Column(name = "short_intro", length = 500)
    private String shortIntro;

    @Enumerated(EnumType.STRING)
    @Column(name = "military_status", length = 20)
    private MilitaryStatus militaryStatus;

    @Column(name = "disability_status", nullable = false)
    private boolean disabilityStatus;

    @Column(name = "veteran_status", nullable = false)
    private boolean veteranStatus;

    @Builder
    private ResumeBasicInfo(Resume resume) {
        this.resume = resume;
    }

    public void updateNames(String nameKo, String nameEn) {
        this.nameKo = nameKo;
        this.nameEn = nameEn;
    }

    public void updateContact(String email, String phone, String address) {
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    public void updatePersonal(Gender gender, LocalDate birthDate, String shortIntro) {
        this.gender = gender;
        this.birthDate = birthDate;
        this.shortIntro = shortIntro;
    }

    public void updateMilitaryAndPreferences(MilitaryStatus militaryStatus,
                                             boolean disabilityStatus,
                                             boolean veteranStatus) {
        this.militaryStatus = militaryStatus;
        this.disabilityStatus = disabilityStatus;
        this.veteranStatus = veteranStatus;
    }

    public void attachProfileImage(UploadedFile file) {
        this.profileImageFile = file;
    }

    public void detachProfileImage() {
        this.profileImageFile = null;
    }
}
