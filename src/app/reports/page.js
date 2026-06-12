'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/supabase';
import {
  TrendingUp,
  Package,
  BarChart3,
  DollarSign,
  Calendar,
  X,
  AlertTriangle,
  Search
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { ReportsSkeleton } from '@/components/Skeleton';
import styles from './page.module.css';

function useContainerWidth(defaultWidth = 500) {
  const [width, setWidth] = useState(defaultWidth);
  const [element, setElement] = useState(null);

  const ref = useCallback((node) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [element]);

  return [width, ref];
}

export default function ReportsPage() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'products', 'category', 'stock'

  // Date filters
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year', 'all'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Stock valuation pagination
  const [stockCurrentPage, setStockCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Products report pagination
  const [productsCurrentPage, setProductsCurrentPage] = useState(1);

  // Modal state for mobile detail view
  const [modalProduct, setModalProduct] = useState(null);
  const [modalType, setModalType] = useState(''); // 'stock' or 'performance'

  // Search states
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [productsSearchQuery, setProductsSearchQuery] = useState('');

  const [salesChartWidth, salesChartRef] = useContainerWidth(500);
  const [categoryChartWidth, categoryChartRef] = useContainerWidth(400);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate items per page based on screen size
  const stockItemsPerPage = isMobile ? 10 : 20;
  const productsItemsPerPage = isMobile ? 10 : 20;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, txRes] = await Promise.all([
          db.getProducts(),
          db.getTransactions()
        ]);
        setProducts(prodRes.data || []);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start, end = new Date(now);

    switch (period) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        break;
      case 'year':
        start = new Date(now);
        start.setMonth(now.getMonth() - 12);
        break;
      case 'all':
        if (transactions.length > 0) {
          const dates = transactions.map(t => new Date(t.created_at).getTime());
          start = new Date(Math.min(...dates));
        } else {
          start = new Date(now);
          start.setDate(now.getDate() - 30);
        }
        break;
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 30);
    }

    if (startDate) {
      const [y, m, d] = startDate.split('-').map(Number);
      start = new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    if (endDate) {
      const [y, m, d] = endDate.split('-').map(Number);
      end = new Date(y, m - 1, d, 23, 59, 59, 999);
    } else {
      end.setHours(23, 59, 59, 999);
    }

    return transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate >= start && txDate <= end;
    });
  }, [transactions, period, startDate, endDate]);

  // Report: Sales Data
  const salesData = useMemo(() => {
    const data = {};
    const now = new Date();
    let start, end = new Date(now);

    switch (period) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        break;
      case 'year':
        start = new Date(now);
        start.setMonth(now.getMonth() - 12);
        break;
      case 'all':
        if (transactions.length > 0) {
          const dates = transactions.map(t => new Date(t.created_at).getTime());
          start = new Date(Math.min(...dates));
        } else {
          start = new Date(now);
          start.setDate(now.getDate() - 30);
        }
        break;
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 30);
    }

    if (startDate) {
      const [y, m, d] = startDate.split('-').map(Number);
      start = new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    if (endDate) {
      const [y, m, d] = endDate.split('-').map(Number);
      end = new Date(y, m - 1, d, 23, 59, 59, 999);
    } else {
      end.setHours(23, 59, 59, 999);
    }

    // Determine grouping type: 'month' or 'day'
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const groupType = (period === 'year' || diffDays > 60) ? 'month' : 'day';

    // Initialize keys in sorted order
    if (groupType === 'month') {
      let current = new Date(start);
      while (current <= end || (current.getMonth() === end.getMonth() && current.getFullYear() === end.getFullYear())) {
        const key = current.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
        data[key] = { date: key, revenue: 0, cost: 0, profit: 0, count: 0 };
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      let current = new Date(start);
      while (current <= end) {
        const key = current.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        data[key] = { date: key, revenue: 0, cost: 0, profit: 0, count: 0 };
        current.setDate(current.getDate() + 1);
      }
    }

    filteredTransactions.forEach(tx => {
      if (tx.transaction_type === 'OUT') {
        const product = products.find(p => p.id === tx.product_id);
        if (product) {
          const revenue = product.selling_price * tx.quantity;
          const cost = product.cost_price * tx.quantity;
          const profit = revenue - cost;
          
          const txDate = new Date(tx.created_at);
          const dateKey = groupType === 'month'
            ? txDate.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
            : txDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });

          if (data[dateKey]) {
            data[dateKey].revenue += revenue;
            data[dateKey].cost += cost;
            data[dateKey].profit += profit;
            data[dateKey].count += tx.quantity;
          }
        }
      }
    });

    return Object.values(data);
  }, [filteredTransactions, products, period, startDate, endDate, transactions]);

  // Report: Product Performance
  const productPerformance = useMemo(() => {
    return products.map(p => {
      const sales = filteredTransactions
        .filter(tx => tx.product_id === p.id && tx.transaction_type === 'OUT')
        .reduce((sum, tx) => sum + tx.quantity, 0);

      const revenue = sales * p.selling_price;
      const profit = sales * (p.selling_price - p.cost_price);

      return {
        ...p,
        sales,
        revenue,
        profit,
        turnover: sales > 0 ? (sales / p.quantity) : 0
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [products, filteredTransactions]);

  // Report: Category Analysis
  const categoryData = useMemo(() => {
    const categories = {};

    filteredTransactions.forEach(tx => {
      if (tx.transaction_type === 'OUT') {
        const product = products.find(p => p.id === tx.product_id);
        if (product && product.category) {
          if (!categories[product.category]) {
            categories[product.category] = {
              name: product.category,
              revenue: 0,
              cost: 0,
              profit: 0,
              count: 0
            };
          }
          categories[product.category].revenue += product.selling_price * tx.quantity;
          categories[product.category].cost += product.cost_price * tx.quantity;
          categories[product.category].profit += (product.selling_price - product.cost_price) * tx.quantity;
          categories[product.category].count += tx.quantity;
        }
      }
    });

    return Object.values(categories).sort((a, b) => b.profit - a.profit);
  }, [filteredTransactions, products]);

  // Report: Stock Valuation
  const stockValuation = useMemo(() => {
    return {
      totalItems: products.length,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      totalCostValue: products.reduce((sum, p) => sum + (p.cost_price * p.quantity), 0),
      totalSellValue: products.reduce((sum, p) => sum + (p.selling_price * p.quantity), 0),
      totalProfit: products.reduce((sum, p) => sum + ((p.selling_price - p.cost_price) * p.quantity), 0),
      lowStockCount: products.filter(p => p.quantity <= p.safety_stock).length
    };
  }, [products]);

  // Filtered products for stock search
  const filteredStockProducts = useMemo(() => {
    if (!stockSearchQuery) return products;
    const query = stockSearchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  }, [products, stockSearchQuery]);

  // Filtered product performance for search
  const filteredProductPerformance = useMemo(() => {
    if (!productsSearchQuery) return productPerformance;
    const query = productsSearchQuery.toLowerCase();
    return productPerformance.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  }, [productPerformance, productsSearchQuery]);

  // Reset pagination when search changes
  useEffect(() => {
    setStockCurrentPage(1);
  }, [stockSearchQuery]);

  useEffect(() => {
    setProductsCurrentPage(1);
  }, [productsSearchQuery]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>รายงานวิเคราะห์</h1>
          <p>สรุปข้อมูลการขาย สต๊อก และกำไร</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'sales' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={18} />
          ยอดขาย
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} />
          สินค้า
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'category' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('category')}
        >
          <BarChart3 size={18} />
          หมวดหมู่
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stock' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <DollarSign size={18} />
          มูลค่าสต๊อก
        </button>
      </div>

      {/* Period Filter - show for all tabs */}
      <div className={styles.filters}>
        {activeTab !== 'stock' && (
          <>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className={styles.select}>
              <option value="week">7 วันล่าสุด</option>
              <option value="month">30 วันล่าสุด</option>
              <option value="year">12 เดือนล่าสุด</option>
              <option value="all">ทั้งหมด</option>
            </select>

            <div className={styles.dateRange}>
              <Calendar size={16} />
              <span>ตั้งแต่</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
              <span>ถึง</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </>
        )}

        {/* Search for stock and products tabs */}
        {(activeTab === 'stock' || activeTab === 'products') && (
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.filterSearchIcon} />
            <input
              type="text"
              placeholder={activeTab === 'stock' ? "ค้นหาสินค้า..." : "ค้นหาสินค้า..."}
              value={activeTab === 'stock' ? stockSearchQuery : productsSearchQuery}
              onChange={(e) => activeTab === 'stock' ? setStockSearchQuery(e.target.value) : setProductsSearchQuery(e.target.value)}
              className={styles.filterSearchInput}
            />
            {(activeTab === 'stock' ? stockSearchQuery : productsSearchQuery) && (
              <button
                type="button"
                onClick={() => activeTab === 'stock' ? setStockSearchQuery('') : setProductsSearchQuery('')}
                className={styles.clearFilterSearchBtn}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sales Report Tab */}
      {activeTab === 'sales' && (
        <div className={styles.tabContent}>
          {/* Summary Cards */}
          <div className={styles.summaryGrid} style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>ยอดขายรวม</span>
              <span className={styles.summaryValue}>
                {formatCurrency(salesData.reduce((sum, d) => sum + d.revenue, 0))}
              </span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>ต้นทุนรวม</span>
              <span className={styles.summaryValue} style={{ color: '#F59E0B' }}>
                {formatCurrency(salesData.reduce((sum, d) => sum + d.cost, 0))}
              </span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>กำไรรวม</span>
              <span className={styles.summaryValue} style={{ color: 'var(--color-success)' }}>
                {formatCurrency(salesData.reduce((sum, d) => sum + d.profit, 0))}
              </span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>จำนวนขายรวม</span>
              <span className={styles.summaryValue}>
                {salesData.reduce((sum, d) => sum + d.count, 0)} ชิ้น
              </span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>อัตรากำไร</span>
              <span className={styles.summaryValue}>
                {salesData.reduce((sum, d) => sum + d.revenue, 0) > 0
                  ? Math.round((salesData.reduce((sum, d) => sum + d.profit, 0) / salesData.reduce((sum, d) => sum + d.revenue, 0)) * 100)
                  : 0}%
              </span>
            </div>
          </div>

          {/* Sales Chart */}
          <div className={`${styles.chartCard} glass-card`} ref={salesChartRef}>
            <h3 className={styles.chartTitle}>แนวโน้มยอดขาย ต้นทุน และกำไร</h3>
            <div style={{ width: '100%', height: '260px', overflowX: 'auto' }}>
              <LineChart width={Math.max(salesChartWidth, 500)} height={260} data={salesData} margin={{ top: 10, right: 15, left: 10, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tick={{ fill: '#888', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff', fontSize: '12px' }}
                  formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'ยอดขาย' : name === 'cost' ? 'ต้นทุน' : 'กำไร']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="ยอดขาย" />
                <Line type="monotone" dataKey="cost" stroke="#F59E0B" strokeWidth={2} name="ต้นทุน" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="กำไร" />
              </LineChart>
            </div>
          </div>
        </div>
      )}

      {/* Products Report Tab */}
      {activeTab === 'products' && (
        <div className={styles.tabContent}>
          <div className={`${styles.tableCard} glass-card`}>
            <h3 className={styles.tableTitle}>อันดับสินค้า (เรียงตามกำไร) {filteredProductPerformance.length !== productPerformance.length && `(พบ ${filteredProductPerformance.length} รายการ)`}</h3>
            {filteredProductPerformance.length === 0 ? (
              <div className={styles.emptyState}>
                {productsSearchQuery ? 'ไม่พบสินค้าที่ค้นหา' : 'ไม่มีข้อมูลสินค้า'}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className={styles.desktopTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>อันดับ</th>
                        <th>สินค้า</th>
                        <th>ขายแล้ว</th>
                        <th>ยอดขาย</th>
                        <th>กำไร</th>
                        <th>อัตราหมุนเวียน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProductPerformance
                        .slice((productsCurrentPage - 1) * productsItemsPerPage, productsCurrentPage * productsItemsPerPage)
                        .map((p, idx) => (
                          <tr key={p.id}>
                            <td>#{(productsCurrentPage - 1) * productsItemsPerPage + idx + 1}</td>
                            <td>
                              <div className={styles.productCell}>
                                <span className={styles.productName}>{p.name}</span>
                                <span className={styles.productSku}>SKU: {p.sku}</span>
                              </div>
                            </td>
                            <td>{p.sales} ชิ้น</td>
                            <td>{formatCurrency(p.revenue)}</td>
                            <td className={styles.profitCell}>
                              {formatCurrency(p.profit)}
                            </td>
                            <td>{p.turnover.toFixed(2)}x</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {filteredProductPerformance
                    .slice((productsCurrentPage - 1) * productsItemsPerPage, productsCurrentPage * productsItemsPerPage)
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        className={styles.performanceCard}
                        onClick={() => {
                          setModalProduct(p);
                          setModalType('performance');
                        }}
                      >
                        <div className={styles.performanceCardHeader}>
                          <div className={styles.performanceRank}>#{(productsCurrentPage - 1) * productsItemsPerPage + idx + 1}</div>
                          <div className={styles.performanceProduct}>
                            <div className={styles.performanceName}>{p.name}</div>
                            <div className={styles.performanceSku}>SKU: {p.sku}</div>
                          </div>
                        </div>
                        <div className={styles.performanceCardBody}>
                          <div className={styles.stockCardRow}>
                            <span className={styles.stockCardLabel}>ขายแล้ว</span>
                            <span className={styles.stockCardValue}>{p.sales} ชิ้น</span>
                          </div>
                          <div className={styles.stockCardRow}>
                            <span className={styles.stockCardLabel}>กำไร</span>
                            <span className={`${styles.stockCardValue} ${p.profit >= 0 ? styles.stockCardValuePositive : styles.stockCardValueNegative}`}>
                              {formatCurrency(p.profit)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.performanceCardFooter}>
                          <span className={styles.performanceCardHint}>แตะเพื่อดูรายละเอียด</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination */}
                {filteredProductPerformance.length > productsItemsPerPage && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      แสดง <strong>{(productsCurrentPage - 1) * productsItemsPerPage + 1}</strong> - <strong>{Math.min(productsCurrentPage * productsItemsPerPage, filteredProductPerformance.length)}</strong>
                      จาก <strong>{filteredProductPerformance.length}</strong> รายการ
                    </div>

                    <div className={styles.paginationControls}>
                      <button
                        onClick={() => setProductsCurrentPage(p => Math.max(1, p - 1))}
                        disabled={productsCurrentPage === 1}
                        className={`${styles.pageBtn} ${productsCurrentPage === 1 ? styles.pageBtnDisabled : ''}`}
                      >
                        ก่อนหน้า
                      </button>

                      <div className={styles.pageNumbers}>
                        {(() => {
                          const totalPages = Math.ceil(filteredProductPerformance.length / productsItemsPerPage);
                          const pages = [];

                          pages.push(1);

                          if (productsCurrentPage > 3) {
                            pages.push('...');
                          }

                          for (let i = Math.max(2, productsCurrentPage - 1); i <= Math.min(totalPages - 1, productsCurrentPage + 1); i++) {
                            pages.push(i);
                          }

                          if (productsCurrentPage < totalPages - 2) {
                            pages.push('...');
                          }

                          if (totalPages > 1) {
                            pages.push(totalPages);
                          }

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
                                onClick={() => setProductsCurrentPage(page)}
                                className={`${styles.pageBtn} ${styles.pageNum} ${productsCurrentPage === page ? styles.pageBtnActive : ''}`}
                              >
                                {page}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      <button
                        onClick={() => setProductsCurrentPage(p => Math.min(Math.ceil(filteredProductPerformance.length / productsItemsPerPage), p + 1))}
                        disabled={productsCurrentPage === Math.ceil(filteredProductPerformance.length / productsItemsPerPage)}
                        className={`${styles.pageBtn} ${productsCurrentPage === Math.ceil(filteredProductPerformance.length / productsItemsPerPage) ? styles.pageBtnDisabled : ''}`}
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
      )}

      {/* Category Report Tab */}
      {activeTab === 'category' && (
        <div className={styles.tabContent}>
          {/* Summary Cards */}
          <div className={styles.summaryGrid}>
            {categoryData.length === 0 ? (
              <div className={styles.emptyState}>ไม่มีข้อมูลหมวดหมู่</div>
            ) : (
              categoryData.map(cat => (
                <div key={cat.name} className={`${styles.summaryCard} glass-card`}>
                  <span className={styles.summaryLabel}>{cat.name}</span>
                  <span className={styles.summaryValue}>{formatCurrency(cat.profit)}</span>
                  <span className={styles.summarySub}>กำไรจาก {cat.count} ชิ้น</span>
                </div>
              ))
            )}
          </div>

          {/* Category Chart */}
          {categoryData.length > 0 && (
            <div className={`${styles.chartCard} glass-card`} ref={categoryChartRef}>
              <h3 className={styles.chartTitle}>สัดส่วนกำไรตามหมวดหมู่</h3>
              <div style={{ width: '100%', height: '220px' }}>
                <PieChart width={categoryChartWidth} height={220}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={0}
                    dataKey="profit"
                    nameKey="name"
                    labelLine={true}
                    label={(entry) => {
                      // Get the total to calculate percentage
                      const total = categoryData.reduce((sum, cat) => sum + cat.profit, 0);
                      const percent = total > 0 ? ((entry.profit / total) * 100).toFixed(0) : 0;
                      return `${entry.name} ${percent}%`;
                    }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Stock Valuation Tab */}
      {activeTab === 'stock' && (
        <div className={styles.tabContent}>
          <div className={styles.summaryGrid} style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>รายการสินค้าทั้งหมด</span>
              <span className={styles.summaryValue}>{stockValuation.totalItems}</span>
              <span className={styles.summarySub}>รายการ</span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>จำนวนสินค้าทั้งหมด</span>
              <span className={styles.summaryValue}>{stockValuation.totalQuantity.toLocaleString()}</span>
              <span className={styles.summarySub}>ชิ้น</span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>มูลค่าต้นทุนสต๊อก</span>
              <span className={styles.summaryValue}>{formatCurrency(stockValuation.totalCostValue)}</span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>มูลค่าขายสต๊อก</span>
              <span className={styles.summaryValue}>{formatCurrency(stockValuation.totalSellValue)}</span>
            </div>
            <div className={`${styles.summaryCard} glass-card`}>
              <span className={styles.summaryLabel}>กำไรที่จะได้</span>
              <span className={styles.summaryValue} style={{ color: 'var(--color-success)' }}>
                {formatCurrency(stockValuation.totalProfit)}
              </span>
              <span className={styles.summarySub}>ถ้าขายหมด</span>
            </div>
            <div className={`${styles.summaryCard} glass-card ${stockValuation.lowStockCount > 0 ? styles.valuationAlert : ''}`}>
              <span className={styles.summaryLabel}>สินค้าใกล้หมด</span>
              <span className={styles.summaryValue} style={{ color: stockValuation.lowStockCount > 0 ? 'var(--color-error)' : 'var(--text-primary)' }}>
                {stockValuation.lowStockCount}
              </span>
              <span className={styles.summarySub}>รายการ</span>
            </div>
          </div>

          {/* Stock Valuation Table */}
          <div className={`${styles.tableCard} glass-card`} style={{ marginTop: '24px' }}>
            <h3 className={styles.tableTitle}>รายการมูลค่าสต๊อกแต่ละสินค้า {filteredStockProducts.length !== products.length && `(พบ ${filteredStockProducts.length} รายการ)`}</h3>
            {filteredStockProducts.length === 0 ? (
              <div className={styles.emptyState}>
                {stockSearchQuery ? 'ไม่พบสินค้าที่ค้นหา' : 'ไม่มีข้อมูลสินค้า'}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className={styles.desktopTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th style={{ textAlign: 'right' }}>จำนวน</th>
                        <th style={{ textAlign: 'right' }}>ต้นทุน/ชิ้น</th>
                        <th style={{ textAlign: 'right' }}>ราคาขาย/ชิ้น</th>
                        <th style={{ textAlign: 'right' }}>มูลค่าต้นทุน</th>
                        <th style={{ textAlign: 'right' }}>มูลค่าขาย</th>
                        <th style={{ textAlign: 'right' }}>กำไรที่จะได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStockProducts
                        .map(p => ({
                          ...p,
                          costValue: p.cost_price * p.quantity,
                          sellValue: p.selling_price * p.quantity,
                          potentialProfit: (p.selling_price - p.cost_price) * p.quantity
                        }))
                        .sort((a, b) => b.potentialProfit - a.potentialProfit)
                        .slice((stockCurrentPage - 1) * stockItemsPerPage, stockCurrentPage * stockItemsPerPage)
                        .map((product) => (
                          <tr key={product.id}>
                            <td>
                              <div className={styles.productCell}>
                                <span className={styles.productName}>{product.name}</span>
                                <span className={styles.productSku}>SKU: {product.sku}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                              {product.quantity.toLocaleString()} ชิ้น
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {formatCurrency(product.cost_price)}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {formatCurrency(product.selling_price)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                              {formatCurrency(product.costValue)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                              {formatCurrency(product.sellValue)}
                            </td>
                            <td style={{
                              textAlign: 'right',
                              fontWeight: '700',
                              color: product.potentialProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)'
                            }}>
                              {formatCurrency(product.potentialProfit)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {filteredStockProducts
                    .map(p => ({
                      ...p,
                      costValue: p.cost_price * p.quantity,
                      sellValue: p.selling_price * p.quantity,
                      potentialProfit: (p.selling_price - p.cost_price) * p.quantity
                    }))
                    .sort((a, b) => b.potentialProfit - a.potentialProfit)
                    .slice((stockCurrentPage - 1) * stockItemsPerPage, stockCurrentPage * stockItemsPerPage)
                    .map((product) => (
                      <div
                        key={product.id}
                        className={styles.stockCard}
                        onClick={() => {
                          setModalProduct(product);
                          setModalType('stock');
                        }}
                      >
                        <div className={styles.stockCardHeader}>
                          <div className={styles.stockCardProduct}>
                            <div className={styles.stockCardName}>{product.name}</div>
                            <div className={styles.stockCardSku}>SKU: {product.sku}</div>
                          </div>
                          <div className={styles.stockCardBadge}>
                            {product.quantity.toLocaleString()} ชิ้น
                          </div>
                        </div>
                        <div className={styles.stockCardBody}>
                          <div className={styles.stockCardRow}>
                            <span className={styles.stockCardLabel}>มูลค่าต้นทุน</span>
                            <span className={styles.stockCardValue}>{formatCurrency(product.cost_price * product.quantity)}</span>
                          </div>
                        </div>
                        <div className={styles.stockCardFooter}>
                          <span className={styles.stockCardHint}>แตะเพื่อดูรายละเอียด</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination */}
                {filteredStockProducts.length > stockItemsPerPage && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      แสดง <strong>{(stockCurrentPage - 1) * stockItemsPerPage + 1}</strong> - <strong>{Math.min(stockCurrentPage * stockItemsPerPage, filteredStockProducts.length)}</strong>
                      จาก <strong>{filteredStockProducts.length}</strong> รายการ
                    </div>

                    <div className={styles.paginationControls}>
                      <button
                        onClick={() => setStockCurrentPage(p => Math.max(1, p - 1))}
                        disabled={stockCurrentPage === 1}
                        className={`${styles.pageBtn} ${stockCurrentPage === 1 ? styles.pageBtnDisabled : ''}`}
                      >
                        ก่อนหน้า
                      </button>

                      <div className={styles.pageNumbers}>
                        {(() => {
                          const totalPages = Math.ceil(filteredStockProducts.length / stockItemsPerPage);
                          const pages = [];

                          pages.push(1);

                          if (stockCurrentPage > 3) {
                            pages.push('...');
                          }

                          for (let i = Math.max(2, stockCurrentPage - 1); i <= Math.min(totalPages - 1, stockCurrentPage + 1); i++) {
                            pages.push(i);
                          }

                          if (stockCurrentPage < totalPages - 2) {
                            pages.push('...');
                          }

                          if (totalPages > 1) {
                            pages.push(totalPages);
                          }

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
                                onClick={() => setStockCurrentPage(page)}
                                className={`${styles.pageBtn} ${styles.pageNum} ${stockCurrentPage === page ? styles.pageBtnActive : ''}`}
                              >
                                {page}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      <button
                        onClick={() => setStockCurrentPage(p => Math.min(Math.ceil(filteredStockProducts.length / stockItemsPerPage), p + 1))}
                        disabled={stockCurrentPage === Math.ceil(filteredStockProducts.length / stockItemsPerPage)}
                        className={`${styles.pageBtn} ${stockCurrentPage === Math.ceil(filteredStockProducts.length / stockItemsPerPage) ? styles.pageBtnDisabled : ''}`}
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
      )}

      {/* Mobile Detail Modal */}
      {modalProduct && (
        <div className={styles.modalOverlay} onClick={() => setModalProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>รายละเอียดสินค้า</h3>
              <button
                className={styles.modalClose}
                onClick={() => setModalProduct(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Product Info */}
              <div className={styles.modalSection}>
                <div className={styles.modalProductName}>{modalProduct.name}</div>
                <div className={styles.modalSku}>SKU: {modalProduct.sku}</div>
                {modalProduct.category && (
                  <div className={styles.modalCategory}>
                    <Package size={14} />
                    {modalProduct.category}
                  </div>
                )}
              </div>

              {/* Details based on modal type */}
              {modalType === 'stock' && (
                <>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalGridItem}>
                      <span className={styles.modalGridLabel}>จำนวนคงเหลือ</span>
                      <span className={styles.modalGridValue}>{modalProduct.quantity.toLocaleString()} ชิ้น</span>
                    </div>
                    <div className={styles.modalGridItem}>
                      <span className={styles.modalGridLabel}>ต้นทุน/ชิ้น</span>
                      <span className={styles.modalGridValue}>{formatCurrency(modalProduct.cost_price)}</span>
                    </div>
                    <div className={styles.modalGridItem}>
                      <span className={styles.modalGridLabel}>ราคาขาย/ชิ้น</span>
                      <span className={styles.modalGridValue}>{formatCurrency(modalProduct.selling_price)}</span>
                    </div>
                  </div>

                  <div className={styles.modalTotals}>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>มูลค่าต้นทุนรวม</span>
                      <span className={styles.modalTotalValue}>{formatCurrency(modalProduct.cost_price * modalProduct.quantity)}</span>
                    </div>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>มูลค่าขายรวม</span>
                      <span className={styles.modalTotalValue}>{formatCurrency(modalProduct.selling_price * modalProduct.quantity)}</span>
                    </div>
                    <div className={`${styles.modalTotalRow} ${styles.modalTotalRowHighlight}`}>
                      <span className={styles.modalTotalLabel}>กำไรที่จะได้</span>
                      <span
                        className={`${styles.modalTotalValue} ${(modalProduct.selling_price - modalProduct.cost_price) * modalProduct.quantity >= 0 ? styles.modalTotalValuePositive : styles.modalTotalValueNegative}`}
                      >
                        {formatCurrency((modalProduct.selling_price - modalProduct.cost_price) * modalProduct.quantity)}
                      </span>
                    </div>
                  </div>

                  {modalProduct.safety_stock && modalProduct.quantity <= modalProduct.safety_stock && (
                    <div className={styles.modalAlert}>
                      <AlertTriangle size={16} />
                      สินค้าใกล้หมด! (จุดสั่งซื้อ: {modalProduct.safety_stock} ชิ้น)
                    </div>
                  )}
                </>
              )}

              {modalType === 'performance' && (
                <>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalGridItem}>
                      <span className={styles.modalGridLabel}>ขายแล้ว</span>
                      <span className={styles.modalGridValue}>{modalProduct.sales} ชิ้น</span>
                    </div>
                    <div className={styles.modalGridItem}>
                      <span className={styles.modalGridLabel}>ยอดขายรวม</span>
                      <span className={styles.modalGridValue}>{formatCurrency(modalProduct.revenue)}</span>
                    </div>
                    <div className={styles.modalGridItem}>
                      <span className={styles.modalGridLabel}>กำไรรวม</span>
                      <span className={`${styles.modalGridValue} ${modalProduct.profit >= 0 ? styles.modalGridValuePositive : styles.modalGridValueNegative}`}>
                        {formatCurrency(modalProduct.profit)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.modalTotals}>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>ต้นทุน/ชิ้น</span>
                      <span className={styles.modalTotalValue}>{formatCurrency(modalProduct.cost_price)}</span>
                    </div>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>ราคาขาย/ชิ้น</span>
                      <span className={styles.modalTotalValue}>{formatCurrency(modalProduct.selling_price)}</span>
                    </div>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>กำไรต่อชิ้น</span>
                      <span className={`${styles.modalTotalValue} ${modalProduct.selling_price - modalProduct.cost_price >= 0 ? styles.modalTotalValuePositive : styles.modalTotalValueNegative}`}>
                        {formatCurrency(modalProduct.selling_price - modalProduct.cost_price)}
                      </span>
                    </div>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>อัตราหมุนเวียน</span>
                      <span className={styles.modalTotalValue}>{modalProduct.turnover.toFixed(2)}x</span>
                    </div>
                    <div className={styles.modalTotalRow}>
                      <span className={styles.modalTotalLabel}>สต๊อกคงเหลือ</span>
                      <span className={styles.modalTotalValue}>{modalProduct.quantity.toLocaleString()} ชิ้น</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
