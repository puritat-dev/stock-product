'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import {
  Search,
  ArrowRight,
  Calendar,
  FileText,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { TransactionsSkeleton } from '@/components/Skeleton';
import styles from './page.module.css';

// Sub-component that consumes search params (must be wrapped in Suspense)
function TransactionsList() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Notification state
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      const [prodRes, txRes] = await Promise.all([
        db.getProducts(),
        db.getTransactions()
      ]);

      if (prodRes.error) throw prodRes.error;
      if (txRes.error) throw txRes.error;

      setProducts(prodRes.data || []);
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


  // Helper functions
  const getProductSKU = (id) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.sku : 'N/A';
  };

  const getProductName = (id) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : 'Unknown Product';
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

      // Date filtering
      const txDate = new Date(tx.created_at);
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
      let matchesDate = true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && txDateOnly >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && txDateOnly <= end;
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [transactions, searchQuery, typeFilter, startDate, endDate, products]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTxs = filteredTxs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, startDate, endDate]);

  if (loading) {
    return <TransactionsSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Notification Toast */}
      {notification && (
        <div className={`${styles.alert} ${notification.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>ประวัติการทำรายการ</h1>
          <p>ตรวจสอบประวัติการรับสินค้าเข้า จ่ายสินค้าออก และปรับยอด</p>
        </div>
      </div>

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

          <div className={styles.dateFilter}>
            <Calendar size={16} className={styles.dateIcon} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
              placeholder="จากวันที่"
            />
            <span className={styles.dateSeparator}>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
              placeholder="ถึงวันที่"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className={styles.clearDateBtn}
                title="ล้างฟิลเตอร์วันที่"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filteredTxs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            ไม่มีประวัติการทำรายการตรงกับเงื่อนไขที่ระบุ
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.desktopTable}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>สินค้า (Product)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>ประเภท (Type)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>จำนวน (Qty)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>ราคาขาย/ชิ้น</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>มูลค่ารวม</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>หมายเหตุ (Notes)</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap' }}>วัน-เวลา (Date-Time)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTxs.map((tx) => {
                  const product = products.find(p => p.id === tx.product_id);
                  const sellingPrice = product?.selling_price || 0;
                  const totalValue = sellingPrice * tx.quantity;
                  const formatCurrency = (val) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);

                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                      <td style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatCurrency(sellingPrice)}
                      </td>
                      <td style={{
                        padding: '16px 20px',
                        fontWeight: '700',
                        textAlign: 'right',
                        fontSize: '15px',
                        color: tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST' ? 'var(--color-success)' : 'var(--color-success)'
                      }}>
                        {formatCurrency(totalValue)}
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
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          {new Date(tx.created_at).toLocaleString('th-TH')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            {/* Mobile Card View */}
            <div className={styles.mobileCards}>
              {paginatedTxs.map((tx) => {
                const product = products.find(p => p.id === tx.product_id);
                const sellingPrice = product?.selling_price || 0;
                const totalValue = sellingPrice * tx.quantity;
                const formatCurrency = (val) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
                const isIn = tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST';

                return (
                  <div key={tx.id} className={styles.txCard}>
                    {/* Card Header - Product & Type */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardProduct}>
                        <div className={styles.cardProductName}>{getProductName(tx.product_id)}</div>
                        <div className={styles.cardSku}>SKU: {getProductSKU(tx.product_id)}</div>
                      </div>
                      <span className={`${styles.txType} ${
                        tx.transaction_type === 'IN' ? styles.txTypeIn : ''
                      } ${
                        tx.transaction_type === 'OUT' ? styles.txTypeOut : ''
                      } ${
                        tx.transaction_type === 'ADJUST' ? styles.txTypeAdjust : ''
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </div>

                    {/* Card Body - Details */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardRow}>
                        <span className={styles.cardLabel}>วันที่</span>
                        <span className={styles.cardValue}>
                          <Calendar size={12} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
                          {new Date(tx.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </div>

                      <div className={styles.cardRow}>
                        <span className={styles.cardLabel}>จำนวน</span>
                        <span className={`${styles.cardValue} ${styles.cardValueQty} ${isIn ? styles.qtyIn : styles.qtyOut}`}>
                          {isIn ? '+' : '-'}{tx.quantity}
                        </span>
                      </div>

                      <div className={styles.cardRow}>
                        <span className={styles.cardLabel}>ราคา/ชิ้น</span>
                        <span className={styles.cardValue}>{formatCurrency(sellingPrice)}</span>
                      </div>

                      <div className={`${styles.cardRow} ${styles.cardRowTotal}`}>
                        <span className={styles.cardLabel}>มูลค่ารวม</span>
                        <span className={`${styles.cardValue} ${styles.cardValueTotal}`}>
                          {formatCurrency(totalValue)}
                        </span>
                      </div>

                      {tx.notes && (
                        <div className={`${styles.cardRow} ${styles.cardRowNotes}`}>
                          <span className={styles.cardLabel}>หมายเหตุ</span>
                          <span className={styles.cardValue}>
                            <FileText size={12} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
                            {tx.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          {/* Pagination */}
          {filteredTxs.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                แสดง <strong>{startIndex + 1}</strong> - <strong>{Math.min(endIndex, filteredTxs.length)}</strong>
                จาก <strong>{filteredTxs.length}</strong> รายการ
              </div>

              <div className={styles.paginationControls}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnDisabled : ''}`}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

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
