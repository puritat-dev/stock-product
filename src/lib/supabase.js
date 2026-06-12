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

// Seed LocalStorage with mock data
const seedMockData = () => {
  if (typeof window === 'undefined') return;

  // Seed users
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify([
      { id: 'u1', username: 'admin', password: '123456', name: 'Administrator', role: 'admin', created_at: new Date().toISOString() },
      { id: 'u2', username: 'user', password: '123456', name: 'User', role: 'user', created_at: new Date().toISOString() }
    ]));
  }

  // Seed products with quantity and safety_stock
  if (!localStorage.getItem('mock_products')) {
    localStorage.setItem('mock_products', JSON.stringify([
      { id: 'p1', sku: 'COF-ARAB-250', name: 'Premium Arabica Coffee Beans (250g)', description: 'Medium roasted high-grown organic Arabica coffee beans.', category: 'Food & Beverage', cost_price: 120.00, selling_price: 250.00, barcode: '8850123456789', image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80', quantity: 85, safety_stock: 10, created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p2', sku: 'MUG-CER-WHT', name: 'Minimalist Ceramic Mug (White)', description: 'Matte finish 350ml ceramic coffee mug.', category: 'Kitchenware', cost_price: 80.00, selling_price: 180.00, barcode: '8850123456790', image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', quantity: 42, safety_stock: 5, created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p3', sku: 'APP-IPH-15PRO', name: 'iPhone 15 Pro Max (256GB, Black Titanium)', description: 'Latest Apple smartphone with 256GB storage.', category: 'Electronics', cost_price: 38000.00, selling_price: 48900.00, barcode: '190199222333', image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80', quantity: 8, safety_stock: 3, created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p4', sku: 'TEE-OVR-BLK-M', name: 'Oversized Cotton Tee (Black, M)', description: 'Heavyweight 100% organic cotton basic t-shirt.', category: 'Apparel', cost_price: 250.00, selling_price: 590.00, barcode: '8850123456791', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80', quantity: 200, safety_stock: 20, created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
      { id: 'p5', sku: 'DESK-MAT-GRY', name: 'Premium Felt Desk Mat (Gray)', description: 'Anti-slip wool felt desk pad (800x400mm) for workstations.', category: 'Office Supplies', cost_price: 300.00, selling_price: 650.00, barcode: '8850123456792', image_url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80', quantity: 80, safety_stock: 15, created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString() }
    ]));
  }

  // Seed transactions
  if (!localStorage.getItem('mock_stock_transactions')) {
    localStorage.setItem('mock_stock_transactions', JSON.stringify([
      { id: 't1', product_id: 'p1', transaction_type: 'IN', quantity: 100, notes: 'Initial purchase order receive', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't2', product_id: 'p2', transaction_type: 'IN', quantity: 50, notes: 'Initial purchase order receive', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't3', product_id: 'p3', transaction_type: 'IN', quantity: 10, notes: 'Initial secure batch import', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't4', product_id: 'p4', transaction_type: 'IN', quantity: 200, notes: 'Bulk arrival', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't5', product_id: 'p5', transaction_type: 'IN', quantity: 80, notes: 'Bulk arrival', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 't6', product_id: 'p1', transaction_type: 'OUT', quantity: 15, notes: 'Retail shop sale POS-001', created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
      { id: 't7', product_id: 'p2', transaction_type: 'OUT', quantity: 8, notes: 'Retail shop sale POS-002', created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString() },
      { id: 't8', product_id: 'p3', transaction_type: 'OUT', quantity: 2, notes: 'Online order Shopify #1042', created_at: new Date(Date.now() - 3600000 * 12).toISOString() }
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
        const sessionData = localStorage.getItem('app_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          return { data: { session }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      signInWithPassword: async ({ username, password }) => {
        if (typeof window === 'undefined') return { data: null, error: { message: 'Window undefined' } };
        const users = getStorage('mock_users');
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          const session = { user: { id: user.id, username: user.username, name: user.name, role: user.role } };
          localStorage.setItem('app_session', JSON.stringify(session));
          return { data: { user: session.user, session }, error: null };
        }
        return { data: null, error: { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } };
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('app_session');
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
          quantity: parseInt(product.quantity || 0),
          safety_stock: parseInt(product.safety_stock || 5),
          created_at: new Date().toISOString()
        };
        products.push(newProduct);
        setStorage('mock_products', products);
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
            quantity: parseInt(updates.quantity !== undefined ? updates.quantity : products[index].quantity),
            safety_stock: parseInt(updates.safety_stock !== undefined ? updates.safety_stock : products[index].safety_stock),
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

        let txs = getStorage('mock_stock_transactions');
        txs = txs.filter(t => t.product_id !== id);
        setStorage('mock_stock_transactions', txs);
        return { error: null };
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

        // Update product quantity
        const products = getStorage('mock_products');
        const product = products.find(p => p.id === newTx.product_id);
        if (product) {
          const qty = parseInt(newTx.quantity, 10);
          if (newTx.transaction_type === 'IN') {
            product.quantity += qty;
          } else if (newTx.transaction_type === 'OUT') {
            product.quantity -= qty;
          } else if (newTx.transaction_type === 'ADJUST') {
            // ADJUST depends on direction
            if (newTx.direction === 'out') {
              product.quantity -= qty;
            } else {
              product.quantity += qty;
            }
          }
          setStorage('mock_products', products);
        }
        return { data: newTx, error: null };
      },
      updateProductStock: async (productId, quantity, safetyStock) => {
        const products = getStorage('mock_products');
        const product = products.find(p => p.id === productId);
        if (product) {
          product.quantity = parseInt(quantity, 10);
          if (safetyStock !== undefined) {
            product.safety_stock = parseInt(safetyStock, 10);
          }
          setStorage('mock_products', products);
          return { data: product, error: null };
        }
        return { data: null, error: { message: 'Product not found' } };
      },
      uploadImage: async (file) => {
        // In mock mode, convert to base64
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ data: { publicUrl: reader.result }, error: null });
          };
          reader.onerror = () => reject({ message: 'Failed to read file' });
          reader.readAsDataURL(file);
        });
      },
      deleteImage: async () => {
        // In mock mode, do nothing
        return { error: null };
      },
      // User management
      getUsers: async () => {
        return { data: getStorage('mock_users'), error: null };
      },
      createUser: async (userData) => {
        const users = getStorage('mock_users');
        if (users.some(u => u.username === userData.username)) {
          return { data: null, error: { message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' } };
        }
        const newUser = {
          id: 'u_' + Math.random().toString(36).substr(2, 9),
          ...userData,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        setStorage('mock_users', users);
        return { data: newUser, error: null };
      },
      updateUser: async (id, updates) => {
        const users = getStorage('mock_users');
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users[index] = { ...users[index], ...updates };
          setStorage('mock_users', users);
          return { data: users[index], error: null };
        }
        return { data: null, error: { message: 'User not found' } };
      },
      deleteUser: async (id) => {
        let users = getStorage('mock_users');
        users = users.filter(u => u.id !== id);
        setStorage('mock_users', users);
        return { error: null };
      },
      // Settings management (mock mode)
      getSettings: async () => {
        const settings = localStorage.getItem('mock_settings');
        if (!settings) {
          // Seed default settings
          const defaults = [
            { key: 'kpi_monthly_sales_target', value: '50000', description: 'Monthly sales target in THB' }
          ];
          localStorage.setItem('mock_settings', JSON.stringify(defaults));
          return { data: defaults, error: null };
        }
        return { data: JSON.parse(settings), error: null };
      },
      getSetting: async (key) => {
        const settings = JSON.parse(localStorage.getItem('mock_settings') || '[]');
        const setting = settings.find(s => s.key === key);
        return { data: setting || null, error: null };
      },
      updateSetting: async (key, value) => {
        let settings = JSON.parse(localStorage.getItem('mock_settings') || '[]');
        const existingIndex = settings.findIndex(s => s.key === key);
        if (existingIndex !== -1) {
          settings[existingIndex].value = value;
          settings[existingIndex].updated_at = new Date().toISOString();
        } else {
          settings.push({ key, value, updated_at: new Date().toISOString() });
        }
        localStorage.setItem('mock_settings', JSON.stringify(settings));
        return { error: null };
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
  getTransactions: async () => supabaseClient.from('stock_transactions').select('*').order('created_at', { ascending: false }),
  createTransaction: async (tx) => supabaseClient.from('stock_transactions').insert([tx]).select().single(),
  updateProductStock: async (productId, quantity, safetyStock) => {
    const updateData = { quantity: parseInt(quantity, 10) };
    if (safetyStock !== undefined) {
      updateData.safety_stock = parseInt(safetyStock, 10);
    }
    const { data, error } = await supabaseClient.from('products').update(updateData).eq('id', productId).select().single();
    if (error) throw error;
    return { data, error: null };
  },
  // Image upload to Supabase Storage
  uploadImage: async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseClient.storage
      .from('attachments')
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('attachments')
      .getPublicUrl(filePath);

    return { data: { path: filePath, publicUrl }, error: null };
  },
  // Delete image from Supabase Storage
  deleteImage: async (url) => {
    if (!url) return { error: null };

    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf('attachments');
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
        return { error: null }; // Not a Supabase storage URL or invalid
      }
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabaseClient.storage
        .from('attachments')
        .remove([filePath]);

      return { error };
    } catch (e) {
      // URL parsing failed, not a Supabase URL
      return { error: null };
    }
  },
  // User management (Supabase mode - using app_users table)
  getUsers: async () => supabaseClient.from('app_users').select('*').order('username'),
  createUser: async (userData) => {
    const { data, error } = await supabaseClient.from('app_users').insert([userData]).select().single();
    if (error) throw error;
    return { data, error: null };
  },
  updateUser: async (id, updates) => {
    const { data, error } = await supabaseClient.from('app_users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { data, error: null };
  },
  deleteUser: async (id) => {
    const { error } = await supabaseClient.from('app_users').delete().eq('id', id);
    return { error };
  },
  // Settings management (Supabase mode)
  getSettings: async () => {
    const { data, error } = await supabaseClient.from('app_settings').select('*').order('key');
    if (error) throw error;
    return { data, error: null };
  },
  getSetting: async (key) => {
    try {
      const { data, error } = await supabaseClient.from('app_settings').select('*').eq('key', key).maybeSingle();
      if (error) {
        // Silently return null for any error (table doesn't exist, permission issue, etc.)
        return { data: null, error: null };
      }
      return { data, error: null };
    } catch (err) {
      // Catch any exceptions and return null
      return { data: null, error: null };
    }
  },
  updateSetting: async (key, value) => {
    const { error } = await supabaseClient.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { error: null };
  }
} : createMockClient().db;

export const auth = isRealSupabase ? supabaseClient.auth : createMockClient().auth;

export const isMocked = !isRealSupabase;

// Simple username/password auth (works for both mock and Supabase)
export const userAuth = {
  getSession: async () => {
    if (typeof window === 'undefined') return { session: null };
    const sessionData = localStorage.getItem('app_session');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  },
  login: async (username, password) => {
    if (isMocked) {
      // Mock mode - check against LocalStorage users
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        const session = { user: { id: user.id, username: user.username, name: user.name, role: user.role } };
        localStorage.setItem('app_session', JSON.stringify(session));
        return { success: true, user: session.user };
      }
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    } else {
      // Supabase mode - check against app_users table
      const { data, error } = await supabaseClient
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
      }

      const session = { user: { id: data.id, username: data.username, name: data.name, role: data.role } };
      localStorage.setItem('app_session', JSON.stringify(session));
      return { success: true, user: session.user };
    }
  },
  logout: async () => {
    localStorage.removeItem('app_session');
    return { success: true };
  }
};
