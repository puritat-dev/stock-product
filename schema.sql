-- SUPABASE DATABASE SCHEMA FOR STOCK PRODUCT MANAGEMENT SYSTEM (SIMPLIFIED)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if they exist (for clean setup)
DROP TRIGGER IF EXISTS trigger_process_stock_transaction ON stock_transactions;
DROP FUNCTION IF EXISTS process_stock_transaction();
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS stock_levels;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS products;

-- 3. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    selling_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    barcode TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Warehouses Table
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Stock Levels Table (Current Quantity per Product per Warehouse)
CREATE TABLE stock_levels (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0 NOT NULL,
    safety_stock INTEGER DEFAULT 5 NOT NULL,
    PRIMARY KEY (product_id, warehouse_id)
);

-- 6. Stock Transactions Table (Ledger/History)
CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUST')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Trigger Function to Automatically Process Stock Adjustments based on Transactions
CREATE OR REPLACE FUNCTION process_stock_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle IN (Purchase / Receipt)
    IF NEW.transaction_type = 'IN' THEN
        INSERT INTO stock_levels (product_id, warehouse_id, quantity)
        VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity)
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET quantity = stock_levels.quantity + NEW.quantity;

    -- Handle OUT (Sale / Dispatch)
    ELSIF NEW.transaction_type = 'OUT' THEN
        INSERT INTO stock_levels (product_id, warehouse_id, quantity)
        VALUES (NEW.product_id, NEW.warehouse_id, -NEW.quantity)
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET quantity = stock_levels.quantity - NEW.quantity;

    -- Handle ADJUST (Physical count correction)
    ELSIF NEW.transaction_type = 'ADJUST' THEN
        INSERT INTO stock_levels (product_id, warehouse_id, quantity)
        VALUES (NEW.product_id, NEW.warehouse_id, NEW.quantity)
        ON CONFLICT (product_id, warehouse_id)
        DO UPDATE SET quantity = stock_levels.quantity + NEW.quantity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create the Trigger
CREATE TRIGGER trigger_process_stock_transaction
AFTER INSERT ON stock_transactions
FOR EACH ROW
EXECUTE FUNCTION process_stock_transaction();

-- 9. Insert Initial Mock Data
-- Warehouses
INSERT INTO warehouses (id, name, location) VALUES
('w1000000-0000-0000-0000-000000000001', 'Main Warehouse (BKK)', 'Bangkok, Thailand'),
('w2000000-0000-0000-0000-000000000002', 'Chonburi Hub', 'Chonburi, Thailand');

-- Products
INSERT INTO products (id, sku, name, description, category, cost_price, selling_price, barcode, image_url) VALUES
('p1000000-0000-0000-0000-000000000001', 'COF-ARAB-250', 'Premium Arabica Coffee Beans (250g)', 'Medium roasted high-grown organic Arabica coffee beans.', 'Food & Beverage', 120.00, 250.00, '8850123456789', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80'),
('p2000000-0000-0000-0000-000000000002', 'MUG-CER-WHT', 'Minimalist Ceramic Mug (White)', 'Matte finish 350ml ceramic coffee mug.', 'Kitchenware', 80.00, 180.00, '8850123456790', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80'),
('p3000000-0000-0000-0000-000000000003', 'APP-IPH-15PRO', 'iPhone 15 Pro Max (256GB, Black Titanium)', 'Latest Apple smartphone with 256GB storage.', 'Electronics', 38000.00, 48900.00, '190199222333', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80'),
('p4000000-0000-0000-0000-000000000004', 'TEE-OVR-BLK-M', 'Oversized Cotton Tee (Black, M)', 'Heavyweight 100% organic cotton basic t-shirt.', 'Apparel', 250.00, 590.00, '8850123456791', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80'),
('p5000000-0000-0000-0000-000000000005', 'DESK-MAT-GRY', 'Premium Felt Desk Mat (Gray)', 'Anti-slip wool felt desk pad (800x400mm) for workstations.', 'Office Supplies', 300.00, 650.00, '8850123456792', 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80');

-- Initial Stock Transactions (This will automatically generate entries in stock_levels!)
INSERT INTO stock_transactions (product_id, warehouse_id, transaction_type, quantity, notes) VALUES
('p1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'IN', 100, 'Initial purchase order receive'),
('p2000000-0000-0000-0000-000000000002', 'w1000000-0000-0000-0000-000000000001', 'IN', 50, 'Initial purchase order receive'),
('p3000000-0000-0000-0000-000000000003', 'w1000000-0000-0000-0000-000000000001', 'IN', 10, 'Initial secure batch import'),
('p4000000-0000-0000-0000-000000000004', 'w1000000-0000-0000-0000-000000000001', 'IN', 200, 'Bulk arrival'),
('p5000000-0000-0000-0000-000000000005', 'w1000000-0000-0000-0000-000000000001', 'IN', 80, 'Bulk arrival');

-- Log some sales (OUT)
INSERT INTO stock_transactions (product_id, warehouse_id, transaction_type, quantity, notes) VALUES
('p1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'OUT', 15, 'Retail shop sale POS-001'),
('p2000000-0000-0000-0000-000000000002', 'w1000000-0000-0000-0000-000000000001', 'OUT', 8, 'Retail shop sale POS-002'),
('p3000000-0000-0000-0000-000000000003', 'w1000000-0000-0000-0000-000000000001', 'OUT', 2, 'Online order Shopify #1042');

-- Configure Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for all" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public select for all" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Allow public select for all" ON stock_levels FOR SELECT USING (true);
CREATE POLICY "Allow public select for all" ON stock_transactions FOR SELECT USING (true);

CREATE POLICY "Allow public write for all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write for all" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write for all" ON stock_levels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write for all" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);
