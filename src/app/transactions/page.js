'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import { 
  Search, 
  Plus, 
  ArrowRight, 
  Calendar, 
  FileText, 
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import styles from './page.module.css';

// Sub-component that consumes search params (must be wrapped in Suspense)
function TransactionsList() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form Fields
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [transactionType, setTransactionType] = useState('IN'); // 'IN', 'OUT', 'ADJUST'
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      const [prodRes, wareRes, txRes] = await Promise.all([
        db.getProducts(),
        db.getWarehouses(),
        db.getTransactions()
      ]);

      if (prodRes.error) throw prodRes.error;
      if (wareRes.error) throw wareRes.error;
      if (txRes.error) throw txRes.error;

      setProducts(prodRes.data || []);
      setWarehouses(wareRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      showNotification('error', 'ไม่สามารถโหลดประวัติสต๊อกได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-populate if query params exist (e.g. redirected from inventory page)
  useEffect(() => {
    const pId = searchParams.get('productId');
    const wId = searchParams.get('warehouseId');
    
    if (pId && wId && products.length > 0) {
      setProductId(pId);
      setWarehouseId(wId);
      setTransactionType('IN'); // Default type
      setIsModalOpen(true);
    }
  }, [searchParams, products]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const openLogModal = () => {
    setProductId(products[0]?.id || '');
    setWarehouseId(warehouses[0]?.id || '');
    setTransactionType('IN');
    setQuantity('');
    setNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleLogTransaction = async (e) => {
    e.preventDefault();
    setModalError(null);
    
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setModalError('กรุณากรอกจำนวนสินค้าที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    setModalLoading(true);
    const payload = {
      product_id: productId,
      warehouse_id: warehouseId,
      transaction_type: transactionType,
      quantity: qty,
      notes: notes.trim() || null
    };

    try {
      const { error } = await db.createTransaction(payload);
      if (error) throw error;
      
      showNotification('success', 'บันทึกการเคลื่อนไหวสต๊อกสำเร็จ');
      setIsModalOpen(false);
      loadData(); // Reload statistics
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Extract variables for layout
  const getProductSKU = (id) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.sku : 'N/A';
  };

  const getProductName = (id) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : 'Unknown Product';
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find(wh => wh.id === id);
    return w ? w.name : 'Unknown Warehouse';
  };

  // Filters calculation
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      const prodName = getProductName(tx.product_id).toLowerCase();
      const prodSku = getProductSKU(tx.product_id).toLowerCase();
      
      const matchesSearch = 
        prodName.includes(searchQuery.toLowerCase()) || 
        prodSku.includes(searchQuery.toLowerCase());
        
      const matchesType = typeFilter === '' || tx.transaction_type === typeFilter;
      
      const matchesWarehouse = 
        warehouseFilter === '' || 
        tx.warehouse_id === warehouseFilter;

      return matchesSearch && matchesType && matchesWarehouse;
    });
  }, [transactions, searchQuery, typeFilter, warehouseFilter, products]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        กำลังโหลดประวัติทำรายการสต๊อก...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>ประวัติการเคลื่อนไหวสต๊อก (Stock Card)</h1>
          <p>ตรวจสอบและบันทึกประวัติการรับสินค้า จ่ายออก และโอนย้ายระหว่างคลังสินค้า</p>
        </div>
        <button onClick={openLogModal} className={styles.logBtn}>
          <Plus size={18} />
          <span>บันทึกความเคลื่อนไหว</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`${styles.alert} ${notification.type === 'success' ? styles.alertSuccess : styles.alertError}`}
             style={{
               padding: '12px 16px',
               borderRadius: 'var(--radius-sm)',
               fontSize: '14px',
               fontWeight: '500',
               display: 'flex',
               alignItems: 'center',
               gap: '10px',
               backgroundColor: notification.type === 'success' ? 'var(--color-success-light)' : 'var(--color-error-light)',
               color: notification.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
               border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
             }}
        >
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={styles.actionBar}>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ค้นหาตามสินค้า หรือ SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`${styles.selectInput} glass-card`}
          >
            <option value="">ประเภททั้งหมด</option>
            <option value="IN">IN (รับเข้า)</option>
            <option value="OUT">OUT (จ่ายออก)</option>
            <option value="ADJUST">ADJUST (ปรับยอด)</option>
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className={`${styles.selectInput} glass-card`}
          >
            <option value="">คลังสินค้าทั้งหมด</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filteredTxs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            ไม่มีประวัติการทำรายการตรงกับเงื่อนไขที่ระบุ
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap' }}>วัน-เวลา (Date-Time)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>สินค้า (Product)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>ประเภท (Type)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>คลังสินค้า / จัดเก็บ (Warehouse)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>จำนวน (Qty)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>หมายเหตุ (Notes)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        {new Date(tx.created_at).toLocaleString('th-TH')}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700' }}>{getProductName(tx.product_id)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {getProductSKU(tx.product_id)}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`
                        ${styles.txType} 
                        ${tx.transaction_type === 'IN' ? styles.txTypeIn : ''}
                        ${tx.transaction_type === 'OUT' ? styles.txTypeOut : ''}
                        ${tx.transaction_type === 'ADJUST' ? styles.txTypeAdjust : ''}
                      `}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '500' }}>
                      {getWarehouseName(tx.warehouse_id)}
                    </td>
                    <td style={{ 
                      padding: '16px 20px', 
                      fontWeight: '700', 
                      textAlign: 'right',
                      fontSize: '15px',
                      color: tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST' ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST' ? '+' : '-'}
                      {tx.quantity}
                    </td>
                    <td style={{ padding: '16px 20px' }} className={styles.notesCell} title={tx.notes || ''}>
                      {tx.notes ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span>{tx.notes}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Stock Transaction Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-card`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>บันทึกธุรกรรมความเคลื่อนไหวสต๊อก</h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogTransaction} className={styles.form}>
              {modalError && (
                <div className={styles.modalAlert}>
                  <AlertTriangle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="tx-product">สินค้า (Product SKU) *</label>
                <select
                  id="tx-product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="tx-type">ประเภทธุรกรรม *</label>
                  <select
                    id="tx-type"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    required
                  >
                    <option value="IN">IN - รับสินค้าเข้าคลัง</option>
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
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="tx-source">คลังสินค้า *</label>
                  <select
                    id="tx-source"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    required
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tx-notes">หมายเหตุ / เหตุผล (Notes)</label>
                <textarea
                  id="tx-notes"
                  rows={2}
                  placeholder="เช่น ซื้อจากซัพพลายเออร์ A, เลขที่ใบเสร็จ, ย้ายสินค้าไปสาขาชลบุรี..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" disabled={modalLoading} className={styles.saveBtn}>
                  {modalLoading ? 'กำลังบันทึก...' : 'บันทึกธุรกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Default export wraps search-params component in Suspense
export default function TransactionsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>กำลังเตรียมประวัติการเคลื่อนไหวสต๊อก...</div>}>
      <TransactionsList />
    </Suspense>
  );
}
