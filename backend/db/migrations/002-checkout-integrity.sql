-- Run after a backup, against the fork database selected by your MySQL client.
-- Safe to repeat: add only missing version/idempotency schema elements.
SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='products' AND column_name='version'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN version BIGINT NOT NULL DEFAULT 0');
PREPARE migration FROM @ddl; EXECUTE migration; DEALLOCATE PREPARE migration;
SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='orders' AND column_name='checkout_key'), 'SELECT 1', 'ALTER TABLE orders ADD COLUMN checkout_key VARCHAR(36) NULL');
PREPARE migration FROM @ddl; EXECUTE migration; DEALLOCATE PREPARE migration;
SET @ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='orders' AND column_name='checkout_key' AND non_unique=0), 'SELECT 1', 'CREATE UNIQUE INDEX checkout_key_unique ON orders(checkout_key)');
PREPARE migration FROM @ddl; EXECUTE migration; DEALLOCATE PREPARE migration;
