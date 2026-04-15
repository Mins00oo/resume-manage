package com.resumemanage.file.application;

public record FileStorageResult(
        String originalFilename,
        String storedFilename,
        String filePath,
        String mimeType,
        long sizeBytes
) {
}
