'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import { 
  Search, 
  Settings, 
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  X,
  Sliders,
  TrendingDown,
  Warehouse
} from 'lucide-react';
import styles from './page.module.css';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'low', 'out'

  // Safety Stock Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStockRecord, setActiveStockRecord] = useState(null);
  const [safetyStockInput, setSafetyStockInput] = useState('');

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    try {
      const [prodRes, wareRes, stockRes] = await Promise.all([
        db.getProducts(),
        db.getWarehouses(),
        db.getStockLevels()
      ]);

      if (prodRes.error) throw prodRes.error;
      if (wareRes.error) throw wareRes.error;
      if (stockRes.error) throw stockRes.error;

      setProducts(prodRes.data || []);
      setWarehouses(wareRes.data || []);
      setStockLevels(stockRes.data || []);
    } catch (err) {
      showNotification('error', 'ไม่สามารถโหลดข้อมูลคลังสินค้าได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Compile combined inventory records
  const inventoryItems = useMemo(() => {
    return stockLevels.map(level => {
      const product = products.find(p => p.id === level.product_id);
      const warehouse = warehouses.find(w => w.id === level.warehouse_id);
      
      const qty = level.quantity || 0;
      const safety = level.safety_stock || 0;
      
      let status = 'normal';
      let statusText = 'ปกติ (In Stock)';
      if (qty === 0) {
        status = 'out';
        statusText = 'หมด (Out of Stock)';
      } else if (qty <= safety) {
        status = 'low';
        statusText = 'ต่ำกว่าเกณฑ์ (Low Stock)';
      }

      return {
        ...level,
        productName: product ? product.name : 'Unknown Product',
        productSku: product ? product.sku : 'Unknown SKU',
        productCategory: product ? product.category : 'General',
        warehouseName: warehouse ? warehouse.name : 'Unknown Warehouse',
        status,
        statusText
      };
    });
  }, [stockLevels, products, warehouses]);

  // Filter combined records
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // 1. Search Query filter (matches SKU or Product Name)
      const matchesSearch = 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productSku.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Warehouse filter
      const matchesWarehouse = selectedWarehouse === '' || item.warehouse_id === selectedWarehouse;
      
      // 3. Status filter
      let matchesStatus = true;
      if (statusFilter === 'low') {
        matchesStatus = item.status === 'low' || item.status === 'out';
      } else if (statusFilter === 'out') {
        matchesStatus = item.status === 'out';
      }

      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [inventoryItems, searchQuery, selectedWarehouse, statusFilter]);

  const openAdjustModal = (item) => {
    setActiveStockRecord(item);
    setSafetyStockInput(item.safety_stock.toString());
    setIsModalOpen(true);
  };

  const handleAdjustSafety = async (e) => {
    e.preventDefault();
    const safetyVal = parseInt(safetyStockInput, 10);
    if (isNaN(safetyVal) || safetyVal < 0) {
      showNotification('error', 'กรุณาระบุเกณฑ์เตือนที่ถูกต้อง (ต้องมากกว่าหรือเท่ากับ 0)');
      return;
    }

    try {
      const { error } = await db.updateStockSafety(
        activeStockRecord.product_id,
        activeStockRecord.warehouse_id,
        safetyVal
      );
      if (error) throw error;
      
      showNotification('success', `อัปเดตเกณฑ์แจ้งเตือนสต๊อกต่ำของ ${activeStockRecord.productName} เรียบร้อยแล้ว`);
      setIsModalOpen(false);
      loadData(); // Reload stock level state
    } catch (err) {
      showNotification('error', 'ไม่สามารถบันทึกข้อมูลได้: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          กำลังโหลดข้อมูลระดับสต๊อกสินค้า...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>ระดับสินค้าคงคลัง (Inventory Levels)</h1>
          <p>ตรวจเช็กระดับสินค้าคงเหลือในแต่ละคลัง พร้อมตั้งค่าเกณฑ์การแจ้งเตือนสต๊อกต่ำ</p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`
          alert-notification 
          ${notification.type === 'success' ? 'alert-success-global' : 'alert-error-global'}
        `}
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

      {/* Filters Box */}
      <div className={styles.filters}>
        <div className={styles.leftFilters}>
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
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className={`${styles.selectInput} glass-card`}
          >
            <option value="">คลังสินค้าทั้งหมด (All Warehouses)</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${styles.selectInput} glass-card`}
          >
            <option value="">ระดับสถานะทั้งหมด</option>
            <option value="low">เฉพาะยอดต่ำกว่าเกณฑ์ / สินค้าหมด</option>
            <option value="out">เฉพาะสินค้าหมดคลัง (Out of Stock)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            ไม่มีรายการระดับสินค้าที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>สินค้า (Product)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>คลังสินค้า (Warehouse)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>คงเหลือ (Stock Qty)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>เกณฑ์ขั้นต่ำ (Safety)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>สถานะ (Status)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>จัดการสต๊อก (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={`${item.product_id}-${item.warehouse_id}-${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.productName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>SKU: {item.productSku} | หมวดหมู่: {item.productCategory}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '500' }}>
                      {item.warehouseName}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`
                        ${styles.qtyVal} 
                        ${item.status === 'out' ? styles.qtyDanger : ''}
                        ${item.status === 'low' ? styles.qtyWarning : ''}
                        ${item.status === 'normal' ? styles.qtyNormal : ''}
                      `}>
                        {item.quantity}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>ชิ้น</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                      {item.safety_stock} ชิ้น
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`
                        ${styles.statusBadge} 
                        ${item.status === 'normal' ? styles.statusNormal : ''}
                        ${item.status === 'low' ? styles.statusWarning : ''}
                        ${item.status === 'out' ? styles.statusDanger : ''}
                      `}>
                        {item.statusText}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div className={styles.actionCell}>
                        <button onClick={() => openAdjustModal(item)} className={styles.adjustBtn}>
                          <Sliders size={13} />
                          <span>ตั้งเกณฑ์เตือน</span>
                        </button>
                        
                        <Link 
                          href={`/transactions?productId=${item.product_id}&warehouseId=${item.warehouse_id}`}
                          className={styles.transBtn}
                        >
                          <ArrowRightLeft size={13} />
                          <span>รับ/จ่าย/โอน</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Safety Limit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'var(--glass-blur)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>ตั้งเกณฑ์แจ้งเตือนสต๊อกต่ำ</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSafety} className={styles.modalForm}>
              <div className={styles.metaGrid}>
                <span className={styles.metaLabel}>สินค้า:</span>
                <span className={styles.metaVal}>{activeStockRecord?.productName}</span>
                
                <span className={styles.metaLabel}>คลังสินค้า:</span>
                <span className={styles.metaVal}>{activeStockRecord?.warehouseName}</span>
                
                <span className={styles.metaLabel}>จำนวนปัจจุบัน:</span>
                <span className={styles.metaVal} style={{
                  color: activeStockRecord?.status === 'out' ? 'var(--color-error)' : 
                         activeStockRecord?.status === 'low' ? 'var(--color-warning)' : 'inherit'
                }}>
                  {activeStockRecord?.quantity} ชิ้น
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="safety-limit-input" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  เกณฑ์สต๊อกต่ำขั้นต่ำ (ชิ้น)
                </label>
                <input
                  id="safety-limit-input"
                  type="number"
                  placeholder="เช่น 10"
                  value={safetyStockInput}
                  onChange={(e) => setSafetyStockInput(e.target.value)}
                  required
                  min="0"
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  * เมื่อจำนวนสินค้าคงเหลือในคลังนี้ น้อยกว่าหรือเท่ากับตัวเลขดังกล่าว ระบบจะแสดงสถานะเตือนสีส้มทันที
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  ยกเลิก
                </button>
                <button type="submit" style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '600'
                }}>
                  บันทึกเกณฑ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
