-- Back up and select the fork database before running; safe to repeat.
SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='user' AND column_name='google_subject'), 'SELECT 1', 'ALTER TABLE `user` ADD COLUMN google_subject VARCHAR(255) NULL');
PREPARE migration FROM @ddl; EXECUTE migration; DEALLOCATE PREPARE migration;
SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='user' AND column_name='google_subject' AND non_unique=0), 'SELECT 1', 'CREATE UNIQUE INDEX google_subject_unique ON `user`(google_subject)');
PREPARE migration FROM @ddl; EXECUTE migration; DEALLOCATE PREPARE migration;
