-- Idempotent: use procedures to handle columns that may already exist from a prior partial run.

DROP PROCEDURE IF EXISTS __v2_add_columns;

DELIMITER //
CREATE PROCEDURE __v2_add_columns()
BEGIN
    -- address_detail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'resume_basic_info' AND column_name = 'address_detail') THEN
        ALTER TABLE resume_basic_info ADD COLUMN address_detail VARCHAR(200) NULL;
    END IF;

    -- career_description_file_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'resume_basic_info' AND column_name = 'career_description_file_id') THEN
        ALTER TABLE resume_basic_info ADD COLUMN career_description_file_id BIGINT NULL;
        ALTER TABLE resume_basic_info ADD CONSTRAINT fk_career_desc_file
            FOREIGN KEY (career_description_file_id) REFERENCES uploaded_file(id);
    END IF;

    -- portfolio_file_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'resume_basic_info' AND column_name = 'portfolio_file_id') THEN
        ALTER TABLE resume_basic_info ADD COLUMN portfolio_file_id BIGINT NULL;
        ALTER TABLE resume_basic_info ADD CONSTRAINT fk_portfolio_file
            FOREIGN KEY (portfolio_file_id) REFERENCES uploaded_file(id);
    END IF;

    -- employment_type on careers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'resume_careers' AND column_name = 'employment_type') THEN
        ALTER TABLE resume_careers ADD COLUMN employment_type VARCHAR(20) NULL;
    END IF;
END //
DELIMITER ;

CALL __v2_add_columns();
DROP PROCEDURE IF EXISTS __v2_add_columns;
