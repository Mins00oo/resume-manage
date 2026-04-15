package com.resumemanage.file.presentation;

import com.resumemanage.common.dto.ApiResponse;
import com.resumemanage.common.security.CurrentUser;
import com.resumemanage.file.application.UploadedFileService;
import com.resumemanage.file.domain.UploadedFile;
import com.resumemanage.file.dto.UploadedFileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final UploadedFileService uploadedFileService;

    @PostMapping
    public ApiResponse<UploadedFileResponse> upload(
            @AuthenticationPrincipal CurrentUser me,
            @RequestParam("file") MultipartFile file
    ) {
        UploadedFile uploaded = uploadedFileService.upload(me.userId(), file);
        return ApiResponse.ok(UploadedFileResponse.from(uploaded));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal CurrentUser me,
            @PathVariable Long id
    ) {
        UploadedFile uploaded = uploadedFileService.getOwned(id, me.userId());
        Resource resource = uploadedFileService.loadFileAsResource(uploaded);

        String encodedFilename = URLEncoder.encode(uploaded.getOriginalFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(uploaded.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + encodedFilename + "\"; filename*=UTF-8''" + encodedFilename)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal CurrentUser me,
            @PathVariable Long id
    ) {
        uploadedFileService.delete(id, me.userId());
        return ApiResponse.ok();
    }
}
