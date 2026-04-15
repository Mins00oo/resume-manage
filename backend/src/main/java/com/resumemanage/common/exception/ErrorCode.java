package com.resumemanage.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // Auth
    UNAUTHORIZED("AUTH_001", HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_TOKEN("AUTH_002", HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    FORBIDDEN("AUTH_003", HttpStatus.FORBIDDEN, "권한이 없습니다."),

    // Common
    BAD_REQUEST("COMMON_001", HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    NOT_FOUND("COMMON_002", HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다."),
    INTERNAL_ERROR("COMMON_999", HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),

    // Resume
    RESUME_NOT_FOUND("RESUME_001", HttpStatus.NOT_FOUND, "이력서를 찾을 수 없습니다."),
    RESUME_FORBIDDEN("RESUME_002", HttpStatus.FORBIDDEN, "해당 이력서에 접근할 수 없습니다."),

    // JobApply
    JOB_APPLY_NOT_FOUND("JOB_APPLY_001", HttpStatus.NOT_FOUND, "지원 내역을 찾을 수 없습니다."),
    INVALID_STATUS_TRANSITION("JOB_APPLY_002", HttpStatus.BAD_REQUEST, "유효하지 않은 상태 전이입니다."),

    // User
    USER_NOT_FOUND("USER_001", HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");

    private final String code;
    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(String code, HttpStatus httpStatus, String defaultMessage) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
