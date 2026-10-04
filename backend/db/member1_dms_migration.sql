-- One-time migration of the current plural Category/Product schema to the revised DMS design.
-- NOT run by Spring Boot. Stop the app, back up the FULL database, and rehearse on a copy.
-- Select the intended database before running. Requires MySQL 8.0.16+ (enforced CHECKs).
-- DDL commits implicitly: restore the backup on failure; do not blindly rerun a partial migration.
-- All original product/category IDs remain unchanged; MySQL updates existing FK references
-- during RENAME TABLE. No role, staff, cart, or order schema migration is included here.
DELIMITER $$
CREATE PROCEDURE migrate_member1_dms()
BEGIN
    IF DATABASE() IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Select the backed-up target database first';
    END IF;
    IF (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()
        AND table_name IN ('categories', 'products')) <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expected original categories and products tables';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE()
        AND table_name IN ('category', 'product', 'inventory')) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Target tables already exist; investigate before migration';
    END IF;
    IF EXISTS (SELECT name FROM categories GROUP BY name HAVING COUNT(*) > 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Resolve duplicate category names before migration';
    END IF;
    IF EXISTS (SELECT 1 FROM categories WHERE name IS NULL OR TRIM(name) = ''
        OR CHAR_LENGTH(name) > 100 OR CHAR_LENGTH(description) > 500) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid category data; correct before migration';
    END IF;
    IF EXISTS (SELECT 1 FROM products WHERE name IS NULL OR TRIM(name) = ''
        OR CHAR_LENGTH(name) > 150 OR CHAR_LENGTH(image_url) > 500
        OR price IS NULL OR price <= 0 OR price > 99999999.99
        OR quantity IS NULL OR quantity < 0 OR category_id IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid product data; correct before migration';
    END IF;
    IF EXISTS (SELECT 1 FROM products p LEFT JOIN categories c ON c.category_id = p.category_id
        WHERE c.category_id IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Products contain missing category references';
    END IF;

    RENAME TABLE categories TO category, products TO product;
    ALTER TABLE category
        CHANGE COLUMN name category_name VARCHAR(100) NOT NULL,
        MODIFY COLUMN description VARCHAR(500),
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        ADD CONSTRAINT uq_category_name UNIQUE (category_name);
    ALTER TABLE product
        CHANGE COLUMN name product_name VARCHAR(150) NOT NULL,
        CHANGE COLUMN price unit_price DECIMAL(10,2) NOT NULL,
        MODIFY COLUMN description TEXT,
        MODIFY COLUMN image_url VARCHAR(500),
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        ADD CONSTRAINT chk_product_unit_price CHECK (unit_price > 0);
    CREATE TABLE inventory (
        inventory_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT NOT NULL,
        quantity_on_hand INT NOT NULL DEFAULT 0,
        reorder_level INT NOT NULL DEFAULT 0,
        last_updated DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT uq_inventory_product UNIQUE (product_id),
        CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES product(product_id),
        CONSTRAINT chk_inventory_quantity CHECK (quantity_on_hand >= 0),
        CONSTRAINT chk_inventory_reorder CHECK (reorder_level >= 0)
    );
    INSERT INTO inventory (product_id, quantity_on_hand, reorder_level)
        SELECT product_id, quantity, 0 FROM product;
    IF (SELECT COUNT(*) FROM inventory) <> (SELECT COUNT(*) FROM product)
        OR EXISTS (SELECT 1 FROM product p LEFT JOIN inventory i ON i.product_id = p.product_id
                   WHERE i.product_id IS NULL OR i.quantity_on_hand <> p.quantity) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock verification failed; restore the backup';
    END IF;
    ALTER TABLE product DROP COLUMN quantity;
END$$
DELIMITER ;
CALL migrate_member1_dms();
DROP PROCEDURE migrate_member1_dms;

-- Check these counts and compare against the pre-migration backup.
SELECT COUNT(*) AS category_count FROM category;
SELECT COUNT(*) AS product_count FROM product;
SELECT COUNT(*) AS inventory_count, SUM(quantity_on_hand) AS total_stock FROM inventory;
SELECT p.product_id, p.product_name, i.quantity_on_hand
FROM product p JOIN inventory i ON i.product_id = p.product_id ORDER BY p.product_id;
