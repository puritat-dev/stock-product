'use client';

import styles from './Skeleton.module.css';

// Base Skeleton pulse animation component
export function Skeleton({ className, width, height }) {
  return (
    <div
      className={`${styles.skeleton} ${className || ''}`}
      style={{
        width: width || '100%',
        height: height || '20px',
      }}
    />
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Skeleton width="200px" height="32px" className={styles.title} />
          <Skeleton width="300px" height="16px" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.statCard} glass-card`}>
            <Skeleton width="24px" height="24px" />
            <div className={styles.statContent}>
              <Skeleton width="60px" height="14px" />
              <Skeleton width="80px" height="24px" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section Skeleton */}
      <div className={styles.chartSection}>
        <div className={`${styles.chartCard} glass-card`}>
          <Skeleton width="150px" height="20px" />
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartBars}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className={styles.chartBar} style={{ height: `${40 + (i * 7) % 55}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Skeleton */}
      <div className={styles.alertsSection}>
        <div className={`${styles.alertsCard} glass-card`}>
          <Skeleton width="180px" height="20px" />
          <div className={styles.alertList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.alertItem}>
                <Skeleton width="20px" height="20px" className={styles.alertIcon} />
                <div className={styles.alertContent}>
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="80px" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Skeleton */}
      <div className={styles.transactionsSection}>
        <div className={`${styles.txCards} glass-card`}>
          <Skeleton width="150px" height="20px" />
          <div className={styles.txList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.txItem}>
                <div className={styles.txIcon}>
                  <Skeleton width="36px" height="36px" />
                </div>
                <div className={styles.txDetails}>
                  <Skeleton width="100px" height="14px" />
                  <Skeleton width="60px" height="12px" />
                </div>
                <Skeleton width="80px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Products Page Skeleton
export function ProductsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.productsHeader}>
        <div>
          <Skeleton width="120px" height="28px" />
          <Skeleton width="200px" height="14px" marginTop="8px" />
        </div>
        <Skeleton width="120px" height="40px" />
      </div>

      {/* Filters Skeleton */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Skeleton width="100%" height="40px" />
        </div>
        <Skeleton width="150px" height="40px" />
      </div>

      {/* Table Skeleton */}
      <div className={`${styles.tableCard} glass-card`}>
        {/* Table Header */}
        <div className={styles.tableHeader}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="14px" width={i === 1 ? '80px' : i === 2 ? '150px' : '100px'} />
          ))}
        </div>

        {/* Table Rows */}
        <div className={styles.tableBody}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.tableRow}>
              <Skeleton width="60px" height="20px" />
              <Skeleton width="120px" height="14px" />
              <Skeleton width="100px" height="14px" />
              <Skeleton width="80px" height="14px" />
              <Skeleton width="80px" height="14px" />
              <Skeleton width="60px" height="14px" />
              <div className={styles.tableActions}>
                <Skeleton width="36px" height="36px" />
                <Skeleton width="36px" height="36px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Transactions Page Skeleton
export function TransactionsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.txPageHeader}>
        <div>
          <Skeleton width="140px" height="28px" />
          <Skeleton width="250px" height="14px" marginTop="8px" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className={styles.txFilters}>
        <div className={styles.searchBox}>
          <Skeleton width="100%" height="40px" />
        </div>
        <Skeleton width="120px" height="40px" />
        <Skeleton width="120px" height="40px" />
        <Skeleton width="140px" height="40px" />
        <Skeleton width="140px" height="40px" />
      </div>

      {/* Table Skeleton */}
      <div className={`${styles.txTableCard} glass-card`}>
        {/* Table Header */}
        <div className={styles.txTableHeader}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="14px" width={i === 1 ? '100px' : '120px'} />
          ))}
        </div>

        {/* Table Rows */}
        <div className={styles.txTableBody}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={styles.txTableRow}>
              <Skeleton width="80px" height="14px" />
              <Skeleton width="120px" height="14px" />
              <Skeleton width="60px" height="24px" />
              <Skeleton width="100px" height="14px" />
              <Skeleton width="80px" height="14px" />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className={styles.pagination}>
          <Skeleton width="80px" height="36px" />
          <div className={styles.pageNumbers}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="40px" height="36px" />
            ))}
          </div>
          <Skeleton width="80px" height="36px" />
        </div>
      </div>
    </div>
  );
}

// Reports Page Skeleton
export function ReportsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.reportsHeader}>
        <Skeleton width="140px" height="28px" />
        <Skeleton width="280px" height="14px" marginTop="8px" />
      </div>

      {/* Tabs Skeleton */}
      <div className={styles.tabs}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="80px" height="44px" />
        ))}
      </div>

      {/* Period Filter Skeleton */}
      <div className={styles.periodFilters}>
        <Skeleton width="120px" height="40px" />
        <div className={styles.dateRange}>
          <Skeleton width="140px" height="40px" />
          <Skeleton width="140px" height="40px" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className={styles.summaryGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.summaryCard} glass-card`}>
            <Skeleton width="60px" height="14px" />
            <Skeleton width="100px" height="24px" marginTop="8px" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className={`${styles.chartCardLarge} glass-card`}>
        <Skeleton width="180px" height="20px" />
        <div className={styles.lineChartPlaceholder}>
          <svg viewBox="0 0 400 200" className={styles.lineChartSvg}>
            {/* Grid lines */}
            {[1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} className={styles.gridLine} />
            ))}
            {/* Area fill */}
            <path d="M0,150 Q50,120 100,130 T200,80 T300,100 T400,60 L400,200 L0,200 Z" className={styles.chartArea} />
            {/* Line */}
            <path d="M0,150 Q50,120 100,130 T200,80 T300,100 T400,60" className={styles.chartLine} />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Simple Card Skeleton for generic use
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className={`${styles.cardSkeleton} glass-card`}>
      <Skeleton width="40px" height="40px" />
      <div className={styles.cardContent}>
        <Skeleton width="120px" height="16px" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton key={i} width={`${80 + Math.random() * 40}px`} height="14px" marginTop="8px" />
        ))}
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <div className={styles.tableRowSkeleton}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width={`${60 + Math.random() * 60}px`} height="14px" />
      ))}
    </div>
  );
}
