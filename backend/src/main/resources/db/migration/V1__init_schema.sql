-- =====================================================================
-- Resume Manage - Initial schema (v1.0)
-- Target: MySQL 8.x, InnoDB, utf8mb4
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    google_sub          VARCHAR(100) NOT NULL COMMENT 'Google OAuth sub claim',
    email               VARCHAR(255) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    profile_image_url   VARCHAR(500) NULL,
    last_login_at       DATETIME(6)  NULL,
    created_at          DATETIME(6)  NOT NULL,
    updated_at          DATETIME(6)  NOT NULL,
    deleted_at          DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_google_sub (google_sub),
    UNIQUE KEY uk_users_email (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='사용자';

-- ---------------------------------------------------------------------
-- uploaded_files
-- ---------------------------------------------------------------------
CREATE TABLE uploaded_files (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    user_id             BIGINT       NOT NULL,
    original_filename   VARCHAR(255) NOT NULL COMMENT '사용자가 업로드한 원본 파일명',
    stored_filename     VARCHAR(255) NOT NULL COMMENT '서버 저장 파일명 (UUID 기반)',
    file_path           VARCHAR(500) NOT NULL COMMENT '디스크 경로',
    mime_type           VARCHAR(100) NOT NULL,
    size_bytes          BIGINT       NOT NULL,
    created_at          DATETIME(6)  NOT NULL,
    deleted_at          DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_uploaded_files_user_id (user_id),
    CONSTRAINT fk_uploaded_files_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='업로드 파일';

-- ---------------------------------------------------------------------
-- resumes
-- ---------------------------------------------------------------------
CREATE TABLE resumes (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    user_id             BIGINT       NOT NULL,
    title               VARCHAR(200) NOT NULL,
    is_master           TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '대표 이력서 여부',
    completion_rate     SMALLINT     NOT NULL DEFAULT 0 COMMENT '완성도 0~100',
    hidden_sections     JSON         NULL     COMMENT 'PDF 제외 섹션 이름 리스트',
    created_at          DATETIME(6)  NOT NULL,
    updated_at          DATETIME(6)  NOT NULL,
    deleted_at          DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_resumes_user_id (user_id),
    KEY idx_resumes_user_master (user_id, is_master),
    CONSTRAINT fk_resumes_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서';

-- ---------------------------------------------------------------------
-- resume_basic_info (1:1 with resumes)
-- ---------------------------------------------------------------------
CREATE TABLE resume_basic_info (
    resume_id               BIGINT       NOT NULL,
    name_ko                 VARCHAR(50)  NULL,
    name_en                 VARCHAR(100) NULL,
    gender                  VARCHAR(10)  NULL COMMENT 'MALE / FEMALE / OTHER',
    birth_date              DATE         NULL,
    email                   VARCHAR(255) NULL,
    phone                   VARCHAR(20)  NULL,
    address                 VARCHAR(300) NULL,
    profile_image_file_id   BIGINT       NULL,
    short_intro             VARCHAR(500) NULL,
    military_status         VARCHAR(20)  NULL COMMENT 'EXEMPTED / COMPLETED / UNFULFILLED / NOT_APPLICABLE',
    disability_status       TINYINT(1)   NOT NULL DEFAULT 0,
    veteran_status          TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (resume_id),
    KEY idx_resume_basic_info_profile_file (profile_image_file_id),
    CONSTRAINT fk_resume_basic_info_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_basic_info_file
        FOREIGN KEY (profile_image_file_id) REFERENCES uploaded_files (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 기본정보';

-- ---------------------------------------------------------------------
-- resume_educations
-- ---------------------------------------------------------------------
CREATE TABLE resume_educations (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id           BIGINT       NOT NULL,
    school_name         VARCHAR(100) NULL,
    major               VARCHAR(100) NULL,
    degree              VARCHAR(20)  NULL COMMENT 'HIGH_SCHOOL / ASSOCIATE / BACHELOR / MASTER / DOCTOR',
    start_date          DATE         NULL,
    end_date            DATE         NULL,
    graduation_status   VARCHAR(20)  NULL COMMENT 'ENROLLED / GRADUATED / WITHDRAWN / LEAVE_OF_ABSENCE',
    gpa                 DECIMAL(3,2) NULL,
    gpa_max             DECIMAL(3,2) NULL,
    order_index         SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_educations_resume_id (resume_id),
    CONSTRAINT fk_resume_educations_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 학력';

-- ---------------------------------------------------------------------
-- resume_careers
-- ---------------------------------------------------------------------
CREATE TABLE resume_careers (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id           BIGINT       NOT NULL,
    company_name        VARCHAR(100) NULL,
    position            VARCHAR(100) NULL,
    department          VARCHAR(100) NULL,
    start_date          DATE         NULL,
    end_date            DATE         NULL,
    is_current          TINYINT(1)   NOT NULL DEFAULT 0,
    responsibilities    TEXT         NULL,
    order_index         SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_careers_resume_id (resume_id),
    CONSTRAINT fk_resume_careers_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 경력';

-- ---------------------------------------------------------------------
-- resume_career_projects (AI 검증 대상)
-- ---------------------------------------------------------------------
CREATE TABLE resume_career_projects (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    career_id       BIGINT       NOT NULL,
    title           VARCHAR(200) NULL,
    start_date      DATE         NULL,
    end_date        DATE         NULL,
    description     TEXT         NULL COMMENT 'AI 검증 대상 필드',
    order_index     SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_career_projects_career_id (career_id),
    CONSTRAINT fk_resume_career_projects_career
        FOREIGN KEY (career_id) REFERENCES resume_careers (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 경력 내 프로젝트';

-- ---------------------------------------------------------------------
-- resume_languages
-- ---------------------------------------------------------------------
CREATE TABLE resume_languages (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id       BIGINT       NOT NULL,
    language        VARCHAR(50)  NULL,
    test_name       VARCHAR(50)  NULL,
    score           VARCHAR(20)  NULL,
    acquired_at     DATE         NULL,
    order_index     SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_languages_resume_id (resume_id),
    CONSTRAINT fk_resume_languages_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 어학';

-- ---------------------------------------------------------------------
-- resume_certificates
-- ---------------------------------------------------------------------
CREATE TABLE resume_certificates (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id       BIGINT       NOT NULL,
    name            VARCHAR(100) NULL,
    issuer          VARCHAR(100) NULL,
    acquired_at     DATE         NULL,
    order_index     SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_certificates_resume_id (resume_id),
    CONSTRAINT fk_resume_certificates_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 자격';

-- ---------------------------------------------------------------------
-- resume_awards
-- ---------------------------------------------------------------------
CREATE TABLE resume_awards (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id       BIGINT       NOT NULL,
    title           VARCHAR(200) NULL,
    issuer          VARCHAR(100) NULL,
    awarded_at      DATE         NULL,
    description     TEXT         NULL,
    order_index     SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_awards_resume_id (resume_id),
    CONSTRAINT fk_resume_awards_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 수상';

-- ---------------------------------------------------------------------
-- resume_trainings
-- ---------------------------------------------------------------------
CREATE TABLE resume_trainings (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id       BIGINT       NOT NULL,
    name            VARCHAR(200) NULL,
    institution     VARCHAR(100) NULL,
    start_date      DATE         NULL,
    end_date        DATE         NULL,
    description     TEXT         NULL,
    order_index     SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_trainings_resume_id (resume_id),
    CONSTRAINT fk_resume_trainings_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 교육';

-- ---------------------------------------------------------------------
-- resume_cover_letter (1:1)
-- ---------------------------------------------------------------------
CREATE TABLE resume_cover_letter (
    resume_id       BIGINT       NOT NULL,
    type            VARCHAR(20)  NOT NULL DEFAULT 'FREE' COMMENT 'FREE / STRUCTURED',
    free_text       TEXT         NULL COMMENT 'FREE 타입일 때 사용, STRUCTURED 전환 시에도 보존',
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (resume_id),
    CONSTRAINT fk_resume_cover_letter_resume
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 자기소개서';

-- ---------------------------------------------------------------------
-- resume_cover_letter_sections (STRUCTURED 타입 문항별)
-- ---------------------------------------------------------------------
CREATE TABLE resume_cover_letter_sections (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    resume_id       BIGINT       NOT NULL,
    question        VARCHAR(500) NULL,
    answer          TEXT         NULL COMMENT 'AI 검증 대상 필드',
    char_limit      INT          NULL,
    order_index     SMALLINT     NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_resume_cover_letter_sections_resume_id (resume_id),
    CONSTRAINT fk_resume_cover_letter_sections_cover_letter
        FOREIGN KEY (resume_id) REFERENCES resume_cover_letter (resume_id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='이력서 - 자기소개서 문항';

-- ---------------------------------------------------------------------
-- job_applies
-- ---------------------------------------------------------------------
CREATE TABLE job_applies (
    id                          BIGINT        NOT NULL AUTO_INCREMENT,
    user_id                     BIGINT        NOT NULL,
    company                     VARCHAR(100)  NOT NULL,
    position                    VARCHAR(100)  NULL,
    job_posting_url             VARCHAR(1000) NULL,
    employment_type             VARCHAR(20)   NULL COMMENT 'NEW / EXPERIENCED / INTERN / CONTRACT',
    channel                     VARCHAR(50)   NULL,
    deadline                    DATE          NULL,
    submitted_at                DATE          NULL,
    current_status              VARCHAR(30)   NOT NULL DEFAULT 'DRAFT' COMMENT '15 states enum',
    went_through_document       TINYINT(1)    NOT NULL DEFAULT 0,
    went_through_coding         TINYINT(1)    NOT NULL DEFAULT 0,
    went_through_assignment     TINYINT(1)    NOT NULL DEFAULT 0,
    went_through_interview      TINYINT(1)    NOT NULL DEFAULT 0,
    memo                        TEXT          NULL,
    created_at                  DATETIME(6)   NOT NULL,
    updated_at                  DATETIME(6)   NOT NULL,
    deleted_at                  DATETIME(6)   NULL,
    PRIMARY KEY (id),
    KEY idx_job_applies_user_status (user_id, current_status),
    KEY idx_job_applies_user_submitted (user_id, submitted_at),
    KEY idx_job_applies_user_deadline (user_id, deadline),
    CONSTRAINT fk_job_applies_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='지원 내역';

-- ---------------------------------------------------------------------
-- push_subscriptions
-- ---------------------------------------------------------------------
CREATE TABLE push_subscriptions (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    user_id                 BIGINT       NOT NULL,
    endpoint                VARCHAR(500) NOT NULL,
    p256dh_key              VARCHAR(255) NOT NULL,
    auth_key                VARCHAR(255) NOT NULL,
    user_agent              VARCHAR(300) NULL,
    notifications_enabled   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at              DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_push_subscriptions_endpoint (endpoint),
    KEY idx_push_subscriptions_user_id (user_id),
    CONSTRAINT fk_push_subscriptions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  COMMENT ='PWA 푸시 구독';
