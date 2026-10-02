-- Run against the personal fork database only.
-- Existing installations need this enum change; Hibernate update may not apply it.
ALTER TABLE `user` MODIFY COLUMN `role` ENUM('CUSTOMER', 'STAFF', 'ADMIN') NOT NULL;
