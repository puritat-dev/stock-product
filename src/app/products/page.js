'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, isMocked } from '@/lib/supabase';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileImage,
  Package,
  Activity
} from 'lucide-react';
import { ProductsSkeleton } from '@/components/Skeleton';
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

  // Transaction modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txProductId, setTxProductId] = useState('');
  const [txTransactionType, setTxTransactionType] = useState('IN');
  const [txAdjustDirection, setTxAdjustDirection] = useState('increase');
  const [txQuantity, setTxQuantity] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txModalError, setTxModalError] = useState(null);
  const [txModalLoading, setTxModalLoading] = useState(false);

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
  const [quantity, setQuantity] = useState('0');
  const [safetyStock, setSafetyStock] = useState('5');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setSku('');
    setName('');
    setDescription('');
    setCategory('');
    setCostPrice('');
    setSellingPrice('');
    setQuantity('0');
    setSafetyStock('5');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
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
    setQuantity((product.quantity ?? 0).toString());
    setSafetyStock((product.safety_stock ?? 5).toString());
    setImageUrl(product.image_url || '');
    setImageFile(null);
    setImagePreview(product.image_url || '');
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

    let finalImageUrl = imageUrl.trim() || null;

    try {
      // Upload image to Supabase Storage if using real Supabase and there's a new file
      if (!isMocked && imageFile) {
        const timestamp = Date.now();
        const filename = `${sku.trim().toUpperCase()}_${timestamp}`;
        const { data: uploadData, error: uploadError } = await db.uploadImage(imageFile, filename);

        if (uploadError) {
          throw new Error('ไม่สามารถอัปโหลดรูปภาพ: ' + uploadError.message);
        }

        finalImageUrl = uploadData.publicUrl;

        // Delete old image if updating and there was a previous image
        if (modalMode === 'edit' && selectedProduct?.image_url) {
          await db.deleteImage(selectedProduct.image_url);
        }
      }

      const payload = {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || 'General',
        cost_price: parseFloat(costPrice) || 0,
        selling_price: parseFloat(sellingPrice) || 0,
        quantity: parseInt(quantity) || 0,
        safety_stock: parseInt(safetyStock) || 5,
        image_url: finalImageUrl
      };

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
      // Delete image from Supabase Storage if using real Supabase
      if (!isMocked && selectedProduct?.image_url) {
        await db.deleteImage(selectedProduct.image_url);
      }

      const { error } = await db.deleteProduct(selectedProduct.id);
      if (error) throw error;
      showNotification('success', `ลบสินค้า ${selectedProduct.name} เรียบร้อยแล้ว`);
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      showNotification('error', 'ไม่สามารถลบสินค้าได้: ' + err.message);
    }
  };

  const openTxModal = (productId = null) => {
    setTxProductId(productId || products[0]?.id || '');
    setTxTransactionType('IN');
    setTxAdjustDirection('increase');
    setTxQuantity('');
    setTxNotes('');
    setTxModalError(null);
    setIsTxModalOpen(true);
  };

  const handleLogTransaction = async (e) => {
    e.preventDefault();
    setTxModalError(null);

    const qty = parseInt(txQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setTxModalError('กรุณากรอกจำนวนสินค้าที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    setTxModalLoading(true);
    const payload = {
      product_id: txProductId,
      transaction_type: txTransactionType,
      quantity: qty,
      notes: txNotes.trim() || null
    };

    if (txTransactionType === 'ADJUST') {
      payload.direction = txAdjustDirection;
    }

    try {
      const { error } = await db.createTransaction(payload);
      if (error) throw error;

      showNotification('success', 'บันทึกการเคลื่อนไหวสต๊อกสำเร็จ');
      setIsTxModalOpen(false);
      fetchProducts();
    } catch (err) {
      setTxModalError(err.message);
    } finally {
      setTxModalLoading(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result); // Store base64 as URL
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  if (loading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>การจัดการข้อมูลสินค้า</h1>
          <p>เพิ่ม แก้ไข ค้นหา และปรับปรุงข้อมูลสินค้าทั้งหมดในคลัง</p>
        </div>
        <div className={styles.actionButtons}>
          <button onClick={() => openTxModal()} className={`${styles.addBtn} ${styles.txBtn}`}>
            <Activity size={18} />
            <span>บันทึกรายการ</span>
          </button>
          <button onClick={openAddModal} className={styles.addBtn}>
            <Plus size={18} />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
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
              placeholder="ค้นหาชื่อสินค้า หรือ รหัส SKU..."
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
        <>
          <div className={styles.productsGrid}>
            {paginatedProducts.map(product => {
            const isLowStock = product.quantity <= product.safety_stock;
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
                  {/* Stock badge under image */}
                  <div className={`${styles.stockBadge} ${isLowStock ? styles.stockBadgeLow : styles.stockBadgeOK}`}>
                    <Package size={12} />
                    <span>{product.quantity} ชิ้น</span>
                    {isLowStock && <AlertTriangle size={12} />}
                  </div>
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
                    </div>
                  </div>

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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnDisabled : ''}`}
            >
              ก่อนหน้า
            </button>

            <div className={styles.pageNumbers}>
              {(() => {
                const pages = [];

                // Always add first page
                pages.push(1);

                // Add ellipsis and middle pages
                if (currentPage > 3) {
                  pages.push('...');
                }

                // Add pages around current (max 2 on each side)
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                  pages.push(i);
                }

                // Add ellipsis before last page
                if (currentPage < totalPages - 2) {
                  pages.push('...');
                }

                // Always add last page (if different from first)
                if (totalPages > 1) {
                  pages.push(totalPages);
                }

                // Remove duplicates and consecutive ellipsis
                const filtered = [];
                let lastWasEllipsis = false;
                for (const p of pages) {
                  if (p === '...') {
                    if (!lastWasEllipsis) {
                      filtered.push(p);
                      lastWasEllipsis = true;
                    }
                  } else {
                    if (filtered[filtered.length - 1] !== p) {
                      filtered.push(p);
                    }
                    lastWasEllipsis = false;
                  }
                }

                return filtered.map((page, idx) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${styles.pageBtn} ${styles.pageNum} ${currentPage === page ? styles.pageBtnActive : ''}`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnDisabled : ''}`}
            >
              ถัดไป
            </button>

            <div className={styles.pageInfo}>
              หน้า {currentPage} จาก {totalPages} (ทั้งหมด {filteredProducts.length} รายการ)
            </div>
          </div>
        )}
        </>
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

                <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                  <label>รูปภาพสินค้า (Product Image)</label>
                  <div className={styles.imageUpload}>
                    {imagePreview ? (
                      <div className={styles.imagePreviewContainer}>
                        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                        <button type="button" onClick={handleRemoveImage} className={styles.removeImageBtn}>
                          <X size={16} />
                          ลบรูป
                        </button>
                      </div>
                    ) : (
                      <div className={styles.imageUploadZone}>
                        <input
                          id="modal-img"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className={styles.fileInput}
                        />
                        <label htmlFor="modal-img" className={styles.uploadLabel}>
                          <FileImage size={32} />
                          <span>คลิกเพื่ออัปโหลดรูปภาพ</span>
                          <span className={styles.uploadHint}>รองรับ JPG, PNG, GIF (สูงสุด 5MB)</span>
                        </label>
                      </div>
                    )}
                  </div>
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

                <div className={styles.formGroup}>
                  <label htmlFor="modal-qty">จำนวนสินค้าคงคลัง (Quantity) *</label>
                  <input
                    id="modal-qty"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="modal-safety">เกณฑ์เตือนสต๊อกต่ำ (Safety Stock) *</label>
                  <input
                    id="modal-safety"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    เตือนเมื่อสต๊อกต่ำกว่าจำนวนนี้
                  </small>
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

      {/* Transaction Log Modal */}
      {isTxModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-card`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>บันทึกรายการเคลื่อนไหวสต๊อก</h2>
              <button onClick={() => setIsTxModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogTransaction} className={styles.form}>
              {txModalError && (
                <div className={styles.modalAlert}>
                  <AlertTriangle size={16} />
                  <span>{txModalError}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="tx-product">สินค้า (Product) *</label>
                <select
                  id="tx-product"
                  value={txProductId}
                  onChange={(e) => setTxProductId(e.target.value)}
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="tx-type">ประเภทธุรกรรม *</label>
                  <select
                    id="tx-type"
                    value={txTransactionType}
                    onChange={(e) => setTxTransactionType(e.target.value)}
                    required
                  >
                    <option value="IN">IN - รับสินค้าเข้า</option>
                    <option value="OUT">OUT - จ่ายสินค้าออก / ขาย</option>
                    <option value="ADJUST">ADJUST - ปรับปรุงยอดขาด/เกิน</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="tx-qty">จำนวนสินค้า (ชิ้น) *</label>
                  <input
                    id="tx-qty"
                    type="number"
                    min="1"
                    placeholder="ระบุตัวเลข เช่น 10"
                    value={txQuantity}
                    onChange={(e) => setTxQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {txTransactionType === 'ADJUST' && (
                <div className={styles.formGroup}>
                  <label htmlFor="tx-direction">ประเภทการปรับยอด *</label>
                  <select
                    id="tx-direction"
                    value={txAdjustDirection}
                    onChange={(e) => setTxAdjustDirection(e.target.value)}
                    required
                  >
                    <option value="in">เพิ่มสินค้า (+) - พบของเพิ่ม / ยอดน้อยกว่าจริง</option>
                    <option value="out">ลดสินค้า (-) - ของหาย / เสียหาย / ยอดมากกว่าจริง</option>
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="tx-notes">หมายเหตุ / เหตุผล (Notes)</label>
                <textarea
                  id="tx-notes"
                  rows={2}
                  placeholder="เช่น ซื้อจากซัพพลายเออร์ A, เลขที่ใบเสร็จ, ตรวจนับสินค้าจริง..."
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsTxModalOpen(false)} className={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" disabled={txModalLoading} className={styles.saveBtn}>
                  {txModalLoading ? 'กำลังบันทึก...' : 'บันทึกธุรกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
