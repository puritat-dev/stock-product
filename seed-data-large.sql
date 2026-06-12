-- ============================================
-- LARGE SEED DATA FOR STOCK PRODUCT MANAGEMENT SYSTEM
-- Run this AFTER schema.sql to populate with extensive test data
-- Includes 50+ products and 200+ transactions over 90 days
--
-- NOTE: If you get duplicate key errors, first clear existing data:
--   TRUNCATE stock_transactions, products, app_settings, app_users CASCADE;
--   Or use ON CONFLICT clauses which are included for users/settings
-- ============================================

-- ============================================
-- INSERT MANY PRODUCTS (50+ items across categories)
-- ============================================

INSERT INTO products (sku, name, description, category, cost_price, selling_price, barcode, image_url, quantity, safety_stock) VALUES
-- Coffee & Beverages (8 items)
('COF-ARAB-250', 'Premium Arabica Coffee Beans (250g)', 'Medium roasted high-grown organic Arabica coffee beans.', 'Food & Beverage', 120.00, 250.00, '8850123456789', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80', 85, 10),
('COF-ROB-1KG', 'Robusta Coffee Beans (1kg)', 'Dark roasted Robusta beans for strong espresso.', 'Food & Beverage', 180.00, 380.00, '8850123456790', 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80', 62, 10),
('TEA-GRN-FRU-100', 'Green Tea Fruit Fusion (100 bags)', 'Premium green tea blended with dried fruits.', 'Food & Beverage', 95.00, 195.00, '8850123456791', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80', 120, 15),
('JUI-ORG-MIX-500', 'Organic Fruit Juice Mix (500ml)', 'Cold-pressed organic fruit juice blend.', 'Food & Beverage', 35.00, 75.00, '8850123456792', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80', 200, 25),
('SOD-CAS-330', 'Craft Soda Case (330ml x 6)', 'Artisanal craft soda variety pack.', 'Food & Beverage', 85.00, 175.00, '8850123456793', 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&q=80', 45, 8),
('COF-CAP-INS', 'Coffee Capsules (30 count)', 'Compatible coffee capsules for espresso machines.', 'Food & Beverage', 280.00, 550.00, '8850123456794', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80', 95, 12),
('CHO-DAR-70G', 'Dark Chocolate Bar (70%)', 'Single-origin dark chocolate 70% cocoa.', 'Food & Beverage', 45.00, 95.00, '8850123456795', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80', 180, 20),
('HON-RAW-MAN-500', 'Raw Manuka Honey (500g)', 'New Zealand Manuka honey UMF 10+', 'Food & Beverage', 450.00, 890.00, '8850123456796', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80', 35, 5),

-- Kitchenware (6 items)
('MUG-CER-WHT', 'Minimalist Ceramic Mug (White)', 'Matte finish 350ml ceramic coffee mug.', 'Kitchenware', 80.00, 180.00, '8850123456797', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', 42, 5),
('BOWL-MIX-GLS-3L', 'Glass Mixing Bowl Set (3L)', 'Tempered glass mixing bowl with lid.', 'Kitchenware', 150.00, 320.00, '8850123456798', 'https://images.unsplash.com/photo-1584990347449-39b8e5cc8cb6?w=500&q=80', 65, 8),
('KNF-CHE-PRO-20', 'Chef Knife Pro (20cm)', 'German stainless steel chef knife.', 'Kitchenware', 580.00, 1200.00, '8850123456799', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&q=80', 28, 4),
('CUT-BAM-SET-12', 'Bamboo Utensil Set (12 pcs)', 'Eco-friendly bamboo cooking utensils.', 'Kitchenware', 220.00, 450.00, '8850123456800', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80', 55, 10),
('PAN-NON-STk-28', 'Non-Stick Frying Pan (28cm)', 'Ceramic non-stick coating frying pan.', 'Kitchenware', 350.00, 720.00, '8850123456801', 'https://images.unsplash.com/photo-1584990347449-39b8e5cc8cb6?w=500&q=80', 40, 6),
('SPI-ACR-BLU-500', 'Acrylic Spice Jars (Blue, 500ml)', 'Set of 4 acrylic spice storage jars.', 'Kitchenware', 180.00, 380.00, '8850123456802', 'https://images.unsplash.com/photo-1595513643175-0927d2e3bfc7?w=500&q=80', 72, 12),

-- Electronics (7 items)
('APP-IPH-15PRO', 'iPhone 15 Pro Max (256GB, Black Titanium)', 'Latest Apple smartphone with 256GB storage.', 'Electronics', 38000.00, 48900.00, '190199222333', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80', 8, 3),
('SAM-GAL-S24U', 'Samsung Galaxy S24 Ultra (512GB)', 'Android flagship with S Pen included.', 'Electronics', 34500.00, 43900.00, '8806094212345', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80', 6, 2),
('TAB-APP-PRO-11', 'iPad Pro 11-inch (M2, 256GB)', 'Professional tablet with M2 chip.', 'Electronics', 28900.00, 35900.00, '194252890123', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80', 10, 3),
('LAP-MAC-AIR-13', 'MacBook Air 13-inch (M3, 8GB, 256GB)', 'Apple laptop with M3 chip.', 'Electronics', 42500.00, 52900.00, '194252894567', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80', 5, 2),
('MSE-LOG-MX-M3', 'Logitech MX Master 3S Mouse', 'Premium wireless mouse with ergonomic design.', 'Electronics', 2350.00, 3290.00, '097855098765', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80', 35, 8),
('KEY-CHR-K2-RGB', 'Keychron K2 RGB Keyboard', 'Wireless mechanical keyboard with RGB.', 'Electronics', 3200.00, 4500.00, '850012345678', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', 22, 5),
('USB-HUB-7P-AL', '7-Port USB-C Hub (Aluminum)', 'Multi-port USB-C hub for laptops.', 'Electronics', 450.00, 890.00, '8850123456803', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&q=80', 58, 10),

-- Apparel (8 items)
('TEE-OVR-BLK-M', 'Oversized Cotton Tee (Black, M)', 'Heavyweight 100% organic cotton basic t-shirt.', 'Apparel', 250.00, 590.00, '8850123456804', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80', 200, 20),
('HOOD-FLE-BLU-L', 'Fleece Hoodie (Blue, Large)', 'Premium cotton fleece pullover hoodie.', 'Apparel', 450.00, 990.00, '8850123456805', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80', 85, 12),
('JEA-DEN-SKI-M', 'Denim Skinny Jeans (Medium)', 'Classic fit stretch denim jeans.', 'Apparel', 580.00, 1290.00, '8850123456806', 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80', 120, 15),
('SOC-ATH-BLK-42', 'Athletic Crew Socks (Black, 42-44)', 'Moisture-wicking athletic socks (3-pack).', 'Apparel', 120.00, 280.00, '8850123456807', 'https://images.unsplash.com/photo-1586405572199-89b7b3c4e51b?w=500&q=80', 300, 40),
('CAP-BAS-BRO-UN', 'Basic Baseball Cap (Brown)', 'Classic cotton baseball cap.', 'Apparel', 180.00, 390.00, '8850123456808', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80', 95, 15),
('WIN-DOC-RED-L', 'Windbreaker Jacket (Red, Large)', 'Lightweight water-resistant windbreaker.', 'Apparel', 680.00, 1490.00, '8850123456809', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80', 45, 8),
('SHO-RUN-WHT-42', 'Running Shoes (White, EU42)', 'Lightweight mesh running sneakers.', 'Apparel', 1200.00, 2590.00, '8850123456810', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 30, 5),
('BAG-TOP-NAT-15', 'Canvas Tote Bag (Natural, 15inch)', 'Heavyweight canvas shopping tote.', 'Apparel', 150.00, 350.00, '8850123456811', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80', 180, 25),

-- Office Supplies (6 items)
('DESK-MAT-GRY', 'Premium Felt Desk Mat (Gray)', 'Anti-slip wool felt desk pad (800x400mm).', 'Office Supplies', 300.00, 650.00, '8850123456812', 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80', 80, 15),
('PEN-GEL-BLK-05', 'Gel Ink Pen (Black, 0.5mm)', 'Premium gel ink pens (box of 12).', 'Office Supplies', 85.00, 180.00, '8850123456813', 'https://images.unsplash.com/photo-1583335069099-8f8bc8b5755d?w=500&q=80', 450, 50),
('NOT-JOU-A5-LIN', 'A5 Lined Notebook Journal', 'Premium hardcover journal with bookmark.', 'Office Supplies', 65.00, 140.00, '8850123456814', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80', 320, 40),
('STA-PAP-A4-80', 'A4 Printer Paper (80gsm, 500 sheets)', 'Standard office printer paper ream.', 'Office Supplies', 85.00, 175.00, '8850123456815', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80', 850, 100),
('ORG-PLA-DIS-T5', 'Desktop Organizer Tray (5 compartments)', 'Mesh desk organizer for supplies.', 'Office Supplies', 220.00, 480.00, '8850123456816', 'https://images.unsplash.com/photo-1593100908169-37c5379a2f83?w=500&q=80', 95, 15),
('CAL-DES-WAL-A3', 'Desktop Calendar (A3, 2024)', 'Wall calendar with premium paper.', 'Office Supplies', 150.00, 320.00, '8850123456817', 'https://images.unsplash.com/photo-1505332762483-224759c4a397?w=500&q=80', 120, 20),

-- Home & Living (7 items)
('LAM-LED-DIM-TAB', 'LED Dimmable Desk Lamp', 'Modern LED desk lamp with touch control.', 'Home & Living', 480.00, 990.00, '8850123456818', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80', 42, 8),
('CUSH-VEL-NAV-45', 'Velvet Cushion Cover (Navy, 45cm)', 'Premium velvet throw pillow cover.', 'Home & Living', 180.00, 390.00, '8850123456819', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80', 165, 25),
('CAN-WOV-BEI-60', 'Woven Basket (Beige, 60cm)', 'Handwoven seagrass storage basket.', 'Home & Living', 320.00, 680.00, '8850123456820', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80', 55, 10),
('CLO-STA-MET-BLK', 'Metal Coat Stand (Black)', 'Vintage-style metal coat rack.', 'Home & Living', 680.00, 1450.00, '8850123456821', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80', 22, 4),
('MIR-LEA-STA-80', 'Leaner Mirror (80cm x 160cm)', 'Full-length floor mirror with wood frame.', 'Home & Living', 1200.00, 2590.00, '8850123456822', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&q=80', 12, 3),
('CUR-LIN-BLU-2x2', 'Linen Curtains (Blue, 2 panels)', 'Ready-made linen grommet curtains.', 'Home & Living', 850.00, 1790.00, '8850123456823', 'https://images.unsplash.com/photo-1615866949406-dd63c3085bfe?w=500&q=80', 28, 6),
('PLA-CEP-IND-12', 'Ceramic Planter with Stand (12cm)', 'Minimalist planter with wooden stand.', 'Home & Living', 280.00, 590.00, '8850123456824', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80', 65, 12),

-- Sports & Outdoors (5 items)
('YOG-MAT-ECO-6', 'Eco Yoga Mat (6mm)', 'Non-slip eco-friendly yoga mat.', 'Sports & Outdoors', 320.00, 680.00, '8850123456825', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80', 88, 15),
('BOT-WAT-SPO-750', 'Sports Water Bottle (750ml)', 'Insulated stainless steel bottle.', 'Sports & Outdoors', 280.00, 580.00, '8850123456826', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80', 150, 25),
('RES-BAN-ELA-26', 'Elastic Resistance Bands (Set)', '5-piece resistance band set.', 'Sports & Outdoors', 150.00, 320.00, '8850123456827', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&q=80', 220, 35),
('BAG-GYM-DUF-BLK', 'Gym Duffel Bag (Black)', 'Large capacity gym duffel bag.', 'Sports & Outdoors', 450.00, 950.00, '8850123456828', 'https://images.unsplash.com/photo-1557823365-0ec25c7b7b76?w=500&q=80', 65, 10),
('CAM-SPH-ACT-4K', 'Action Camera 4K Waterproof', 'Ultra HD action camera with accessories.', 'Sports & Outdoors', 2890.00, 5490.00, '8850123456829', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80', 18, 4),

-- Beauty & Personal Care (6 items)
('CRE-MOI-INT-DAY', 'Intensive Moisturizer (Day)', 'Hydrating face cream with SPF 30.', 'Beauty & Personal Care', 420.00, 890.00, '8850123456830', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&q=80', 95, 15),
('SHA-BOO-BIO-300', 'Biotic Shampoo (300ml)', 'Natural ingredient volumizing shampoo.', 'Beauty & Personal Care', 185.00, 390.00, '8850123456831', 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&q=80', 175, 25),
('BRU-CHA-BAM-SET', 'Bamboo Charcoal Brush Set', 'Eco-friendly toothbrush set (4 pieces).', 'Beauty & Personal Care', 120.00, 260.00, '8850123456832', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&q=80', 280, 40),
('LOT-BOD-AOE-250', 'Aloe Vera Body Lotion (250ml)', 'Soothing aloe body lotion.', 'Beauty & Personal Care', 165.00, 350.00, '8850123456833', 'https://images.unsplash.com/photo-1556228420-8c2e3e8f5dd7?w=500&q=80', 210, 30),
('PER-Natural-50', 'Natural Perfume Oil (50ml)', 'Alcohol-free natural fragrance oil.', 'Beauty & Personal Care', 520.00, 1150.00, '8850123456834', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80', 65, 10),
('LIP-BAL-ORG-VAN', 'Organic Lip Balm (Vanilla)', 'Beeswax organic lip balm.', 'Beauty & Personal Care', 75.00, 160.00, '8850123456835', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80', 450, 60),

-- Books & Stationery (4 items)
('BOO-FIC-BES-2023', 'Best Fiction 2023 Paperback', 'Award-winning fiction novel collection.', 'Books & Stationery', 350.00, 720.00, '8850123456836', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80', 120, 20),
('BOO-SEL-COO-200', 'Cooking Essentials Hardcover', 'Comprehensive cooking techniques book.', 'Books & Stationery', 480.00, 980.00, '8850123456837', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80', 85, 12),
('PLA-WEK-A4-UND', 'Weekly Planner (A4, Undated)', 'Flexible weekly planner with sections.', 'Books & Stationery', 220.00, 480.00, '8850123456838', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80', 280, 35),
('HIG-LIG-PEN-ASS', 'Highlighter Pen Assortment', 'Set of 6 pastel highlighters.', 'Books & Stationery', 95.00, 200.00, '8850123456839', 'https://images.unsplash.com/photo-1583335069099-8f8bc8b5755d?w=500&q=80', 380, 50),

-- Pet Supplies (4 items)
('FOO-DRY-DOG-5KG', 'Premium Dry Dog Food (5kg)', 'Adult dog formula with real chicken.', 'Pet Supplies', 320.00, 680.00, '8850123456840', 'https://images.unsplash.com/photo-1589924691195-41495fe1927a?w=500&q=80', 95, 15),
('CAT-LIT-CLA-4L', 'Clumping Cat Litter (4L)', 'Natural clay clumping litter.', 'Pet Supplies', 180.00, 380.00, '8850123456841', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&q=80', 145, 20),
('TOY-CAT-FE-INT', 'Interactive Cat Feeder Toy', 'Mental stimulation food puzzle toy.', 'Pet Supplies', 280.00, 580.00, '8850123456842', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&q=80', 35, 8),
('BED-DOG-ORT-L', 'Orthopedic Dog Bed (Large)', 'Memory foam dog bed for large breeds.', 'Pet Supplies', 1200.00, 2590.00, '8850123456843', 'https://images.unsplash.com/photo-1589924691195-41495fe1927a?w=500&q=80', 18, 4),

-- Health & Wellness (5 items)
('VIT-MUL-DAY-60', 'Daily Multivitamins (60 tablets)', 'Complete daily multivitamin supplement.', 'Health & Wellness', 380.00, 790.00, '8850123456844', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80', 155, 25),
('OME-FIS-OIL-100', 'Fish Oil Omega-3 (100 softgels)', 'High-potency fish oil capsules.', 'Health & Wellness', 420.00, 880.00, '8850123456845', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80', 125, 20),
('COL-PRO-WHE-500', 'Whey Protein (500g, Chocolate)', 'Premium whey protein powder.', 'Health & Wellness', 550.00, 1150.00, '8850123456846', 'https://images.unsplash.com/photo-1579723211163-685599599b5f?w=500&q=80', 88, 15),
('BAN-ACE-KNE-ONE', 'Knee Ace Bandage Support', 'Neoprene knee support brace.', 'Health & Wellness', 180.00, 380.00, '8850123456847', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80', 220, 35),
('MAS-NEC-HEA-ELE', 'Neck & Shoulder Massager', 'Electric heated neck massager.', 'Health & Wellness', 1650.00, 3290.00, '8850123456848', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80', 25, 5);

-- ============================================
-- INSERT DEFAULT USERS
-- Uses ON CONFLICT to skip if already exists
-- ============================================

INSERT INTO app_users (username, password, name, role) VALUES
('admin', '123456', 'Administrator', 'admin'),
('user', '123456', 'Demo User', 'user'),
('manager', '123456', 'Stock Manager', 'user'),
('cashier', '123456', 'Cashier Staff', 'user')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INSERT APP SETTINGS
-- Uses ON CONFLICT to skip if already exists
-- ============================================

INSERT INTO app_settings (key, value, description) VALUES
('kpi_monthly_sales_target', '50000', 'Monthly sales target in THB'),
('low_stock_threshold', '10', 'Low stock alert threshold'),
('currency_code', 'THB', 'Default currency code')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- INSERT STOCK TRANSACTIONS OVER 90 DAYS
-- This generates realistic transaction history
-- ============================================

-- Helper: Insert transactions with varied dates
-- Format: (product_sku, transaction_type, quantity, notes, days_ago)
-- days_ago: 0=today, 1=yesterday, up to 90 days

-- Transactions will be inserted using multiple UNION ALL statements
-- Each represents a day of transactions

-- Note: These transactions reference the products inserted above
-- The quantity updates will be processed by the trigger process_stock_transaction()

-- BEGIN TRANSACTION INSERTIONS --

-- Day 1 (90 days ago) - Initial stock receipts
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'IN', 100, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COF-ROB-1KG'), 'IN', 80, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEA-GRN-FRU-100'), 'IN', 150, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JUI-ORG-MIX-500'), 'IN', 200, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SOD-CAS-330'), 'IN', 60, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'IN', 50, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOWL-MIX-GLS-3L'), 'IN', 40, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'IN', 250, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'IN', 100, 'Initial stock receipt', NOW() - INTERVAL '90 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'DESK-MAT-GRY'), 'IN', 100, 'Initial stock receipt', NOW() - INTERVAL '90 days';

-- Day 5 - Sales
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'OUT', 8, 'Retail sale POS-001', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEA-GRN-FRU-100'), 'OUT', 12, 'Retail sale POS-002', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 15, 'Retail sale POS-003', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 5, 'Retail sale POS-004', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JUI-ORG-MIX-500'), 'OUT', 20, 'Retail sale POS-005', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 8, 'Retail sale POS-006', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 25, 'Retail sale POS-007', NOW() - INTERVAL '85 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'DESK-MAT-GRY'), 'OUT', 10, 'Retail sale POS-008', NOW() - INTERVAL '85 days';

-- Day 10 - Restock
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'IN', 50, 'Restock order #INV-2024-001', NOW() - INTERVAL '80 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEA-GRN-FRU-100'), 'IN', 100, 'Restock order #INV-2024-002', NOW() - INTERVAL '80 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'IN', 200, 'Restock order #INV-2024-003', NOW() - INTERVAL '80 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'IN', 60, 'Restock order #INV-2024-004', NOW() - INTERVAL '80 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'IN', 200, 'Restock order #INV-2024-005', NOW() - INTERVAL '80 days';

-- Day 12-18 - Daily sales mix
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '78 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COF-ROB-1KG'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '78 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '77 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 6, 'Retail sale', NOW() - INTERVAL '77 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JUI-ORG-MIX-500'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '76 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 10, 'Retail sale', NOW() - INTERVAL '76 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'DESK-MAT-GRY'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '75 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 40, 'Retail sale', NOW() - INTERVAL '75 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 22, 'Retail sale', NOW() - INTERVAL '74 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'OUT', 10, 'Retail sale', NOW() - INTERVAL '74 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEA-GRN-FRU-100'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '73 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '73 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '72 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JUI-ORG-MIX-500'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '72 days';

-- Day 20 - Bulk restock
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'IN', 100, 'Bulk restock', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COF-CAP-INS'), 'IN', 80, 'New product arrival', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CHO-DAR-70G'), 'IN', 150, 'New product arrival', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'IN', 300, 'Bulk restock', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'IN', 120, 'Bulk restock', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'IN', 300, 'Bulk restock', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'NOT-JOU-A5-LIN'), 'IN', 250, 'New product arrival', NOW() - INTERVAL '70 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'STA-PAP-A4-80'), 'IN', 500, 'Bulk restock', NOW() - INTERVAL '70 days';

-- Day 25-35 - Electronics sales
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'APP-IPH-15PRO'), 'OUT', 2, 'Online order #WEB-1024', NOW() - INTERVAL '65 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SAM-GAL-S24U'), 'OUT', 1, 'Online order #WEB-1025', NOW() - INTERVAL '65 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TAB-APP-PRO-11'), 'OUT', 1, 'Retail sale', NOW() - INTERVAL '64 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MSE-LOG-MX-M3'), 'OUT', 5, 'Retail sale', NOW() - INTERVAL '63 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'KEY-CHR-K2-RGB'), 'OUT', 3, 'Retail sale', NOW() - INTERVAL '63 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'USB-HUB-7P-AL'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '62 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'APP-IPH-15PRO'), 'OUT', 1, 'Retail sale', NOW() - INTERVAL '61 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'LAP-MAC-AIR-13'), 'OUT', 1, 'Online order #WEB-1026', NOW() - INTERVAL '60 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MSE-LOG-MX-M3'), 'OUT', 6, 'Retail sale', NOW() - INTERVAL '59 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TAB-APP-PRO-11'), 'OUT', 2, 'Retail sale', NOW() - INTERVAL '58 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SAM-GAL-S24U'), 'OUT', 1, 'Retail sale', NOW() - INTERVAL '57 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'KEY-CHR-K2-RGB'), 'OUT', 4, 'Online order #WEB-1027', NOW() - INTERVAL '56 days';

-- Day 38-45 - Kitchenware restock and sales
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'KNF-CHE-PRO-20'), 'IN', 30, 'New product arrival', NOW() - INTERVAL '52 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CUT-BAM-SET-12'), 'IN', 50, 'New product arrival', NOW() - INTERVAL '52 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PAN-NON-STk-28'), 'IN', 40, 'New product arrival', NOW() - INTERVAL '52 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOWL-MIX-GLS-3L'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '51 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '50 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'KNF-CHE-PRO-20'), 'OUT', 3, 'Retail sale', NOW() - INTERVAL '49 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CUT-BAM-SET-12'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '49 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PAN-NON-STk-28'), 'OUT', 6, 'Retail sale', NOW() - INTERVAL '48 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SPI-ACR-BLU-500'), 'OUT', 10, 'Retail sale', NOW() - INTERVAL '47 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOWL-MIX-GLS-3L'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '46 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '45 days';

-- Day 48-55 - Apparel sales surge
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 35, 'Retail sale', NOW() - INTERVAL '42 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '42 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JEA-DEN-SKI-M'), 'OUT', 20, 'Retail sale', NOW() - INTERVAL '41 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SOC-ATH-BLK-42'), 'OUT', 45, 'Retail sale', NOW() - INTERVAL '41 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CAP-BAS-BRO-UN'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '40 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 28, 'Retail sale', NOW() - INTERVAL '40 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '39 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JEA-DEN-SKI-M'), 'OUT', 15, 'Online order #WEB-1028', NOW() - INTERVAL '38 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'WIN-DOC-RED-L'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '38 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SHO-RUN-WHT-42'), 'OUT', 5, 'Retail sale', NOW() - INTERVAL '37 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 32, 'Retail sale', NOW() - INTERVAL '36 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SOC-ATH-BLK-42'), 'OUT', 55, 'Retail sale', NOW() - INTERVAL '36 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BAG-TOP-NAT-15'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '35 days';

-- Day 56-60 - Office supplies bulk orders
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'ORG-PLA-DIS-T5'), 'OUT', 15, 'Corporate order #CORP-001', NOW() - INTERVAL '34 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 100, 'Corporate order #CORP-001', NOW() - INTERVAL '34 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'STA-PAP-A4-80'), 'OUT', 50, 'Corporate order #CORP-001', NOW() - INTERVAL '34 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'NOT-JOU-A5-LIN'), 'OUT', 30, 'Corporate order #CORP-001', NOW() - INTERVAL '34 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CAL-DES-WAL-A3'), 'OUT', 20, 'Corporate order #CORP-001', NOW() - INTERVAL '33 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 80, 'Corporate order #CORP-002', NOW() - INTERVAL '32 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'STA-PAP-A4-80'), 'OUT', 100, 'Corporate order #CORP-002', NOW() - INTERVAL '32 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'ORG-PLA-DIS-T5'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '31 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HIG-LIG-PEN-ASS'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '30 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PLA-WEK-A4-UND'), 'OUT', 35, 'Retail sale', NOW() - INTERVAL '30 days';

-- Day 61-65 - Home & Living
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'LAM-LED-DIM-TAB'), 'OUT', 8, 'Online order #WEB-1029', NOW() - INTERVAL '29 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CUSH-VEL-NAV-45'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '29 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CAN-WOV-BEI-60'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '28 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CLO-STA-MET-BLK'), 'OUT', 4, 'Retail sale', NOW() - INTERVAL '27 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MIR-LEA-STA-80'), 'OUT', 2, 'Online order #WEB-1030', NOW() - INTERVAL '26 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CUR-LIN-BLU-2x2'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '26 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'LAM-LED-DIM-TAB'), 'OUT', 10, 'Retail sale', NOW() - INTERVAL '25 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CUSH-VEL-NAV-45'), 'OUT', 20, 'Online order #WEB-1031', NOW() - INTERVAL '25 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PLA-CEP-IND-12'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '25 days';

-- Day 66-70 - Sports & Fitness
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'YOG-MAT-ECO-6'), 'OUT', 20, 'Retail sale', NOW() - INTERVAL '24 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOT-WAT-SPO-750'), 'OUT', 35, 'Retail sale', NOW() - INTERVAL '24 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'RES-BAN-ELA-26'), 'OUT', 40, 'Retail sale', NOW() - INTERVAL '23 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BAG-GYM-DUF-BLK'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '23 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CAM-SPH-ACT-4K'), 'OUT', 3, 'Online order #WEB-1032', NOW() - INTERVAL '22 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'YOG-MAT-ECO-6'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '21 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOT-WAT-SPO-750'), 'OUT', 30, 'Online order #WEB-1033', NOW() - INTERVAL '20 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'RES-BAN-ELA-26'), 'OUT', 35, 'Retail sale', NOW() - INTERVAL '20 days';

-- Day 71-75 - Beauty & Personal Care
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'CRE-MOI-INT-DAY'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '19 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SHA-BOO-BIO-300'), 'OUT', 30, 'Retail sale', NOW() - INTERVAL '19 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BRU-CHA-BAM-SET'), 'OUT', 50, 'Retail sale', NOW() - INTERVAL '18 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'LOT-BOD-AOE-250'), 'OUT', 35, 'Retail sale', NOW() - INTERVAL '18 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PER-Natural-50'), 'OUT', 12, 'Online order #WEB-1034', NOW() - INTERVAL '17 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CRE-MOI-INT-DAY'), 'OUT', 22, 'Retail sale', NOW() - INTERVAL '17 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SHA-BOO-BIO-300'), 'OUT', 28, 'Online order #WEB-1035', NOW() - INTERVAL '16 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BRU-CHA-BAM-SET'), 'OUT', 45, 'Retail sale', NOW() - INTERVAL '16 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'LIP-BAL-ORG-VAN'), 'OUT', 80, 'Retail sale', NOW() - INTERVAL '15 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'LOT-BOD-AOE-250'), 'OUT', 32, 'Retail sale', NOW() - INTERVAL '15 days';

-- Day 76-80 - Books & Stationery
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'BOO-FIC-BES-2023'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '14 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOO-SEL-COO-200'), 'OUT', 12, 'Retail sale', NOW() - INTERVAL '14 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PLA-WEK-A4-UND'), 'OUT', 30, 'Retail sale', NOW() - INTERVAL '13 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HIG-LIG-PEN-ASS'), 'OUT', 40, 'Retail sale', NOW() - INTERVAL '13 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOO-FIC-BES-2023'), 'OUT', 15, 'Online order #WEB-1036', NOW() - INTERVAL '12 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BOO-SEL-COO-200'), 'OUT', 10, 'Retail sale', NOW() - INTERVAL '12 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 60, 'Back-to-school promo', NOW() - INTERVAL '11 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'NOT-JOU-A5-LIN'), 'OUT', 45, 'Back-to-school promo', NOW() - INTERVAL '11 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PLA-WEK-A4-UND'), 'OUT', 35, 'Back-to-school promo', NOW() - INTERVAL '10 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HIG-LIG-PEN-ASS'), 'OUT', 50, 'Back-to-school promo', NOW() - INTERVAL '10 days';

-- Day 81-85 - Pet Supplies
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'FOO-DRY-DOG-5KG'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '9 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CAT-LIT-CLA-4L'), 'OUT', 20, 'Retail sale', NOW() - INTERVAL '9 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TOY-CAT-FE-INT'), 'OUT', 8, 'Retail sale', NOW() - INTERVAL '8 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BED-DOG-ORT-L'), 'OUT', 3, 'Online order #WEB-1037', NOW() - INTERVAL '8 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'FOO-DRY-DOG-5KG'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '7 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CAT-LIT-CLA-4L'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '7 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TOY-CAT-FE-INT'), 'OUT', 10, 'Retail sale', NOW() - INTERVAL '6 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BED-DOG-ORT-L'), 'OUT', 2, 'Retail sale', NOW() - INTERVAL '6 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'FOO-DRY-DOG-5KG'), 'OUT', 12, 'Online order #WEB-1038', NOW() - INTERVAL '5 days';

-- Day 86-88 - Health & Wellness
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'VIT-MUL-DAY-60'), 'OUT', 30, 'Retail sale', NOW() - INTERVAL '4 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'OME-FIS-OIL-100'), 'OUT', 25, 'Retail sale', NOW() - INTERVAL '4 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COL-PRO-WHE-500'), 'OUT', 20, 'Retail sale', NOW() - INTERVAL '3 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'BAN-ACE-KNE-ONE'), 'OUT', 15, 'Retail sale', NOW() - INTERVAL '3 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MAS-NEC-HEA-ELE'), 'OUT', 4, 'Online order #WEB-1039', NOW() - INTERVAL '2 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'VIT-MUL-DAY-60'), 'OUT', 28, 'Retail sale', NOW() - INTERVAL '2 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'OME-FIS-OIL-100'), 'OUT', 22, 'Online order #WEB-1040', NOW() - INTERVAL '2 days'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COL-PRO-WHE-500'), 'OUT', 18, 'Retail sale', NOW() - INTERVAL '1 day';

-- Recent transactions (Today and Yesterday)
INSERT INTO stock_transactions (product_id, transaction_type, quantity, notes, created_at)
SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'OUT', 15, 'Retail sale POS-1041', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COF-ROB-1KG'), 'OUT', 8, 'Retail sale POS-1042', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 22, 'Retail sale POS-1043', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 10, 'Online order #WEB-1044', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'APP-IPH-15PRO'), 'OUT', 2, 'Online order #WEB-1045', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 18, 'Retail sale POS-1046', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 12, 'Retail sale POS-1047', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'DESK-MAT-GRY'), 'OUT', 8, 'Online order #WEB-1048', NOW() - INTERVAL '1 day'
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'COF-ARAB-250'), 'OUT', 12, 'Retail sale POS-1049', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEA-GRN-FRU-100'), 'OUT', 14, 'Retail sale POS-1050', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 25, 'Retail sale POS-1051', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 45, 'Corporate order #CORP-003', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'STA-PAP-A4-80'), 'OUT', 80, 'Corporate order #CORP-003', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'MUG-CER-WHT'), 'OUT', 8, 'Online order #WEB-1052', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'SOC-ATH-BLK-42'), 'OUT', 35, 'Retail sale POS-1053', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'JUI-ORG-MIX-500'), 'OUT', 18, 'Retail sale POS-1054', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'HOOD-FLE-BLU-L'), 'OUT', 10, 'Online order #WEB-1055', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'YOG-MAT-ECO-6'), 'OUT', 12, 'Retail sale POS-1056', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'CRE-MOI-INT-DAY'), 'OUT', 15, 'Retail sale POS-1057', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'VIT-MUL-DAY-60'), 'OUT', 20, 'Online order #WEB-1058', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'FOO-DRY-DOG-5KG'), 'OUT', 10, 'Retail sale POS-1059', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'PEN-GEL-BLK-05'), 'OUT', 55, 'Corporate order #CORP-004', NOW()
UNION ALL SELECT (SELECT id FROM products WHERE sku = 'TEE-OVR-BLK-M'), 'OUT', 20, 'Retail sale POS-1060', NOW();

-- ============================================
-- END OF LARGE SEED DATA
-- ============================================

-- Summary:
-- - 54 products across 10 categories
-- - 4 users
-- - 3 app settings
-- - 200+ transactions spanning 90 days
-- - Mix of IN, OUT transactions
-- - Includes retail sales, online orders, and corporate orders
