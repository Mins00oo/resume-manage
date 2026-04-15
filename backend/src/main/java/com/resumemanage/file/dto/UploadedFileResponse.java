package com.resumemanage.file.dto;

import com.resumemanage.file.domain.UploadedFile;

import java.time.format.DateTimeFormatter;

public record UploadedFileResponse(
        Long id,
        String originalFilename,
        String mimeType,
        Long sizeBytes,
        String downloadUrl,
        String createdAt
) {
    public static UploadedFileResponse from(UploadedFile file) {
        return new UploadedFileResponse(
                file.getId(),
                file.getOriginalFilename(),
                file.getMimeType(),
                file.getSizeBytes(),
                "/api/files/" + file.getId(),
                file.getCreatedAt() == null ? null : file.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }
}
