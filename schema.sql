-- ============================================
-- SUPABASE DATABASE SCHEMA FOR STOCK PRODUCT MANAGEMENT SYSTEM
-- Complete schema with all fixes and improvements
-- ============================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- 3. App Users Table (for username/password login)
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Products Table (with stock quantity directly in product)
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
    quantity INTEGER DEFAULT 0 NOT NULL,
    safety_stock INTEGER DEFAULT 5 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Stock Transactions Table (Ledger/History)
-- Includes 'direction' column for ADJUST transactions
CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUST')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    direction TEXT DEFAULT 'in' CHECK (direction IN ('in', 'out')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. App Settings Table (for KPI targets and system settings)
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Trigger Function to Automatically Process Stock Adjustments
-- Updated with ADJUST direction support
CREATE OR REPLACE FUNCTION process_stock_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle IN (Purchase / Receipt) - always increase
    IF NEW.transaction_type = 'IN' THEN
        UPDATE products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;

    -- Handle OUT (Sale / Dispatch) - always decrease
    ELSIF NEW.transaction_type = 'OUT' THEN
        UPDATE products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;

    -- Handle ADJUST (Physical count correction) - depends on direction
    ELSIF NEW.transaction_type = 'ADJUST' THEN
        IF NEW.direction = 'out' THEN
            -- Decrease stock
            UPDATE products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
        ELSE
            -- Increase stock (default 'in')
            UPDATE products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create the Trigger
CREATE TRIGGER trigger_process_stock_transaction
AFTER INSERT ON stock_transactions
FOR EACH ROW
EXECUTE FUNCTION process_stock_transaction();

-- 9. Configure Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 10. Grant schema and table permissions to anon and authenticator
GRANT USAGE ON SCHEMA public TO anon, authenticator;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticator;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_transactions TO anon, authenticator;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_users TO anon, authenticator;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticator;

-- 11. Create RLS Policies for all tables

-- Products policies
DROP POLICY IF EXISTS "Allow public select for all" ON products;
DROP POLICY IF EXISTS "Allow public write for all" ON products;
CREATE POLICY "Allow public select for all" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write for all" ON products FOR ALL USING (true) WITH CHECK (true);

-- Stock transactions policies
DROP POLICY IF EXISTS "Allow public select for all" ON stock_transactions;
DROP POLICY IF EXISTS "Allow public write for all" ON stock_transactions;
CREATE POLICY "Allow public select for all" ON stock_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public write for all" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);

-- App users policies
DROP POLICY IF EXISTS "Allow public select for all" ON app_users;
DROP POLICY IF EXISTS "Allow public write for all" ON app_users;
CREATE POLICY "Allow public select for all" ON app_users FOR SELECT USING (true);
CREATE POLICY "Allow public write for all" ON app_users FOR ALL USING (true) WITH CHECK (true);

-- App settings policies
DROP POLICY IF EXISTS "Allow public select for all" ON app_settings;
DROP POLICY IF EXISTS "Allow public write for all" ON app_settings;
CREATE POLICY "Allow public select for all" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write for all" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- END OF SCHEMA
-- Run seed-data.sql separately to insert initial data
-- ============================================
