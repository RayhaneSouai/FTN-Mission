-- V003: Club affiliation is optional for users
--
-- A swimmer/coach may register without a club and join one later via the
-- club join workflow. Safe to re-run.

ALTER TABLE `user`
  MODIFY COLUMN `club_id` BIGINT NULL;
