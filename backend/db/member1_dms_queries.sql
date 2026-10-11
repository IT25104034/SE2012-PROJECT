-- Member 1: four demonstration queries for the revised schema.
-- Select your migrated database first; these queries do not alter data.

-- 1. Available catalogue products with category and current stock.
SELECT p.product_id, p.product_name, c.category_name, p.unit_price,
       i.quantity_on_hand
FROM product p JOIN category c ON c.category_id = p.category_id
JOIN inventory i ON i.product_id = p.product_id
WHERE p.is_active = TRUE AND c.is_active = TRUE
ORDER BY p.product_name;

-- 2. Number of active products and mean price in each active category.
SELECT c.category_id, c.category_name, COUNT(p.product_id) AS product_count,
       ROUND(AVG(p.unit_price), 2) AS average_price
FROM category c LEFT JOIN product p
  ON p.category_id = c.category_id AND p.is_active = TRUE
WHERE c.is_active = TRUE
GROUP BY c.category_id, c.category_name ORDER BY c.category_name;

-- 3. Search active products by name in a chosen price range.
SET @search_name = 'hammer', @minimum_price = 0.00, @maximum_price = 5000.00;
SELECT p.product_id, p.product_name, p.unit_price, c.category_name
FROM product p JOIN category c ON c.category_id = p.category_id
WHERE p.is_active = TRUE AND c.is_active = TRUE
  AND p.product_name LIKE CONCAT('%', @search_name, '%')
  AND p.unit_price BETWEEN @minimum_price AND @maximum_price
ORDER BY p.unit_price;

-- 4. Stock at/below the reorder level (Inventory belongs to Member 3).
SELECT p.product_id, p.product_name, c.category_name,
       i.quantity_on_hand, i.reorder_level
FROM product p JOIN category c ON c.category_id = p.category_id
JOIN inventory i ON i.product_id = p.product_id
WHERE p.is_active = TRUE AND c.is_active = TRUE
  AND i.quantity_on_hand <= i.reorder_level
ORDER BY i.quantity_on_hand, p.product_name;
