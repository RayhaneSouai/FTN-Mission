-- V002: Swimmer training programs alongside coach BF1/BF2 certification.
--
-- As with V001, Hibernate ddl-auto=update applies these automatically when
-- the backend starts against a dev DB. Run manually via phpMyAdmin/mysql CLI
-- on any DB instance you don't want auto-migrated.
--
-- Existing formation_program rows are unaffected: program_type defaults to
-- COACH_CERTIFICATION, brevet_type stays populated for them, and all new
-- columns are nullable.

ALTER TABLE formation_program
  ADD COLUMN IF NOT EXISTS program_type ENUM('COACH_CERTIFICATION','SWIMMER_TRAINING') NOT NULL DEFAULT 'COACH_CERTIFICATION',
  MODIFY brevet_type VARCHAR(10) NULL,
  ADD COLUMN IF NOT EXISTS target_category ENUM('AVENIRS','BENJAMINS','MINIMES','CADETS','JUNIORS','SENIORS') NULL,
  ADD COLUMN IF NOT EXISTS max_participants INT NULL,
  ADD COLUMN IF NOT EXISTS coach_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS price_per_session DECIMAL(10,2) NULL;

-- Only add the FK if it doesn't already exist (MySQL has no ADD CONSTRAINT IF NOT EXISTS)
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'formation_program'
    AND CONSTRAINT_NAME = 'fk_formation_coach'
);
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE formation_program ADD CONSTRAINT fk_formation_coach FOREIGN KEY (coach_id) REFERENCES user(id)',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS training_session (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  program_id BIGINT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  status ENUM('SCHEDULED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  CONSTRAINT fk_session_program FOREIGN KEY (program_id) REFERENCES formation_program(id) ON DELETE CASCADE
);
