-- =============================================================================
-- FTN Database seed data for phpMyAdmin
-- Database: ftn-db
-- =============================================================================
-- BEFORE IMPORT:
--   1. Create database: CREATE DATABASE IF NOT EXISTS `ftn-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   2. Start the backend once so Hibernate creates all tables (ddl-auto=update)
--   3. Select `ftn-db` in phpMyAdmin, then Import this file
--
-- TEST ACCOUNTS (passwords are BCrypt-hashed):
--   admin@ftn.tn          / admin123
--   nageur@ftn.tn         / nageur123
--   nouveau.nageur@ftn.tn / azerty123
-- =============================================================================

USE `ftn-db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Optional: clear seed-related data (uncomment if you want a clean re-import)
-- TRUNCATE TABLE formation_certificate;
-- TRUNCATE TABLE formation_registration;
-- TRUNCATE TABLE formation_document;
-- TRUNCATE TABLE formation_schedule_item;
-- TRUNCATE TABLE formation_program;
-- TRUNCATE TABLE formation_season;
-- TRUNCATE TABLE performance;
-- TRUNCATE TABLE participation;
-- TRUNCATE TABLE competition_categories;
-- TRUNCATE TABLE competition;
-- TRUNCATE TABLE license;
-- TRUNCATE TABLE press_item;
-- TRUNCATE TABLE partnership_request;
-- TRUNCATE TABLE club;
-- TRUNCATE TABLE `user`;

-- -----------------------------------------------------------------------------
-- CLUB
-- -----------------------------------------------------------------------------
INSERT INTO `club` (`id`, `name`, `region`, `address`, `contact`, `manager`, `affiliation_date`, `latitude`, `longitude`, `coach_id`)
VALUES
  (1, 'Club Sportif de Tunis', 'Tunis', 'Avenue Habib Bourguiba', '71 000 000', 'Mohamed Ben Salah', '2020-01-15', 36.8065, 10.1815, NULL),
  (2, 'Olympique Sfax', 'Sfax', 'Route de Gabès', '74 000 000', 'Karim Mansouri', '2019-09-01', 34.7406, 10.7603, NULL)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `region` = VALUES(`region`),
  `address` = VALUES(`address`);

-- -----------------------------------------------------------------------------
-- USER
-- -----------------------------------------------------------------------------
INSERT INTO `user` (
  `id`, `first_name`, `last_name`, `email`, `password_hash`, `role`,
  `club_id`, `active`, `created_at`, `birth_date`, `gender`, `niveau`, `discipline`,
  `anciennete`, `registration_status`, `must_change_password`
) VALUES
  (1, 'Admin', 'FTN', 'admin@ftn.tn',
   '$2b$10$eLdIU7nppDMne8btUK0FV.bUTZnu2gOLSKqAwvJJyOuCwl1yeVz16',
   'ADMIN', NULL, 1, '2026-01-01 09:00:00', NULL, NULL, NULL, NULL, NULL, 'CONFIRMEE', 0),
  (2, 'Ahmed', 'Ben Salah', 'nageur@ftn.tn',
   '$2b$10$j1wp0yXspORxxRFBlX9iFeYjOcpJZnECZTZUoNJbog9jnrYUpIFM6',
   'SWIMMER', 1, 1, '2026-01-01 09:00:00', '2002-05-15', 'HOMME', 'SENIOR', 'NATATION', NULL, 'CONFIRMEE', 0),
  (3, 'Sami', 'Trabelsi', 'nouveau.nageur@ftn.tn',
   '$2b$10$nCMaAUXXTz2FoVxo.0NXrejk3JN/rn6UbJYTzXbQm/fdur1MXmU1S',
   'SWIMMER', NULL, 1, '2026-01-01 09:00:00', '2005-08-20', 'HOMME', 'JUNIOR', 'NATATION', NULL, 'CONFIRMEE', 0)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `active` = VALUES(`active`),
  `role` = VALUES(`role`);

-- -----------------------------------------------------------------------------
-- LICENSE
-- -----------------------------------------------------------------------------
INSERT INTO `license` (`id`, `license_number`, `season`, `issue_date`, `expiry_date`, `club_id`)
VALUES
  (1, 'LIC-2025-001', '2025-2026', '2025-09-01', '2026-08-31', 1),
  (2, 'LIC-2025-002', '2025-2026', '2025-09-01', '2026-08-31', 2)
ON DUPLICATE KEY UPDATE
  `season` = VALUES(`season`);

-- -----------------------------------------------------------------------------
-- PERFORMANCE (demo data for swimmers)
-- -----------------------------------------------------------------------------
INSERT INTO `performance` (`id`, `time`, `distance`, `stroke`, `date`, `is_personal_record`, `swimmer_id`)
VALUES
  (1, 25.92, 50, 'LIBRE', '2026-03-12', 1, 2),
  (2, 56.34, 100, 'LIBRE', '2026-04-07', 1, 2),
  (3, 124.87, 200, 'LIBRE', '2026-04-21', 1, 2),
  (4, 64.18, 100, 'DOS', '2026-05-03', 1, 2),
  (5, 71.42, 100, 'BRASSE', '2026-05-18', 1, 2),
  (6, 27.48, 50, 'PAPILLON', '2026-06-02', 1, 2),
  (7, 26.29, 50, 'LIBRE', '2026-03-12', 1, 3),
  (8, 56.71, 100, 'LIBRE', '2026-04-07', 1, 3),
  (9, 125.24, 200, 'LIBRE', '2026-04-21', 1, 3),
  (10, 64.55, 100, 'DOS', '2026-05-03', 1, 3),
  (11, 71.79, 100, 'BRASSE', '2026-05-18', 1, 3),
  (12, 27.85, 50, 'PAPILLON', '2026-06-02', 1, 3)
ON DUPLICATE KEY UPDATE
  `time` = VALUES(`time`);

-- -----------------------------------------------------------------------------
-- PRESS / ACTUALITÉS
-- -----------------------------------------------------------------------------
INSERT INTO `press_item` (
  `id_press_item`, `title`, `content`, `media_url`, `link_url`, `discipline`,
  `type`, `status`, `summary`, `author`, `views`, `scheduled_at`, `importance`,
  `read_time`, `downloads_count`, `gallery`, `documents`, `published_at`, `created_at`
) VALUES
  (1,
   'Nos Dernières Informations sur fédération tunisienne de natation - Webdo.tn',
   'Le Bureau directeur de la Fédération tunisienne de natation a annoncé sa démission dans un communiqué publié vendredi soir.',
   'https://www.webdo.tn/fr/wp-content/uploads/2026/04/Natation.jpg',
   'https://www.webdo.tn/fr/actualite/federation-tunisienne-de-natation/',
   'Général', 'ARTICLE', 'PUBLISHED', NULL, 'FTN', 10, NULL, 'NORMAL', 0, 0, NULL, NULL,
   '2026-05-22 10:53:38', '2026-05-15 14:30:53'),
  (2,
   'Natation : Hafnaoui en or, Jaouadi en argent... la Tunisie frappe fort aux NCAA',
   'La natation tunisienne a brillé aux États-Unis lors des championnats universitaires américains (NCAA).',
   'https://www.youtube.com/watch?v=FCVah2QUlKg',
   'https://www.webdo.tn/fr/actualite/sport/natation-hafnaoui-en-or-jaouadi-en-argent-la-tunisie-frappe-fort-aux-ncaa/395327/',
   'Plongeon', 'VIDEO', 'PUBLISHED', NULL, 'FTN', 27, NULL, 'NORMAL', 0, 0, NULL, NULL,
   '2026-05-22 10:54:43', '2026-05-19 21:24:48'),
  (3,
   'Ahmed Jaouadi: Double World Champion - YouTube',
   'Ahmed Jaouadi delivered a historic performance to become a double world champion.',
   'https://www.youtube.com/watch?v=RekjMo426is',
   'https://www.youtube.com/watch?v=RekjMo426is',
   'Général', 'VIDEO', 'PUBLISHED', NULL, 'FTN', 2, NULL, 'NORMAL', 0, 0, NULL, NULL,
   '2026-06-08 21:00:08', '2026-06-08 19:59:33'),
  (4,
   'Natation - South Sectional Championship : Hafnaoui domine les 400m et 1500m NL',
   'Natation - South Sectional Championship : Hafnaoui domine les 400m et 1500m NL',
   'https://www.tunisienumerique.com/wp-content/uploads/2026/06/HafnaouiTN46-1000x600.jpg',
   'https://www.tunisienumerique.com/natation-south-sectional-championship-hafnaoui-domine-les-400m-et-1500m-nl/',
   'Général', 'ARTICLE', 'PUBLISHED', NULL, 'FTN', 2, NULL, 'NORMAL', 0, 0, NULL, NULL,
   '2026-06-08 22:10:42', '2026-06-08 21:10:09')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- COMPETITIONS
-- -----------------------------------------------------------------------------
INSERT INTO `competition` (
  `id`, `name`, `description`, `discipline`, `start_date`, `end_date`, `lieu`, `region`,
  `status`, `programme_status`, `participation_deadline`, `allowed_gender`,
  `min_age`, `max_age`, `max_events`, `custom_conditions`, `license_required`,
  `medical_certificate_required`, `has_minimas`, `minima_time`, `is_archived`
) VALUES
  (1, 'Championnat National Junior 2026',
   'Compétition nationale réservée aux nageurs juniors.',
   'NATATION', '2026-07-10', '2026-07-12', 'RADES_OLYMPIQUE', 'GRAND_TUNIS',
   'PLANIFIEE', NULL, '2026-06-30', NULL, 14, 18, 3, NULL, 1, 1, 0, NULL, 0),
  (2, 'Meeting International de Sfax 2025',
   'Compétition internationale terminée - archive.',
   'NATATION', '2025-11-05', '2025-11-07', 'SFAX_MUNICIPALE', 'SFAX',
   'TERMINEE', NULL, '2025-10-20', NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `status` = VALUES(`status`);

INSERT INTO `competition_categories` (`competition_id`, `categorie`)
VALUES
  (1, 'CADETS'),
  (1, 'JUNIORS')
ON DUPLICATE KEY UPDATE
  `categorie` = VALUES(`categorie`);

-- -----------------------------------------------------------------------------
-- FORMATION SEASONS
-- -----------------------------------------------------------------------------
INSERT INTO `formation_season` (`id`, `label`, `active`, `created_at`)
VALUES
  (1, '2024-2025', 0, '2024-09-01 08:00:00'),
  (2, '2025-2026', 1, '2025-09-01 08:00:00')
ON DUPLICATE KEY UPDATE
  `active` = VALUES(`active`);

-- -----------------------------------------------------------------------------
-- FORMATION PROGRAMS
-- -----------------------------------------------------------------------------
INSERT INTO `formation_program` (
  `id`, `title`, `brevet_type`, `season_id`, `status`,
  `registration_start_date`, `registration_end_date`, `registration_location`,
  `registration_conditions`, `registration_fee`,
  `institute_address`, `institute_email`, `institute_phone`, `institute_fax`,
  `theoretical_start_date`, `theoretical_end_date`, `theoretical_location`, `theoretical_hours`,
  `theoretical_exam_date`, `theoretical_exam_time`,
  `practical_description`, `practical_period_start`, `practical_period_end`,
  `result_announcement_note`, `created_at`, `updated_at`
) VALUES
  (1, 'Brevet Fédéral 1 - Session Automne 2025', 'BF1', 2, 'PUBLISHED',
   '2026-01-01', '2026-12-31', 'Siège FTN - Tunis',
   'Être licencié FTN et majeur.', 150.00,
   'Centre National de Formation FTN', 'formation@ftn.tn', '71 111 111', NULL,
   '2026-09-01', '2026-09-15', 'Piscine Olympique de Radès', '40h',
   '2026-09-20', '09:00',
   'Stage pratique encadré dans les clubs affiliés.', '2026-10-01', '2026-11-30',
   'Résultats publiés sur le portail FTN.', '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
  (2, 'Brevet Fédéral 2 - Session Printemps 2026', 'BF2', 2, 'PUBLISHED',
   '2026-02-01', '2026-12-31', 'Siège FTN - Tunis',
   'Avoir validé le BF1.', 200.00,
   'Centre National de Formation FTN', 'formation@ftn.tn', '71 111 111', NULL,
   '2026-03-01', '2026-03-20', 'Piscine Olympique de Radès', '50h',
   '2026-03-25', '09:00',
   'Perfectionnement technique et pédagogique.', '2026-04-01', '2026-05-31',
   'Certificats disponibles après validation.', '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
  (3, 'Brevet Fédéral 1 - Archive 2024-2025', 'BF1', 1, 'PUBLISHED',
   '2024-09-01', '2024-10-31', 'Siège FTN - Tunis',
   'Session archivée.', 150.00,
   'Centre National de Formation FTN', 'formation@ftn.tn', '71 111 111', NULL,
   '2024-11-01', '2024-11-15', 'Piscine Olympique de Radès', '40h',
   '2024-11-20', '09:00',
   'Formation terminée.', '2024-12-01', '2025-01-31',
   'Session clôturée.', '2024-09-01 10:00:00', '2025-02-01 10:00:00')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- FORMATION SCHEDULE
-- -----------------------------------------------------------------------------
INSERT INTO `formation_schedule_item` (`id`, `sort_order`, `day_label`, `time_slot`, `content`, `program_id`)
VALUES
  (1, 0, 'Lundi', '09:00 - 12:00', 'Module théorique : Règlementation', 1),
  (2, 1, 'Mercredi', '14:00 - 17:00', 'Module pratique : Encadrement piscine', 1),
  (3, 0, 'Lundi', '09:00 - 12:00', 'Analyse vidéo et technique', 2),
  (4, 1, 'Jeudi', '14:00 - 17:00', 'Stage pratique BF2', 2)
ON DUPLICATE KEY UPDATE
  `content` = VALUES(`content`);

-- -----------------------------------------------------------------------------
-- FORMATION PUBLIC DOCUMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `formation_document` (`id`, `title`, `url`, `type`, `sort_order`, `program_id`)
VALUES
  (1, 'Programme détaillé BF1', 'https://www.ftn.tn/documents/bf1-programme.pdf', 'PDF', 0, 1),
  (2, 'Conditions d''inscription BF1', 'https://www.ftn.tn/documents/bf1-conditions.pdf', 'PDF', 1, 1),
  (3, 'Programme détaillé BF2', 'https://www.ftn.tn/documents/bf2-programme.pdf', 'PDF', 0, 2)
ON DUPLICATE KEY UPDATE
  `url` = VALUES(`url`);

-- -----------------------------------------------------------------------------
-- FORMATION REGISTRATIONS (swimmer demo)
-- -----------------------------------------------------------------------------
INSERT INTO `formation_registration` (
  `id`, `program_id`, `swimmer_id`, `status`, `registered_at`, `updated_at`,
  `eligibility_note`, `decision_note`
) VALUES
  (1, 1, 2, 'APPROVED', '2026-02-10 14:30:00', '2026-02-11 09:00:00',
   'Licence valide.', 'Inscription confirmée.'),
  (2, 2, 2, 'PENDING', '2026-03-01 11:00:00', '2026-03-01 11:00:00',
   'Demande reçue. Elle sera vérifiée par l''administration.', NULL)
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`);

-- -----------------------------------------------------------------------------
-- FORMATION CERTIFICATES
-- -----------------------------------------------------------------------------
INSERT INTO `formation_certificate` (
  `id`, `program_id`, `swimmer_id`, `verification_code`, `issued_at`, `pdf_url`,
  `downloadable`, `verified`
) VALUES
  (1, 3, 2, 'FTN-BF1-2025-AHMED-001', '2025-02-01', 'https://www.ftn.tn/certificates/bf1-ahmed.pdf', 1, 1)
ON DUPLICATE KEY UPDATE
  `verification_code` = VALUES(`verification_code`);

-- -----------------------------------------------------------------------------
-- PARTNERSHIP REQUEST (demo)
-- -----------------------------------------------------------------------------
INSERT INTO `partnership_request` (
  `id`, `nom_entreprise`, `nom_representant`, `email`, `telephone`, `adresse`,
  `site_web`, `matricule_fiscale`, `message`, `type_partenariat`, `statut`,
  `decision_notes`, `created_at`, `requester_id`
) VALUES
  (1, 'Ooredoo Tunisie', 'Youssef Khelifi', 'partenariat@ooredoo.tn', '70 000 000',
   'Centre Urbain Nord, Tunis', 'https://www.ooredoo.tn', '1234567A',    'Demande de partenariat sportif.',
   'FINANCIER', 'PENDING', NULL, '2026-01-15 10:00:00', NULL)
ON DUPLICATE KEY UPDATE
  `statut` = VALUES(`statut`);

-- -----------------------------------------------------------------------------
-- PARTICIPATION (demo competition registration)
-- -----------------------------------------------------------------------------
INSERT INTO `participation` (
  `id`, `registered_at`, `status`, `rejection_reason`, `official_time`,
  `rank_pos`, `recorded_at`, `disqualified`, `swimmer_id`, `competition_id`
) VALUES
  (1, '2026-03-01 09:00:00', 'APPROVED', NULL, NULL, NULL, NULL, 0, 2, 1)
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- TABLES CREATED BY HIBERNATE BUT NOT SEEDED HERE (remain empty until used):
--   account_token, club_join_request, competition_day, competition_event,
--   competition_series, day_part, engagement, event_series, media_comment,
--   media_item, participant_distribution, participation_audit, press_comment,
--   press_favorite, press_pin, press_reaction, program_item, sponsorship_request
-- =============================================================================
