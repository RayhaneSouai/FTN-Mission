-- =============================================================================
-- SCRIPT DE RÉINITIALISATION ET D'ALIMENTATION DE LA BASE DE DONNÉES (FTN-DB)
-- Coherence: Coach <-> Club <-> Licence <-> Validation (Saison 2025-2026)
-- =============================================================================

-- Désactiver temporairement les contraintes d'intégrité pour le nettoyage
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Nettoyage de l'existant (Suppression directe pour éviter les erreurs de TRUNCATE avec contraintes complexes)
-- On met d'abord les références circulaires à NULL pour éviter tout conflit même si FOREIGN_KEY_CHECKS = 0 pose des soucis sur certaines versions
UPDATE club SET coach_id = NULL;
UPDATE user SET club_id = NULL;

DELETE FROM app_notification;
DELETE FROM account_token;
DELETE FROM club_join_request;
DELETE FROM club_season_validation;
DELETE FROM license;
DELETE FROM participation_audit;
DELETE FROM engagement;
DELETE FROM participation;
DELETE FROM performance;
DELETE FROM press_comment;
DELETE FROM press_favorite;
DELETE FROM press_pin;
DELETE FROM press_item;
DELETE FROM sponsorship_request;
DELETE FROM partnership_request;
DELETE FROM user;
DELETE FROM club;

-- Réactiver les contraintes d'intégrité
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 2. Insertion des Clubs
-- =============================================================================
INSERT INTO club (id, name, region, address, contact, manager, affiliation_date) VALUES
(1, 'Club Sportif de Tunis', 'Tunis', 'Avenue Habib Bourguiba, Tunis', '71 000 000', 'Mohamed Ben Salah', '2020-09-01'),
(2, 'Avenir Sportif de la Marsa', 'Ariana', 'La Marsa, Tunis', '71 111 222', 'Slim Rihane', '2021-09-01'),
(3, 'Club Africain', 'Tunis', 'Parc A, Tunis', '71 333 444', 'Khelil Chaibi', '2019-09-01');

-- =============================================================================
-- 3. Insertion des Utilisateurs (Mots de passe hachés avec BCrypt pour Spring Security)
--    admin123   -> $2a$10$WqYj8iV.g0VfV9kI2Lp8t.zLzLszU2y1dF/1Y.N.F2p/G2KzE6N8e
--    coach123   -> $2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e
--    nageur123  -> $2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e
-- =============================================================================
INSERT INTO user (id, first_name, last_name, email, password_hash, role, active, registration_status, must_change_password, created_at, club_id, birth_date, gender, niveau, discipline, anciennete) VALUES
-- Administrateur (Pas de club associé)
(1, 'Admin', 'FTN', 'admin@ftn.tn', '$2a$10$WqYj8iV.g0VfV9kI2Lp8t.zLzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'ADMIN', 1, 'CONFIRMEE', 0, NOW(), NULL, '1985-06-15', 'HOMME', NULL, NULL, NULL),

-- Coachs rattachés à leurs clubs respectifs (coach.test@ftn.tn pour club 1)
(2, 'Moez', 'Gharbi', 'coach.test@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'COACH', 1, 'CONFIRMEE', 0, NOW(), 1, '1978-03-22', 'HOMME', NULL, NULL, 12),
(3, 'Sami', 'Louati', 'coach2@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'COACH', 1, 'CONFIRMEE', 0, NOW(), 2, '1982-11-05', 'HOMME', NULL, NULL, 8),
(4, 'Rim', 'El Abed', 'coach3@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'COACH', 1, 'CONFIRMEE', 0, NOW(), 3, '1988-07-19', 'FEMME', NULL, NULL, 6),

-- Nageurs
(5, 'Ahmed', 'Ben Salah', 'nageur@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'SWIMMER', 1, 'CONFIRMEE', 0, NOW(), 1, '2004-05-15', 'HOMME', 'SENIOR', 'NATATION', NULL),
(6, 'Youssef', 'Trabelsi', 'swimmer2@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'SWIMMER', 1, 'CONFIRMEE', 0, NOW(), 1, '2006-08-20', 'HOMME', 'JUNIOR', 'NATATION', NULL),
(7, 'Mariem', 'Mellouli', 'swimmer3@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'SWIMMER', 1, 'CONFIRMEE', 0, NOW(), 2, '2008-10-12', 'FEMME', 'CADET', 'NATATION', NULL),
(8, 'Yasmine', 'Smaoui', 'swimmer4@ftn.tn', '$2a$10$tZbe17b2p/s413.2h0v/W.LzLszU2y1dF/1Y.N.F2p/G2KzE6N8e', 'SWIMMER', 1, 'CONFIRMEE', 0, NOW(), 3, '2007-04-30', 'FEMME', 'CADET', 'NATATION', NULL);

-- =============================================================================
-- 4. Liaison des coachs aux tables clubs
-- =============================================================================
UPDATE club SET coach_id = 2 WHERE id = 1;
UPDATE club SET coach_id = 3 WHERE id = 2;
UPDATE club SET coach_id = 4 WHERE id = 3;

-- =============================================================================
-- 5. Validations de Saisons (Coachs -> Clubs)
--    Pour le Club 1 (Club Sportif de Tunis), la saison 2025-2026 est DÉJÀ VALIDÉE
--    Pour le Club 2, elle est refusée. Le Club 3 n'a pas encore validé (PENDING)
-- =============================================================================
INSERT INTO club_season_validation (club_id, season, is_validated, validated_at, validated_by_id) VALUES
(1, '2025-2026', 1, NOW(), 2),
(2, '2025-2026', 0, NOW(), 3);

-- =============================================================================
-- 6. Insertion des Licences
--    La licence pour Club Sportif de Tunis sera marquée comme VALIDATED grâce
--    à la présence de la validation ci-dessus.
--    La licence pour Club 2 sera REFUSED.
--    La licence pour Club 3 est PENDING.
-- =============================================================================
INSERT INTO license (id, license_number, season, issue_date, expiry_date, club_id, swimmer_id, validation_status) VALUES
(1, 'LIC-TUNIS-1-2025-2026-9f8e7d6c', '2025-2026', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 1, 5, 'VALIDATED'),
(2, 'LIC-ARIANA-2-2025-2026-8f7e6d5c', '2025-2026', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 2, 7, 'REFUSED'),
(3, 'LIC-TUNIS-3-2025-2026-7f6e5d4c', '2025-2026', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 3, 8, 'PENDING');

-- =============================================================================
-- 7. Insertion de Notifications Initiales
-- =============================================================================
INSERT INTO app_notification (id, type, title, message, target_role, target_user_id, club_id, club_name, season, created_by_user_id, created_by_name, read_flag, created_at) VALUES
(1, 'SEASON_VALIDATION_REQUEST', 'Validation de licence en attente', 'Une nouvelle licence (LIC-TUNIS-3-2025-2026-7f6e5d4c) pour le club Club Africain est en attente de validation pour la saison 2025-2026.', 'COACH', 4, 3, 'Club Africain', '2025-2026', 1, 'Admin FTN', 0, NOW());
