import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are set and not default placeholders
const isRealSupabase = 
  supabaseUrl && 
  supabaseUrl !== 'your-supabase-url' && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key' && 
  supabaseAnonKey.trim() !== '';

let supabaseClient = null;
if (isRealSupabase) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase Client initialized successfully.");
  } catch (err) {
    console.error("Error creating Supabase client:", err);
  }
}

// Seed LocalStorage with premium mock data if it doesn't exist yet
const seedMockData = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('mock_products')) {
    localStorage.setItem('mock_products', JSON.stringify([
      { id: 'p1', sku: 'COF-ARAB-250', name: 'Premium Arabica Coffee Beans (250g)', description: 'Medium roasted high-grown organic Arabica coffee beans.', category: 'Food & Beverage', cost_price: 120.00, selling_price: 250.00, barcode: '8850123456789', image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p2', sku: 'MUG-CER-WHT', name: 'Minimalist Ceramic Mug (White)', description: 'Matte finish 350ml ceramic coffee mug.', category: 'Kitchenware', cost_price: 80.00, selling_price: 180.00, barcode: '8850123456790', image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p3', sku: 'APP-IPH-15PRO', name: 'iPhone 15 Pro Max (256GB, Black Titanium)', description: 'Latest Apple smartphone with 256GB storage.', category: 'Electronics', cost_price: 38000.00, selling_price: 48900.00, barcode: '190199222333', image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p4', sku: 'TEE-OVR-BLK-M', name: 'Oversized Cotton Tee (Black, M)', description: 'Heavyweight 100% organic cotton basic t-shirt.', category: 'Apparel', cost_price: 250.00, selling_price: 590.00, barcode: '8850123456791', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p5', sku: 'DESK-MAT-GRY', name: 'Premium Felt Desk Mat (Gray)', description: 'Anti-slip wool felt desk pad (800x400mm) for workstations.', category: 'Office Supplies', cost_price: 300.00, selling_price: 650.00, barcode: '8850123456792', image_url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() }
    ]));
  }
  
  if (!localStorage.getItem('mock_warehouses')) {
    localStorage.setItem('mock_warehouses', JSON.stringify([
      { id: 'w1', name: 'Main Warehouse (BKK)', location: 'Bangkok, Thailand', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'w2', name: 'Chonburi Hub', location: 'Chonburi, Thailand', created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() }
    ]));
  }
  
  if (!localStorage.getItem('mock_stock_levels')) {
    localStorage.setItem('mock_stock_levels', JSON.stringify([
      { product_id: 'p1', warehouse_id: 'w1', quantity: 85, safety_stock: 10 },
      { product_id: 'p1', warehouse_id: 'w2', quantity: 0, safety_stock: 5 },
      { product_id: 'p2', warehouse_id: 'w1', quantity: 42, safety_stock: 5 },
      { product_id: 'p3', warehouse_id: 'w1', quantity: 8, safety_stock: 3 },
      { product_id: 'p4', warehouse_id: 'w1', quantity: 200, safety_stock: 20 },
      { product_id: 'p4', warehouse_id: 'w2', quantity: 0, safety_stock: 10 },
      { product_id: 'p5', warehouse_id: 'w1', quantity: 80, safety_stock: 15 }
    ]));
  }
  
  if (!localStorage.getItem('mock_stock_transactions')) {
    localStorage.setItem('mock_stock_transactions', JSON.stringify([
      { id: 't1', product_id: 'p1', warehouse_id: 'w1', transaction_type: 'IN', quantity: 100, notes: 'Initial purchase order receive', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't2', product_id: 'p2', warehouse_id: 'w1', transaction_type: 'IN', quantity: 50, notes: 'Initial purchase order receive', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't3', product_id: 'p3', warehouse_id: 'w1', transaction_type: 'IN', quantity: 10, notes: 'Initial secure batch import', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't4', product_id: 'p4', warehouse_id: 'w1', transaction_type: 'IN', quantity: 200, notes: 'Bulk arrival', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't5', product_id: 'p5', warehouse_id: 'w1', transaction_type: 'IN', quantity: 80, notes: 'Bulk arrival', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't6', product_id: 'p1', warehouse_id: 'w1', transaction_type: 'OUT', quantity: 15, notes: 'Retail shop sale POS-001', created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
      { id: 't7', product_id: 'p2', warehouse_id: 'w1', transaction_type: 'OUT', quantity: 8, notes: 'Retail shop sale POS-002', created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString() },
      { id: 't8', product_id: 'p3', warehouse_id: 'w1', transaction_type: 'OUT', quantity: 2, notes: 'Online order Shopify #1042', created_at: new Date(Date.now() - 3600000 * 12).toISOString() }
    ]));
  }
};

// Simple Mock DB client for LocalStorage
const createMockClient = () => {
  seedMockData();
  
  const getStorage = (key) => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(key) || '[]');
  };
  
  const setStorage = (key, data) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  };

  return {
    isMock: true,
    auth: {
      getSession: async () => {
        if (typeof window === 'undefined') return { data: { session: null }, error: null };
        const isLoggedIn = localStorage.getItem('demo_logged_in') === 'true';
        if (isLoggedIn) {
          return { data: { session: { user: { email: 'demo@stockproduct.com' } } }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        if (typeof window === 'undefined') return { data: null, error: { message: 'Window undefined' } };
        if (email && password) {
          localStorage.setItem('demo_logged_in', 'true');
          localStorage.setItem('demo_user_email', email);
          return { data: { user: { email }, session: {} }, error: null };
        }
        return { data: null, error: { message: 'Invalid credentials' } };
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('demo_logged_in');
          localStorage.removeItem('demo_user_email');
        }
        return { error: null };
      },
      onAuthStateChange: (callback) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    db: {
      getProducts: async () => {
        const data = getStorage('mock_products').sort((a, b) => a.name.localeCompare(b.name));
        return { data, error: null };
      },
      createProduct: async (product) => {
        const products = getStorage('mock_products');
        const newProduct = { 
          id: 'p_' + Math.random().toString(36).substr(2, 9), 
          ...product, 
          cost_price: parseFloat(product.cost_price || 0),
          selling_price: parseFloat(product.selling_price || 0),
          created_at: new Date().toISOString() 
        };
        products.push(newProduct);
        setStorage('mock_products', products);

        const warehouses = getStorage('mock_warehouses');
        const stockLevels = getStorage('mock_stock_levels');
        warehouses.forEach(w => {
          stockLevels.push({ product_id: newProduct.id, warehouse_id: w.id, quantity: 0, safety_stock: 5 });
        });
        setStorage('mock_stock_levels', stockLevels);

        return { data: newProduct, error: null };
      },
      updateProduct: async (id, updates) => {
        const products = getStorage('mock_products');
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          products[index] = { 
            ...products[index], 
            ...updates,
            cost_price: parseFloat(updates.cost_price !== undefined ? updates.cost_price : products[index].cost_price),
            selling_price: parseFloat(updates.selling_price !== undefined ? updates.selling_price : products[index].selling_price),
          };
          setStorage('mock_products', products);
          return { data: products[index], error: null };
        }
        return { data: null, error: { message: 'Product not found' } };
      },
      deleteProduct: async (id) => {
        let products = getStorage('mock_products');
        products = products.filter(p => p.id !== id);
        setStorage('mock_products', products);
        
        let stockLevels = getStorage('mock_stock_levels');
        stockLevels = stockLevels.filter(s => s.product_id !== id);
        setStorage('mock_stock_levels', stockLevels);

        let txs = getStorage('mock_stock_transactions');
        txs = txs.filter(t => t.product_id !== id);
        setStorage('mock_stock_transactions', txs);

        return { error: null };
      },
      getWarehouses: async () => {
        return { data: getStorage('mock_warehouses'), error: null };
      },
      getStockLevels: async () => {
        return { data: getStorage('mock_stock_levels'), error: null };
      },
      updateStockSafety: async (productId, warehouseId, safetyStock) => {
        const stockLevels = getStorage('mock_stock_levels');
        const item = stockLevels.find(s => s.product_id === productId && s.warehouse_id === warehouseId);
        if (item) {
          item.safety_stock = parseInt(safetyStock, 10);
          setStorage('mock_stock_levels', stockLevels);
          return { data: item, error: null };
        }
        return { data: null, error: { message: 'Stock level record not found' } };
      },
      getTransactions: async () => {
        const txs = getStorage('mock_stock_transactions');
        txs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return { data: txs, error: null };
      },
      createTransaction: async (tx) => {
        const txs = getStorage('mock_stock_transactions');
        const newTx = { 
          id: 't_' + Math.random().toString(36).substr(2, 9), 
          ...tx, 
          quantity: parseInt(tx.quantity, 10),
          created_at: new Date().toISOString() 
        };
        txs.push(newTx);
        setStorage('mock_stock_transactions', txs);

        // Update stock levels
        const stockLevels = getStorage('mock_stock_levels');
        const qty = parseInt(newTx.quantity, 10);

        const adjustStock = (pId, wId, delta) => {
          let record = stockLevels.find(s => s.product_id === pId && s.warehouse_id === wId);
          if (!record) {
            record = { product_id: pId, warehouse_id: wId, quantity: 0, safety_stock: 5 };
            stockLevels.push(record);
          }
          record.quantity += delta;
        };

        if (newTx.transaction_type === 'IN' || newTx.transaction_type === 'ADJUST') {
          adjustStock(newTx.product_id, newTx.warehouse_id, qty);
        } else if (newTx.transaction_type === 'OUT') {
          adjustStock(newTx.product_id, newTx.warehouse_id, -qty);
        }

        setStorage('mock_stock_levels', stockLevels);
        return { data: newTx, error: null };
      }
    }
  };
};

export const client = isRealSupabase ? supabaseClient : null;

// Export unified interface
export const db = isRealSupabase ? {
  getProducts: async () => supabaseClient.from('products').select('*').order('name'),
  createProduct: async (product) => supabaseClient.from('products').insert([product]).select().single(),
  updateProduct: async (id, updates) => supabaseClient.from('products').update(updates).eq('id', id).select().single(),
  deleteProduct: async (id) => supabaseClient.from('products').delete().eq('id', id),
  getWarehouses: async () => supabaseClient.from('warehouses').select('*').order('name'),
  getStockLevels: async () => supabaseClient.from('stock_levels').select('*'),
  updateStockSafety: async (productId, warehouseId, safetyStock) => 
    supabaseClient.from('stock_levels').update({ safety_stock: parseInt(safetyStock, 10) }).match({ product_id: productId, warehouse_id: warehouseId }).select().single(),
  getTransactions: async () => supabaseClient.from('stock_transactions').select('*').order('created_at', { ascending: false }),
  createTransaction: async (tx) => supabaseClient.from('stock_transactions').insert([tx]).select().single()
} : createMockClient().db;

export const auth = isRealSupabase ? supabaseClient.auth : createMockClient().auth;

export const isMocked = !isRealSupabase;
