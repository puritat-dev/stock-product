# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

This is a **Stock Product Management System** — a Next.js 16 inventory management application for tracking products, stock quantities, and transactions. The UI is primarily in **Thai language**.

**Tech Stack**: Next.js 16.2.9, React 19, Supabase (with LocalStorage fallback), Tailwind CSS 4, lucide-react icons, Recharts

## Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

For iOS mobile testing via Expo, see `stock-app/` directory (separate Expo + WebView project).

## Architecture

### Dual Database Mode (Supabase + LocalStorage Fallback)

The application automatically falls back to a LocalStorage-based mock database when Supabase credentials are not configured. This is defined in `src/lib/supabase.js`:

- **Real Supabase mode**: Activated when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set to non-placeholder values
- **Mock mode**: Uses LocalStorage with seeded mock data when env vars are missing

The unified export interface:
```javascript
import { db, auth, isMocked, client } from '@/lib/supabase';
```

**Available db methods:**
- `db.getProducts()`, `db.createProduct()`, `db.updateProduct()`, `db.deleteProduct()`
- `db.getTransactions()`, `db.createTransaction()`
- `auth.getSession()`, `auth.signInWithPassword()`, `auth.signOut()`

### Database Schema (Simplified)

See `schema.sql` for the complete Supabase schema. **Warehouses were removed** - stock quantities are now tracked directly in the products table:

1. **app_users** — User authentication (id, username, password, name, role)
2. **products** — Product catalog with embedded stock tracking (id, sku, name, description, category, cost_price, selling_price, barcode, image_url, **quantity**, **safety_stock**)
3. **stock_transactions** — Transaction ledger (id, product_id, transaction_type IN/OUT/ADJUST, quantity, notes, created_at)

**Important**: A PostgreSQL trigger `process_stock_transaction()` automatically updates `products.quantity` when transactions are inserted. This trigger handles:
- IN: Adds quantity
- OUT: Subtracts quantity  
- ADJUST: Adds quantity (for corrections)

### App Structure

- `src/app/` — Next.js App Router pages
  - `page.js` — Dashboard (stats cards, profit chart, low stock alerts, recent transactions)
  - `products/page.js` — Product CRUD with table layout
  - `transactions/page.js` — Transaction history with filters (search, type, date range)
  - `reports/page.js` — Reports with tabbed navigation (sales, products, category, stock valuation)
  - `login/page.js` — Authentication page
- `src/components/Navbar.js` — Navigation with auth check, theme toggle, mobile menu, and mock mode badge
- `src/components/Skeleton.js` — Loading skeleton components for all pages
- `src/lib/supabase.js` — Unified database client (Supabase or mock fallback)

### Styling System

- **CSS Modules** — Each component has a `.module.css` file (e.g., `page.module.css`)
- **Tailwind CSS 4** with PostCSS
- **Dark/light theme** via `data-theme` attribute on `<html>` element
- **CSS Variables** defined in `globals.css`:
  - Colors: `--color-primary`, `--color-success`, `--color-warning`, `--color-error`
  - Backgrounds: `--bg-main`, `--bg-card`, `--bg-input`
  - Text: `--text-primary`, `--text-secondary`, `--text-muted`
  - Utilities: `--glass-blur`, `--radius-sm/md/lg`, `--transition-fast/normal`
- **Glassmorphism**: `glass-card` utility class for translucent card effects

### Responsive Design (Mobile-First)

The app uses **card layouts for mobile** and **table layouts for desktop**:

- **Desktop (>768px)**: Traditional table layouts with proper column widths
- **Mobile/Tablet (≤768px)**: Card-based layouts where each row becomes a vertical card
- **Very small mobile (<600px)**: Reduced font sizes for better readability
- **Breakpoints**: 1024px (iPad), 768px (tablet), 600px (mobile), 432px (very small)

See individual page CSS files for `.desktopOnly` class that hides columns on mobile, and `.mobileCards` / `.mobileTxList` for card layouts.

### Client-Side Auth

Navbar (`src/components/Navbar.js`) performs session checks and redirects unauthenticated users to `/login`. In mock mode, login uses LocalStorage (`demo_logged_in` key). Mobile menu automatically closes on pathname changes.

### Reports Page Architecture (`src/app/reports/page.js`)

The reports page uses tab-based navigation with conditional rendering:

**Tabs:**
- `sales` — Sales trends with chart and summary cards (ยอดขาย, ต้นทุนรวม, กำไร, etc.)
- `products` — Product performance ranking by profit
- `category` — Category-based profit distribution with PieChart
- `stock` — Stock valuation with detailed product list

**Key Patterns:**
1. **useContainerWidth** hook — Uses ResizeObserver to get container width for responsive charts
2. **Tab-specific filters** — Date filters shown only for sales/products/category; search shown for stock/products
3. **Mobile-first table/cards** — Desktop uses table, mobile uses clickable cards that open modal
4. **Pagination with responsive itemsPerPage** — 10 items on mobile (<768px), 20 on desktop
5. **Modal for details** — On mobile, tapping a card opens a modal with full product details

**Search Integration:**
- Search bar is embedded in the filters section (not separate)
- Shows conditionally based on active tab
- Filters by name, SKU, or category
- Resets pagination when search query changes

## Important Notes

- **Language**: The UI uses Thai language text throughout (e.g., "ภาพรวมระบบสต๊อกสินค้า", "กำลังประมวลผล...")
- **Next.js 16** has breaking changes from earlier versions
- **No warehouses** - stock tracking simplified to per-product quantities
- **Currency**: Thai Baht (THB) via `Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' })`
- **Viewport**: Zoom disabled on mobile via layout.js viewport config
- **Mock mode badge**: Shows "Local Mock" in navbar when using LocalStorage fallback; login page shows "Mock Mode" alert only in mock mode
- **Reports chart heights**: Sales chart 260px, Category PieChart 220px (smaller than dashboard for space efficiency)

## Seed Data

For testing with large datasets:
- `seed-data.sql` — Basic seed data
- `seed-data-large.sql` — Large dataset spanning multiple days for testing pagination and reports

## Future Plans

See `phase_2.md` for multi-tenant architecture plans (user isolation via RLS).

## Assets

- Favicon: `src/app/icon.png`, `src/app/apple-icon.png` — Next.js 13+ automatically detects these
- Promotional prompts: `prompts/PROMPT_VIDEO_PRESENTATION.md` — AI prompts for marketing materials

## Chart Configuration

Dashboard profit chart uses **hardcoded colors** (not CSS variables) for visibility:
- Line color: `#00FF00` (bright green)
- Grid: `#444` (dark gray)
- Axes/labels: `#888` (medium gray)
- Tooltip: `#222` background with `#444` border

Reports charts also use hardcoded colors:
- Sales lines: Blue (`#3B82F6`), Orange (`#F59E0B`), Green (`#10B981`)
- PieChart: 6-color array for categories

Do not use CSS variables like `var(--color-success)` for chart colors as they may not render properly.

## Component Patterns

### Loading States (`src/components/Skeleton.js`)

Each page has a corresponding skeleton component:
- `DashboardSkeleton()` — Dashboard page
- `ProductsSkeleton()` — Products page  
- `TransactionsSkeleton()` — Transactions page
- `ReportsSkeleton()` — Reports page
- `CardSkeleton()` — Generic reusable card skeleton
- `TableRowSkeleton()` — Generic table row skeleton

Always wrap tab- consuming components in `<Suspense>` when using `useSearchParams()` or similar hooks.

### Pagination Pattern

Consistent pagination across products, transactions, and reports:
- Desktop: 20 items per page
- Mobile (<768px): 10 items per page
- Page numbers with ellipsis for navigation
- "แสดง X - Y จาก Z รายการ" info display
