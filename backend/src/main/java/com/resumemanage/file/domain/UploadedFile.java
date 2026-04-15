package com.resumemanage.file.domain;

import com.resumemanage.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 업로드된 파일. 한 번 올라가면 수정되지 않음(immutable) — 그래서 updated_at 없음.
 */
@Getter
@Entity
@Table(name = "uploaded_files")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false, length = 255)
    private String storedFilename;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    private UploadedFile(User user, String originalFilename, String storedFilename,
                         String filePath, String mimeType, Long sizeBytes) {
        this.user = user;
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
