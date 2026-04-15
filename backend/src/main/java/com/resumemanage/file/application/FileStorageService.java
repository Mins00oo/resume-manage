package com.resumemanage.file.application;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.file.infrastructure.FileStorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@EnableConfigurationProperties(FileStorageProperties.class)
public class FileStorageService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final FileStorageProperties properties;

    public FileStorageResult store(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty() || file.getSize() <= 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "빈 파일은 업로드할 수 없습니다.");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "지원하지 않는 파일 형식입니다.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "unnamed";
        }

        String extension = extractExtension(originalFilename, mimeType);
        String storedFilename = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        String monthSegment = LocalDate.now().format(MONTH_FORMATTER);
        Path target = Paths.get(properties.rootPath(), String.valueOf(userId), monthSegment, storedFilename)
                .toAbsolutePath()
                .normalize();

        try {
            Path parent = target.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store uploaded file for userId={}, originalFilename={}", userId, originalFilename, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "파일 저장에 실패했습니다.");
        }

        return new FileStorageResult(
                originalFilename,
                storedFilename,
                target.toString(),
                mimeType.toLowerCase(),
                file.getSize()
        );
    }

    public Resource loadAsResource(String filePath) {
        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException(ErrorCode.NOT_FOUND, "파일을 찾을 수 없습니다.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "파일을 찾을 수 없습니다.");
        }
    }

    public void deleteFromDisk(String filePath) {
        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            boolean deleted = Files.deleteIfExists(path);
            if (!deleted) {
                log.warn("File not found when attempting to delete: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file from disk: {}", filePath, e);
        }
    }

    private String extractExtension(String filename, String mimeType) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < filename.length() - 1) {
            String ext = filename.substring(dotIndex + 1).toLowerCase();
            if (ext.matches("[a-z0-9]{1,10}")) {
                return ext;
            }
        }
        return switch (mimeType.toLowerCase()) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "application/pdf" -> "pdf";
            default -> "";
        };
    }
}
