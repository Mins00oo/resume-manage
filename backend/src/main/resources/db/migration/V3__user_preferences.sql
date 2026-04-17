-- =====================================================================
-- V3: user_preferences 테이블 신설
-- =====================================================================

SET NAMES utf8mb4;

CREATE TABLE user_preferences (
    id                                  BIGINT       NOT NULL AUTO_INCREMENT,
    user_id                             BIGINT       NOT NULL,
    theme                               VARCHAR(10)  NOT NULL DEFAULT 'system' COMMENT 'light / dark / system',
    deadline_notifications_enabled      TINYINT(1)   NOT NULL DEFAULT 1,
    interview_notifications_enabled     TINYINT(1)   NOT NULL DEFAULT 1,
    google_calendar_sync_enabled        TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '준비 중 (UI 토글만)',
    created_at                          DATETIME(6)  NOT NULL,
    updated_at                          DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_preferences_user_id (user_id),
    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='사용자별 설정';
