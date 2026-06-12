'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import { 
  Package, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  Activity, 
  Warehouse,
  TrendingUp,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import styles from './page.module.css';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Formatting date nicely
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('th-TH', options));

    const loadData = async () => {
      try {
        const [prodRes, wareRes, stockRes, txRes] = await Promise.all([
          db.getProducts(),
          db.getWarehouses(),
          db.getStockLevels(),
          db.getTransactions()
        ]);

        if (prodRes.data) setProducts(prodRes.data);
        if (wareRes.data) setWarehouses(wareRes.data);
        if (stockRes.data) setStockLevels(stockRes.data);
        if (txRes.data) setTransactions(txRes.data.slice(0, 5)); // Only show top 5
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 1. Calculate stats
  const totalSKUs = products.length;
  const totalStockQty = stockLevels.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  
  // Inventory valuation (Cost)
  const totalValuation = stockLevels.reduce((acc, curr) => {
    const product = products.find(p => p.id === curr.product_id);
    const cost = product ? parseFloat(product.cost_price || 0) : 0;
    return acc + (cost * (curr.quantity || 0));
  }, 0);

  // Low stock alerts
  const lowStockAlerts = stockLevels.filter(level => level.quantity <= level.safety_stock).map(level => {
    const product = products.find(p => p.id === level.product_id);
    const warehouse = warehouses.find(w => w.id === level.warehouse_id);
    return {
      product_id: level.product_id,
      warehouse_id: level.warehouse_id,
      productName: product ? product.name : 'Unknown Product',
      warehouseName: warehouse ? warehouse.name : 'Unknown Warehouse',
      quantity: level.quantity,
      safety_stock: level.safety_stock
    };
  });

  const lowStockCount = lowStockAlerts.length;

  // Warehouses distribution
  const warehouseDistribution = warehouses.map(w => {
    const qty = stockLevels
      .filter(level => level.warehouse_id === w.id)
      .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    return {
      ...w,
      totalQty: qty
    };
  });

  const grandTotalItems = warehouseDistribution.reduce((acc, curr) => acc + curr.totalQty, 0);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

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

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          กำลังประมวลผลข้อมูลแดชบอร์ด...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>ภาพรวมระบบสต๊อกสินค้า</h1>
          <p>Dashboard บันทึกยอด ข้อมูล และพิกัดสินค้าของคุณ</p>
        </div>
        <div className={styles.dateBadge}>{currentDate}</div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <Package size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>รายการสินค้า</span>
            <span className={styles.statValue}>
              {totalSKUs}
              <span className={styles.statUnit}>SKUs</span>
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <Layers size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>จำนวนสินค้าคงคลังทั้งหมด</span>
            <span className={styles.statValue}>
              {totalStockQty}
              <span className={styles.statUnit}>ชิ้น</span>
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconEmerald}`}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>มูลค่าต้นทุนสินค้า</span>
            <span className={styles.statValue}>{formatCurrency(totalValuation)}</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconAmber}`}>
            <AlertTriangle size={24} className={lowStockCount > 0 ? 'pulse-warning' : ''} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>สินค้าสต๊อกต่ำกว่าเกณฑ์</span>
            <span className={styles.statValue} style={{ color: lowStockCount > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {lowStockCount}
              <span className={styles.statUnit}>รายการ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.dashboardGrid}>
        
        {/* Left Side: Recent Transactions */}
        <div className={`${styles.panel} glass-card`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Activity size={20} className={styles.accent} />
              การเคลื่อนไหวสต๊อกล่าสุด (Recent Transactions)
            </h2>
            <Link href="/transactions" className={styles.viewAllLink}>
              ดูทั้งหมด <ArrowRight size={14} style={{ display: 'inline-block', marginLeft: '4px' }} />
            </Link>
          </div>

          <div className={styles.tableContainer}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                ไม่มีประวัติการทำรายการสต๊อก
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>วัน-เวลา</th>
                    <th>ประเภท</th>
                    <th>สินค้า</th>
                    <th>คลังสินค้า</th>
                    <th>จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(tx.created_at).toLocaleString('th-TH', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: 'short' })}
                      </td>
                      <td>
                        <span className={`
                          ${styles.txType} 
                          ${tx.transaction_type === 'IN' ? styles.txTypeIn : ''}
                          ${tx.transaction_type === 'OUT' ? styles.txTypeOut : ''}
                          ${tx.transaction_type === 'ADJUST' ? styles.txTypeAdjust : ''}
                        `}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{getProductName(tx.product_id)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {getProductSKU(tx.product_id)}</div>
                      </td>
                      <td>
                        {getWarehouseName(tx.warehouse_id)}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST' ? '+' : '-'}
                        {tx.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Alerts & Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Low Stock Alerts */}
          <div className={`${styles.panel} glass-card`}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle} style={{ color: lowStockCount > 0 ? 'var(--color-error)' : 'inherit' }}>
                <AlertTriangle size={20} />
                สินค้าใกล้หมด (Low Stock Alerts)
              </h2>
            </div>
            
            <div className={styles.alertList}>
              {lowStockAlerts.length === 0 ? (
                <div className={styles.noAlerts}>
                  🎉 สต๊อกสินค้าอยู่ในระดับปลอดภัยทุกรายการ
                </div>
              ) : (
                lowStockAlerts.map((alert, idx) => (
                  <div key={`${alert.product_id}-${alert.warehouse_id}-${idx}`} className={styles.alertItem}>
                    <div className={styles.alertItemLeft}>
                      <span className={styles.alertProdName}>{alert.productName}</span>
                      <span className={styles.alertWarehouse}>คลัง: {alert.warehouseName}</span>
                    </div>
                    <div className={styles.alertItemRight}>
                      <span className={styles.alertQty}>{alert.quantity} ชิ้น</span>
                      <span className={styles.alertSafety}>เกณฑ์เตือน: {alert.safety_stock} ชิ้น</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Warehouse Stock distribution */}
          <div className={`${styles.panel} glass-card`}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <Warehouse size={20} className={styles.accent} />
                สัดส่วนสินค้าตามคลัง (Distribution)
              </h2>
            </div>

            <div className={styles.warehouseList}>
              {warehouseDistribution.map(w => {
                const percentage = grandTotalItems > 0 ? Math.round((w.totalQty / grandTotalItems) * 100) : 0;
                return (
                  <div key={w.id} className={styles.warehouseItem}>
                    <div className={styles.warehouseMeta}>
                      <span className={styles.warehouseName}>{w.name}</span>
                      <span className={styles.warehouseQty}>{w.totalQty} ชิ้น ({percentage}%)</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
