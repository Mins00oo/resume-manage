package com.resumemanage.resume.application.pdf;

/**
 * PDF 생성 결과 — 파일 바이트와 제안된 파일명을 함께 전달한다.
 * 컨트롤러가 리소스를 재조회하지 않아도 되도록 한다.
 */
public record ResumePdfResult(
        byte[] bytes,
        String filename
) {
}
