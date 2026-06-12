# Phase 2: Multi-Tenant Architecture

## Overview
ทำให้ระบบรองรองหลายผู้ใช้ (Multi-Tenant) โดยแต่ละคนมีคลังสินค้าของตัวเอง แยกข้อมูลกัน完全

## Requirements
- ผู้ใช้แต่ละคนเห็นเฉพาะสินค้าและรายการของตัวเอง
- ระบบ login มีอยู่แล้ว (`app_users` table)
- ความปลอดภัย: ไม่สามารถเข้าถึงข้อมูลคนอื่นได้

---

## Database Changes

### 1. Add `user_id` to Tables

```sql
-- Add user_id to products
ALTER TABLE products ADD COLUMN user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;

-- Add user_id to stock_transactions
ALTER TABLE stock_transactions ADD COLUMN user_id UUID REFERENCES app_users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_stock_transactions_user_id ON stock_transactions(user_id);
```

### 2. Enable Row Level Security (RLS)

```sql
-- Products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products" 
ON products FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" 
ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
ON products FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
ON products FOR DELETE USING (auth.uid() = user_id);

-- Stock transactions table
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" 
ON stock_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
ON stock_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Migration Script (for existing data)

```sql
-- Assign existing data to default user
-- Run this AFTER adding user_id column, before enabling RLS

-- Create a default user if not exists
INSERT INTO app_users (id, username, password, name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'default', 'hashed_password', 'Default User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Update products with user_id
UPDATE products 
SET user_id = '00000000-0000-0000-0000-000000000001' 
WHERE user_id IS NULL;

-- Update transactions with user_id
UPDATE stock_transactions 
SET user_id = '00000000-0000-0000-0000-000000000001' 
WHERE user_id IS NULL;

-- Make user_id NOT NULL after migration
ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE stock_transactions ALTER COLUMN user_id SET NOT NULL;
```

---

## Code Changes

### 1. Update `src/lib/supabase.js`

**Mock Mode Changes:**
- Add `user_id` to mock data structure
- Filter all queries by logged-in user ID

```javascript
// Mock data structure
const mockProducts = [
  { id: 1, name: 'Product A', user_id: 'user1', ... },
  { id: 2, name: 'Product B', user_id: 'user2', ... }
];

// Filter by current user
const getCurrentUserId = () => {
  return localStorage.getItem('demo_logged_in') === 'true' 
    ? 'demo-user-id' 
    : null;
};

// In getProducts()
const filtered = mockProducts.filter(p => p.user_id === getCurrentUserId());
```

**Real Supabase:**
- RLS handles filtering automatically via `auth.uid()`
- No code changes needed for queries

### 2. Update Login Flow

Ensure `user_id` is stored after login:

```javascript
// src/lib/supabase.js - signInWithPassword
// Store user info for mock mode
localStorage.setItem('demo_user_id', user.id);
localStorage.setItem('demo_user_name', user.name);
localStorage.setItem('demo_user_role', user.role);
```

### 3. Update Mock Data Seed

Add `user_id` to all seed data:

```javascript
// In mock mode initialization
const DEFAULT_USER_ID = 'demo-user-001';

const seedProducts = [
  { id: 1, user_id: DEFAULT_USER_ID, name: '...', ... },
  // ... all products
];

const seedTransactions = [
  { id: 1, user_id: DEFAULT_USER_ID, product_id: 1, ... },
  // ... all transactions
];
```

---

## Optional Enhancements

### A. User Switching (Admin Feature)

สำหรับ admin ที่ต้องการดูข้อมูลของ user อื่น:

```javascript
// src/lib/supabase.js
const switchUser = (userId) => {
  if (role === 'admin') {
    localStorage.setItem('viewing_as_user', userId);
    // Reload data
  }
};
```

### B. User Profile Page

สร้างหน้าโปรไฟล์ผู้ใช้ (`src/app/profile/page.js`):

- แสดงข้อมูลส่วนตัว
- แก้ไขรหัสผ่าน
- ดูสถิติการใช้งาน

### C. User Management (Admin)

สำหรับ admin จัดการผู้ใช้:

- เพิ่ม user ใหม่
- รีเซ็ตรหัสผ่าน
- จัดการ role

---

## Testing Checklist

- [ ] User A เข้าสู่ระบบ → เห็นเฉพาะสินค้าของ User A
- [ ] User B เข้าสู่ระบบ → เห็นเฉพาะสินค้าของ User B  
- [ ] User A สร้างสินค้า → User B ไม่เห็น
- [ ] User B สร้าง transaction → User A ไม่เห็น
- [ ] Mock mode ทำงานถูกต้อง (filter ตาม demo user)
- [ ] Supabase RLS ป้องกันการเข้าถึงข้าม user

---

## Migration Steps

1. **Backup database** ก่อนทุกอย่าง!
2. Run SQL migration เพิ่ม `user_id` columns
3. Run migration script assign existing data
4. Enable RLS policies
5. Update `src/lib/supabase.js`
6. Update mock data seed
7. Test ทั้ง mock mode และ real Supabase
8. Deploy

---

## Estimated Effort

- Database changes: 2-3 hours
- Code updates: 2-3 hours  
- Testing: 2-3 hours
- **Total: 1-2 days**

---

## Notes

- RLS (Row Level Security) เป็น feature ของ Supabase ที่จัดการ security ที่ database level ปลอดภัยกว่า
- Mock mode ต้องจัดการ manual filter เพราะไม่มี RLS
- ถ้าอนาณารองรอง "หลายคลัง" ต่อ user เดียว (ไม่ใช่ multi-tenant แต่ multi-warehouse) ต้องเพิ่ม `warehouse_id` แทน
