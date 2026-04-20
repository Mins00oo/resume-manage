-- =====================================================================
-- V4: resume_certificates 에 고유번호 · 점수/등급 컬럼 추가
-- =====================================================================

SET NAMES utf8mb4;

ALTER TABLE resume_certificates
    ADD COLUMN certificate_number VARCHAR(100) NULL COMMENT '자격증 고유번호 (예: JMF-2401-00123)',
    ADD COLUMN score              VARCHAR(50)  NULL COMMENT '점수/등급 자유 문자열 (예: 1급, 합격, 920점)';
