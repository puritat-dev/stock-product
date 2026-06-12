'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/supabase';
import {
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Target,
  Settings,
  X
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DashboardSkeleton } from '@/components/Skeleton';
import styles from './page.module.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function useContainerWidth(ref, defaultWidth = 350) {
  const [width, setWidth] = useState(defaultWidth);
  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, [ref]);
  return width;
}

export default function Dashboard() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState('');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const chartRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);

  const chartWidth = useContainerWidth(chartRef, 350);
  const pieWidth = useContainerWidth(pieRef, 300);
  const barWidth = useContainerWidth(barRef, 350);

  // Chart filters
  const [chartPeriod, setChartPeriod] = useState('7days'); // 7days, 30days, month, year
  const [chartMonth, setChartMonth] = useState(new Date().getMonth() + 1); // 1-12

  // KPI and new charts state
  const [salesTarget, setSalesTarget] = useState(50000);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState('50000');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Formatting date nicely
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timer = setTimeout(() => {
      setCurrentDate(new Date().toLocaleDateString('th-TH', options));
    }, 0);

    const loadData = async () => {
      try {
        const [prodRes, txRes] = await Promise.all([
          db.getProducts(),
          db.getTransactions()
        ]);

        if (prodRes.data) setProducts(prodRes.data);
        if (txRes.data) setTransactions(txRes.data); // Load all for profit calculation
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => clearTimeout(timer);
  }, [pathname]); // Reload data when navigating to dashboard

  // Load KPI target
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await db.getSetting('kpi_monthly_sales_target');
        if (data) {
          const target = parseFloat(data.value) || 50000;
          setSalesTarget(target);
          setTargetInput(target.toString());
        }
      } catch (err) {
        // Silently fail - use default value
        console.log('Using default KPI target');
      }
    };
    loadSettings();
  }, [pathname]); // Reload when navigating to dashboard

  // 1. Calculate stats
  const totalSKUs = products.length;
  const totalStockQty = products.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  // Inventory valuation (Cost)
  const totalValuation = products.reduce((acc, curr) => {
    const cost = parseFloat(curr.cost_price || 0);
    return acc + (cost * (curr.quantity || 0));
  }, 0);

  // Low stock alerts
  const lowStockAlerts = products.filter(p => p.quantity <= p.safety_stock);
  const lowStockCount = lowStockAlerts.length;

  // Total profit from OUT transactions (Sales)
  const totalProfit = transactions.reduce((acc, tx) => {
    if (tx.transaction_type === 'OUT') {
      const product = products.find(p => p.id === tx.product_id);
      if (product) {
        const costPrice = parseFloat(product.cost_price || 0);
        const sellingPrice = parseFloat(product.selling_price || 0);
        const profitPerUnit = sellingPrice - costPrice;
        return acc + (profitPerUnit * tx.quantity);
      }
    }
    return acc;
  }, 0);

  // Calculate daily profit for chart based on selected period/month
  const chartData = useMemo(() => {
    const dailyProfit = {};
    const now = new Date();

    if (chartPeriod === 'month') {
      // Show all days of selected month
      const year = now.getFullYear();
      const month = chartMonth - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        dailyProfit[dateStr] = 0;
      }

      transactions.forEach(tx => {
        if (tx.transaction_type === 'OUT') {
          const product = products.find(p => p.id === tx.product_id);
          if (product) {
            const costPrice = parseFloat(product.cost_price || 0);
            const sellingPrice = parseFloat(product.selling_price || 0);
            const profitPerUnit = sellingPrice - costPrice;
            const profit = profitPerUnit * tx.quantity;

            const txDate = new Date(tx.created_at);
            if (txDate.getMonth() === month && txDate.getFullYear() === year) {
              const dateStr = txDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
              if (dailyProfit.hasOwnProperty(dateStr)) {
                dailyProfit[dateStr] += profit;
              }
            }
          }
        }
      });
    } else if (chartPeriod === '30days') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        dailyProfit[dateStr] = 0;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      transactions.forEach(tx => {
        if (tx.transaction_type === 'OUT') {
          const product = products.find(p => p.id === tx.product_id);
          if (product) {
            const costPrice = parseFloat(product.cost_price || 0);
            const sellingPrice = parseFloat(product.selling_price || 0);
            const profitPerUnit = sellingPrice - costPrice;
            const profit = profitPerUnit * tx.quantity;

            const txDate = new Date(tx.created_at);
            if (txDate >= thirtyDaysAgo) {
              const dateStr = txDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
              if (dailyProfit.hasOwnProperty(dateStr)) {
                dailyProfit[dateStr] += profit;
              }
            }
          }
        }
      });
    } else {
      // Default: 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        dailyProfit[dateStr] = 0;
      }

      transactions.forEach(tx => {
        if (tx.transaction_type === 'OUT') {
          const product = products.find(p => p.id === tx.product_id);
          if (product) {
            const costPrice = parseFloat(product.cost_price || 0);
            const sellingPrice = parseFloat(product.selling_price || 0);
            const profitPerUnit = sellingPrice - costPrice;
            const profit = profitPerUnit * tx.quantity;

            const txDate = new Date(tx.created_at);
            const dateStr = txDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });

            if (dailyProfit.hasOwnProperty(dateStr)) {
              dailyProfit[dateStr] += profit;
            }
          }
        }
      });
    }

    // Convert to array format for Recharts
    return Object.entries(dailyProfit).map(([date, profit]) => ({
      date,
      profit: Math.round(profit)
    }));
  }, [transactions, products, chartPeriod, chartMonth]);

  // Calculate category distribution for pie chart
  const categoryData = useMemo(() => {
    const categoryMap = {};
    products.forEach(p => {
      if (p.category) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      }
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Calculate monthly comparison (current vs last month)
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthSales = transactions
      .filter(tx => {
        const d = new Date(tx.created_at);
        return d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear &&
               tx.transaction_type === 'OUT';
      })
      .reduce((sum, tx) => {
        const p = products.find(prod => prod.id === tx.product_id);
        return sum + (p?.selling_price || 0) * tx.quantity;
      }, 0);

    const lastMonthSales = transactions
      .filter(tx => {
        const d = new Date(tx.created_at);
        return d.getMonth() === lastMonth &&
               d.getFullYear() === lastMonthYear &&
               tx.transaction_type === 'OUT';
      })
      .reduce((sum, tx) => {
        const p = products.find(prod => prod.id === tx.product_id);
        return sum + (p?.selling_price || 0) * tx.quantity;
      }, 0);

    return [
      { name: 'เดือนที่แล้ว', value: lastMonthSales },
      { name: 'เดือนนี้', value: currentMonthSales }
    ];
  }, [transactions, products]);

  // Calculate current month sales for KPI
  const currentMonthSales = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(tx => {
        const d = new Date(tx.created_at);
        return d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear() &&
               tx.transaction_type === 'OUT';
      })
      .reduce((sum, tx) => {
        const p = products.find(prod => prod.id === tx.product_id);
        return sum + (p?.selling_price || 0) * tx.quantity;
      }, 0);
  }, [transactions, products]);

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>ภาพรวมระบบสต๊อกสินค้า</h1>
          <p>Dashboard บันทึกยอด และข้อมูลสินค้าคงคลังของคุณ</p>
        </div>
        <div className={styles.dateBadge}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', marginRight: '6px' }}></span>
          {currentDate}
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <Package size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>รายการสินค้า</span>
            <span className={styles.statValue}>
              {totalSKUs}
              <span className={styles.statUnit}>SKUs</span>
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <Layers size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>สินค้าคงคลังทั้งหมด</span>
            <span className={styles.statValue}>
              {totalStockQty}
              <span className={styles.statUnit}>ชิ้น</span>
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconEmerald}`}>
            <DollarSign size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>มูลค่าต้นทุนคงคลัง</span>
            <span className={styles.statValue}>{formatCurrency(totalValuation)}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>กำไรจากการขายรวม</span>
            <span className={styles.statValue} style={{ color: '#10B981' }}>
              {formatCurrency(totalProfit)}
            </span>
          </div>
        </div>

        {/* KPI Target Card */}
        <div className={`${styles.statCard} ${styles.kpiCard}`}>
          <div className={`${styles.statIcon} ${styles.iconTarget}`}>
            <Target size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statTitle}>เป้ายอดขายเดือนนี้</span>
            <span className={styles.statValue}>{formatCurrency(currentMonthSales)}</span>
            <div className={styles.kpiProgress}>
              <div className={styles.kpiProgressBar}>
                <div
                  className={styles.kpiProgressFill}
                  style={{ width: `${Math.min((currentMonthSales / salesTarget) * 100, 100)}%` }}
                />
              </div>
              <span className={styles.kpiPercent}>
                {Math.round((currentMonthSales / salesTarget) * 100)}% ของเป้าหมาย
              </span>
            </div>
            <button
              className={styles.kpiEditBtn}
              onClick={() => setShowTargetModal(true)}
              title="ตั้งค่าเป้าหมาย"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Low Stock Section */}
        {lowStockAlerts.length > 0 && (
          <div className={styles.lowStockSection}>
            <div className={styles.lowStockHeader}>
              <AlertTriangle size={16} className="pulse-warning" style={{ color: '#EF4444' }} />
              <span className={styles.lowStockTitle}>
                สินค้าใกล้หมด ({lowStockAlerts.length})
              </span>
            </div>
            <div className={styles.lowStockList}>
              {lowStockAlerts.slice(0, 5).map((product, idx) => (
                <div key={`${product.id}-${idx}`} className={styles.lowStockItem}>
                  <span className={styles.lowStockName}>{product.name}</span>
                  <span className={styles.lowStockQty}>
                    {product.quantity} ชิ้น
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid - 3 Columns */}
      <div className={styles.chartsGrid}>

        {/* 1. Category Distribution (Donut Chart with Legend) */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <Package size={18} className={styles.accent} />
              สัดส่วนหมวดหมู่สินค้า
            </h2>
          </div>

          {mounted && categoryData.length > 0 ? (
            <div className={styles.pieChartWrapper}>
              <div className={styles.pieChartContainer} ref={pieRef}>
                <PieChart width={pieWidth} height={220}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '11px'
                    }}
                    formatter={(value) => [`${value} รายการ`, 'จำนวนสินค้า']}
                  />
                </PieChart>
              </div>

              {/* Rich Visual Category Legend */}
              <div className={styles.chartLegend}>
                {categoryData.map((entry, index) => {
                  const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={entry.name} className={styles.legendItem}>
                      <div className={styles.legendLabel}>
                        <span
                          className={styles.legendColor}
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span style={{ fontWeight: '500' }}>{entry.name}</span>
                      </div>
                      <span className={styles.legendValue}>
                        {entry.value} SKU ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Package size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p>ไม่มีข้อมูลหมวดหมู่สินค้า</p>
              <small style={{ color: 'var(--text-muted)' }}>ระบุหมวดหมู่ให้สินค้าเพื่อแสดงกราฟ</small>
            </div>
          )}
        </div>

        {/* 2. Profit Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <TrendingUp size={18} className={styles.accent} />
              แนวโน้มกำไร
            </h2>

            {/* Chart Filters */}
            <div className={styles.chartFilters}>
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className={styles.chartSelect}
              >
                <option value="7days">7 วันล่าสุด</option>
                <option value="30days">30 วันล่าสุด</option>
                <option value="month">รายเดือน</option>
              </select>

              {chartPeriod === 'month' && (
                <select
                  value={chartMonth}
                  onChange={(e) => setChartMonth(parseInt(e.target.value))}
                  className={styles.chartSelect}
                >
                  <option value="1">มกราคม</option>
                  <option value="2">กุมภาพันธ์</option>
                  <option value="3">มีนาคม</option>
                  <option value="4">เมษายน</option>
                  <option value="5">พฤษภาคม</option>
                  <option value="6">มิถุนายน</option>
                  <option value="7">กรกฎาคม</option>
                  <option value="8">สิงหาคม</option>
                  <option value="9">กันยายน</option>
                  <option value="10">ตุลาคม</option>
                  <option value="11">พฤศจิกายน</option>
                  <option value="12">ธันวาคม</option>
                </select>
              )}
            </div>
          </div>

          {/* Styled Area Chart */}
          <div className={styles.chartContainer} ref={chartRef}>
            {mounted && chartData.length > 0 ? (
              <AreaChart width={chartWidth} height={220} data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  formatter={(value) => [formatCurrency(value), 'กำไร']}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#profitGlow)"
                  dot={{ fill: '#10B981', r: 3, strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            ) : (
              <div className={styles.emptyState}>
                <TrendingUp size={32} style={{ color: 'var(--text-muted)' }} />
                <p>ไม่มีข้อมูลกำไรในช่วงเวลานี้</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Monthly Comparison (Bar Chart) */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <TrendingUp size={18} className={styles.accent} />
              เปรียบเทียบยอดขายรายเดือน
            </h2>
          </div>

          {mounted && monthlyComparison.length > 0 && (monthlyComparison[0].value > 0 || monthlyComparison[1].value > 0) ? (
            <div className={styles.barChartContainer} ref={barRef}>
              <BarChart width={barWidth} height={220} data={monthlyComparison} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  formatter={(value) => [formatCurrency(value), 'ยอดขาย']}
                />
                <Bar dataKey="value" fill="url(#barGlow)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <TrendingUp size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p>ไม่มีข้อมูลยอดขายในช่วงเวลานี้</p>
              <small style={{ color: 'var(--text-muted)' }}>ทำรายการขาย (OUT) เพื่อแสดงกราฟ</small>
            </div>
          )}
        </div>

      </div>

      {/* 4. Recent Activity (Full Width at the bottom) */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <Activity size={18} className={styles.accent} />
            การเคลื่อนไหวล่าสุด
          </h2>
        </div>

        {/* Recent Transactions - Desktop Table */}
        <div className={styles.tableContainer}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              ไม่มีประวัติการทำรายการสต๊อก
            </div>
          ) : (
            <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>วัน-เวลา</th>
                  <th>สินค้า</th>
                  <th style={{ textAlign: 'center' }}>ประเภท</th>
                  <th className={styles.qtyColumn}>จำนวน</th>
                  <th className={styles.desktopOnly} style={{ textAlign: 'right' }}>มูลค่ารวม</th>
                  <th className={styles.desktopOnly}>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 3).map(tx => {
                  const product = products.find(p => p.id === tx.product_id);
                  const sellingPrice = product?.selling_price || 0;
                  const totalValue = sellingPrice * tx.quantity;
                  return (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {new Date(tx.created_at).toLocaleString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{getProductName(tx.product_id)}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`
                          ${styles.txType}
                          ${tx.transaction_type === 'IN' ? styles.txTypeIn : ''}
                          ${tx.transaction_type === 'OUT' ? styles.txTypeOut : ''}
                          ${tx.transaction_type === 'ADJUST' ? styles.txTypeAdjust : ''}
                        `}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className={styles.qtyColumn}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '14px',
                          color: tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST' ? '#10B981' : '#EF4444'
                        }}>
                          {tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST' ? '+' : '-'}
                          {tx.quantity}
                        </span>
                      </td>
                      <td className={styles.desktopOnly} style={{
                        fontWeight: '700',
                        textAlign: 'right',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {formatCurrency(totalValue)}
                      </td>
                      <td className={styles.desktopOnly} style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.notes || ''}>
                        {tx.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards for Recent Transactions */}
            <div className={styles.mobileTxList}>
              {transactions.slice(0, 3).map(tx => {
                const product = products.find(p => p.id === tx.product_id);
                const sellingPrice = product?.selling_price || 0;
                const totalValue = sellingPrice * tx.quantity;
                const isIn = tx.transaction_type === 'IN' || tx.transaction_type === 'ADJUST';

                return (
                  <div key={tx.id} className={styles.mobileTxCard}>
                    <div className={styles.mobileTxHeader}>
                      <div className={styles.mobileTxProduct}>
                        <div className={styles.mobileTxProductName}>{getProductName(tx.product_id)}</div>
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
                    <div className={styles.mobileTxBody}>
                      <div className={styles.mobileTxRow}>
                        <span className={styles.mobileTxLabel}>เวลา</span>
                        <span className={styles.mobileTxValue}>
                          {new Date(tx.created_at).toLocaleString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <div className={styles.mobileTxRow}>
                        <span className={styles.mobileTxLabel}>จำนวน</span>
                        <span className={`${styles.mobileTxValue} ${styles.mobileTxQty} ${isIn ? styles.qtyIn : styles.qtyOut}`}>
                          {isIn ? '+' : '-'}{tx.quantity}
                        </span>
                      </div>
                      <div className={`${styles.mobileTxRow} ${styles.mobileTxRowTotal}`}>
                        <span className={styles.mobileTxLabel}>มูลค่า</span>
                        <span className={`${styles.mobileTxValue} ${styles.mobileTxValueTotal}`}>
                          {formatCurrency(totalValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <Link href="/transactions" className={styles.viewAllLink}>
            ดูทั้งหมด <ArrowRight size={14} style={{ display: 'inline-block', marginLeft: '4px' }} />
          </Link>
        </div>
      </div>

      {/* Target Setting Modal */}
      {showTargetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTargetModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>ตั้งค่าเป้าหมายยอดขาย</h2>
              <button onClick={() => setShowTargetModal(false)} className={styles.closeModalBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const newTarget = parseFloat(targetInput);
              if (isNaN(newTarget) || newTarget <= 0) {
                alert('กรุณาระบุยอดเป้าหมายที่ถูกต้อง');
                return;
              }
              try {
                await db.updateSetting('kpi_monthly_sales_target', newTarget.toString());
                setSalesTarget(newTarget);
                setShowTargetModal(false);
              } catch (err) {
                alert('ไม่สามารถบันทึกการตั้งค่าได้: ' + err.message);
              }
            }}>
              <div className={styles.formGroup}>
                <label htmlFor="target-input">เป้าหมายยอดขายรายเดือน (THB)</label>
                <input
                  id="target-input"
                  type="number"
                  min="0"
                  step="1000"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className={styles.modalInput}
                  required
                />
                <small className={styles.formHint}>ยอดขายปัจจุบัน: {formatCurrency(currentMonthSales)} ({Math.round((currentMonthSales / salesTarget) * 100)}%)</small>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowTargetModal(false)} className={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" className={styles.saveBtn}>
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
