package com.resumemanage.file.application;

import com.resumemanage.common.exception.BusinessException;
import com.resumemanage.common.exception.ErrorCode;
import com.resumemanage.file.domain.UploadedFile;
import com.resumemanage.file.repository.UploadedFileRepository;
import com.resumemanage.user.domain.User;
import com.resumemanage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UploadedFileService {

    private final UploadedFileRepository uploadedFileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UploadedFile upload(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        FileStorageResult result = fileStorageService.store(file, userId);

        UploadedFile uploadedFile = UploadedFile.builder()
                .user(user)
                .originalFilename(result.originalFilename())
                .storedFilename(result.storedFilename())
                .filePath(result.filePath())
                .mimeType(result.mimeType())
                .sizeBytes(result.sizeBytes())
                .build();

        UploadedFile saved = uploadedFileRepository.save(uploadedFile);

        log.info("File uploaded: userId={}, originalFilename={}, sizeBytes={}",
                userId, result.originalFilename(), result.sizeBytes());

        return saved;
    }

    @Transactional(readOnly = true)
    public UploadedFile getOwned(Long fileId, Long userId) {
        UploadedFile uploadedFile = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "파일을 찾을 수 없습니다."));

        if (uploadedFile.isDeleted()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "파일을 찾을 수 없습니다.");
        }

        if (!uploadedFile.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return uploadedFile;
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(UploadedFile uploadedFile) {
        return fileStorageService.loadAsResource(uploadedFile.getFilePath());
    }

    public void delete(Long fileId, Long userId) {
        UploadedFile uploadedFile = getOwned(fileId, userId);
        uploadedFile.softDelete();
    }
}
