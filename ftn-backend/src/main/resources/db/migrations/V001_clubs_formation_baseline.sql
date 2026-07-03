-- V001: Baseline for clubs + formation rebuild (Phase 0)
--
-- These columns are already applied automatically by Hibernate via
-- spring.jpa.hibernate.ddl-auto=update when the backend starts. This script
-- exists purely for team sync: run it manually via phpMyAdmin on any
-- database instance that hasn't been started against the latest entities yet
-- (e.g. a coworker's local DB, or a staging DB you don't want to point
-- ddl-auto at). Safe to re-run: every statement is idempotent-checked.

-- ── club: requirements + status fields ──────────────────────────────────────
ALTER TABLE club
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS discipline VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS max_capacity INT NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS min_age INT NULL,
  ADD COLUMN IF NOT EXISTS max_age INT NULL,
  ADD COLUMN IF NOT EXISTS required_level VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS required_discipline VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS medical_certificate_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS available_spots INT NULL;

-- ── club_join_request: structured application fields ────────────────────────
ALTER TABLE club_join_request
  ADD COLUMN IF NOT EXISTS message TEXT NULL,
  ADD COLUMN IF NOT EXISTS motivation_letter TEXT NULL,
  ADD COLUMN IF NOT EXISTS current_level VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS previous_club VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS availability VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- ── formation_certificate: already has issuedAt (LocalDate), verificationCode,
--    pdfUrl, downloadable, verified — no changes needed, listed here for
--    documentation completeness.

-- NOTE: This file captures schema state as of the clubs/formation rebuild
-- kickoff. Future schema changes should get their own V00N_description.sql
-- file in this folder, numbered sequentially.
