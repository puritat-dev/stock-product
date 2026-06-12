'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/supabase';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Barcode, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileImage
} from 'lucide-react';
import styles from './page.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Alert notification
  const [notification, setNotification] = useState(null);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const { data, error } = await db.getProducts();
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      showNotification('error', 'ไม่สามารถโหลดข้อมูลสินค้าได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [products]);

  // Handle Search and Filter
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setSku('');
    setName('');
    setDescription('');
    setCategory('');
    setCostPrice('');
    setSellingPrice('');
    setBarcode('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setSku(product.sku);
    setName(product.name);
    setDescription(product.description || '');
    setCategory(product.category || '');
    setCostPrice(product.cost_price.toString());
    setSellingPrice(product.selling_price.toString());
    setBarcode(product.barcode || '');
    setImageUrl(product.image_url || '');
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      showNotification('error', 'กรุณากรอกข้อมูล SKU และ ชื่อสินค้า');
      return;
    }

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || 'General',
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      barcode: barcode.trim() || null,
      image_url: imageUrl.trim() || null
    };

    try {
      if (modalMode === 'add') {
        // Check for duplicate SKU first
        const isDuplicate = products.some(p => p.sku.toUpperCase() === payload.sku);
        if (isDuplicate) {
          showNotification('error', `รหัส SKU: ${payload.sku} ซ้ำในระบบ`);
          return;
        }

        const { data, error } = await db.createProduct(payload);
        if (error) throw error;
        showNotification('success', 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว');
      } else {
        // Edit mode
        const isDuplicate = products.some(p => p.sku.toUpperCase() === payload.sku && p.id !== selectedProduct.id);
        if (isDuplicate) {
          showNotification('error', `รหัส SKU: ${payload.sku} ซ้ำกับสินค้าอื่นในระบบ`);
          return;
        }

        const { error } = await db.updateProduct(selectedProduct.id, payload);
        if (error) throw error;
        showNotification('success', 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showNotification('error', 'ไม่สามารถบันทึกข้อมูลได้: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await db.deleteProduct(selectedProduct.id);
      if (error) throw error;
      showNotification('success', `ลบสินค้า ${selectedProduct.name} เรียบร้อยแล้ว`);
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      showNotification('error', 'ไม่สามารถลบสินค้าได้: ' + err.message);
    }
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  // Profit margin calculator
  const calculateMargin = (cost, sell) => {
    const costVal = parseFloat(cost || 0);
    const sellVal = parseFloat(sell || 0);
    if (sellVal <= 0) return 0;
    return Math.round(((sellVal - costVal) / sellVal) * 100);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          กำลังโหลดรายการสินค้า...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>การจัดการข้อมูลสินค้า</h1>
          <p>เพิ่ม แก้ไข ค้นหา และปรับปรุงข้อมูลสินค้าทั้งหมดในคลัง</p>
        </div>
        <button onClick={openAddModal} className={styles.addBtn}>
          <Plus size={18} />
          <span>เพิ่มสินค้าใหม่</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`${styles.alert} ${notification.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className={styles.actionBar}>
        <div className={styles.searchFilters}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า, รหัส SKU หรือ บาร์โค้ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${styles.categorySelect} glass-card`}
          >
            <option value="">ทุกหมวดหมู่ (All)</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p>ไม่พบรายการสินค้าที่ระบุ</p>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map(product => {
            const margin = calculateMargin(product.cost_price, product.selling_price);
            return (
              <div key={product.id} className={`${styles.productCard} glass-card`}>
                <div className={styles.imageContainer}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className={styles.productImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = ''; // Clear source to trigger fallback UI
                      }}
                    />
                  ) : null}
                  {(!product.image_url || product.image_url.trim() === '') && (
                    <div className={styles.imagePlaceholder}>
                      <FileImage size={32} />
                      <span>ไม่มีรูปภาพสินค้า</span>
                    </div>
                  )}
                  {product.category && (
                    <span className={styles.categoryTag}>{product.category}</span>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <div>
                    <span className={styles.sku}>SKU: {product.sku}</span>
                    <h2 className={styles.prodName} title={product.name}>{product.name}</h2>
                  </div>

                  <p className={styles.description} title={product.description || ''}>
                    {product.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                  </p>

                  <div className={styles.priceSection}>
                    <div>
                      <div className={styles.priceLabel}>ทุน (Cost)</div>
                      <span className={styles.costPrice}>{formatCurrency(product.cost_price)}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={styles.priceLabel}>ขาย (Sell)</div>
                      <span className={styles.sellPrice}>{formatCurrency(product.selling_price)}</span>
                      {margin > 0 && (
                        <div>
                          <span className={styles.marginPill}>กำไร {margin}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {product.barcode && (
                    <div className={styles.barcodeSection}>
                      <Barcode size={14} />
                      <span>{product.barcode}</span>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button onClick={() => openEditModal(product)} className={styles.editBtn}>
                      <Edit3 size={14} />
                      <span>แก้ไข</span>
                    </button>
                    <button onClick={() => openDeleteConfirm(product)} className={styles.deleteBtn}>
                      <Trash2 size={14} />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-card`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'add' ? 'เพิ่มสินค้าใหม่ (Add SKU)' : 'แก้ไขรายละเอียดสินค้า'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                
                <div className={styles.formGroup}>
                  <label htmlFor="modal-sku">รหัสสินค้า (SKU) *</label>
                  <input
                    id="modal-sku"
                    type="text"
                    placeholder="เช่น COF-ARAB-250"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    disabled={modalMode === 'edit'} // Don't allow changing SKU in edit for integrity
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="modal-barcode">รหัสบาร์โค้ด (Barcode)</label>
                  <input
                    id="modal-barcode"
                    type="text"
                    placeholder="ตัวเลขบาร์โค้ด 13 หลัก"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                  <label htmlFor="modal-name">ชื่อสินค้า (Product Name) *</label>
                  <input
                    id="modal-name"
                    type="text"
                    placeholder="เช่น เมล็ดกาแฟอาราบิก้าคั่วกลาง"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                  <label htmlFor="modal-desc">รายละเอียดสินค้า (Description)</label>
                  <textarea
                    id="modal-desc"
                    rows={2}
                    placeholder="เขียนอธิบายลักษณะของสินค้า..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="modal-category">หมวดหมู่สินค้า (Category)</label>
                  <input
                    id="modal-category"
                    type="text"
                    placeholder="เช่น เครื่องดื่ม, ไอที"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="modal-img">ที่อยู่ลิงก์รูปภาพ (Image URL)</label>
                  <input
                    id="modal-img"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="modal-cost">ราคาทุน (Cost Price)</label>
                  <input
                    id="modal-cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="modal-sell">ราคาขาย (Selling Price)</label>
                  <input
                    id="modal-sell"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>

              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {modalMode === 'add' ? 'บันทึกสินค้า' : 'อัปเดตข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.confirmCard} ${styles.modal} glass-card`}>
            <div className={styles.confirmIcon}>
              <Trash2 size={24} />
            </div>
            <h2 className={styles.confirmTitle}>ยืนยันการลบสินค้า</h2>
            <p className={styles.confirmText}>
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})?<br />
              <span style={{ color: 'var(--color-error)', fontSize: '12px', fontWeight: '500' }}>
                ⚠️ คำเตือน: การลบจะทำลายข้อมูลประวัติการทำธุรกรรมและระดับสินค้าคงคลังทั้งหมดที่ผูกกับสินค้านี้ทันที!
              </span>
            </p>
            <div className={styles.modalActions} style={{ justifyContent: 'center', border: 'none', paddingTop: 0 }}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn}>
                ยกเลิก
              </button>
              <button onClick={handleDelete} className={styles.saveBtn} style={{ backgroundColor: 'var(--color-error)' }}>
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
