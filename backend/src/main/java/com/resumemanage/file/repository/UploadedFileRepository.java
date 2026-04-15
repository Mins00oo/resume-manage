package com.resumemanage.file.repository;

import com.resumemanage.file.domain.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {

    List<UploadedFile> findAllByUserIdAndDeletedAtIsNull(Long userId);
}
