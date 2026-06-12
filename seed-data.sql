-- ============================================
-- SEED DATA FOR STOCK PRODUCT MANAGEMENT SYSTEM
-- Run this AFTER schema.sql to populate initial data
-- ============================================

-- Insert Default Users
INSERT INTO app_users (username, password, name, role) VALUES
('admin', '123456', 'Administrator', 'admin'),
('user', '123456', 'Demo User', 'user');

-- Insert Products (with initial quantity)
INSERT INTO products (sku, name, description, category, cost_price, selling_price, barcode, image_url, quantity, safety_stock) VALUES
('COF-ARAB-250', 'Premium Arabica Coffee Beans (250g)', 'Medium roasted high-grown organic Arabica coffee beans.', 'Food & Beverage', 120.00, 250.00, '8850123456789', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80', 85, 10),
('MUG-CER-WHT', 'Minimalist Ceramic Mug (White)', 'Matte finish 350ml ceramic coffee mug.', 'Kitchenware', 80.00, 180.00, '8850123456790', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', 42, 5),
('APP-IPH-15PRO', 'iPhone 15 Pro Max (256GB, Black Titanium)', 'Latest Apple smartphone with 256GB storage.', 'Electronics', 38000.00, 48900.00, '190199222333', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80', 8, 3),
('TEE-OVR-BLK-M', 'Oversized Cotton Tee (Black, M)', 'Heavyweight 100% organic cotton basic t-shirt.', 'Apparel', 250.00, 590.00, '8850123456791', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80', 200, 20),
('DESK-MAT-GRY', 'Premium Felt Desk Mat (Gray)', 'Anti-slip wool felt desk pad (800x400mm) for workstations.', 'Office Supplies', 300.00, 650.00, '8850123456792', 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80', 80, 15);

-- Insert Initial Stock Transactions (history)
-- Note: These will trigger process_stock_transaction() to update product quantities
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes)
SELECT
    (SELECT id FROM products WHERE sku = 'COF-ARAB-250'),
    'IN', 100, 'Initial purchase order receive'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'),
    'IN', 50, 'Initial purchase order receive'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'APP-IPH-15PRO'),
    'IN', 10, 'Initial secure batch import'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'),
    'IN', 200, 'Bulk arrival'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'DESK-MAT-GRY'),
    'IN', 80, 'Bulk arrival'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'COF-ARAB-250'),
    'OUT', 15, 'Retail shop sale POS-001'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'),
    'OUT', 8, 'Retail shop sale POS-002'
UNION ALL
SELECT
    (SELECT id FROM products WHERE sku = 'APP-IPH-15PRO'),
    'OUT', 2, 'Online order Shopify #1042';

-- Insert default KPI sales target (monthly)
INSERT INTO app_settings (key, value, description) VALUES
('kpi_monthly_sales_target', '50000', 'Monthly sales target in THB');

-- ============================================
-- END OF SEED DATA
-- ============================================
