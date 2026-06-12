'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { userAuth, isMocked } from '@/lib/supabase';
import {
  LayoutDashboard,
  Package,
  History,
  FileBarChart,
  LogOut,
  Sun,
  Moon,
  Database,
  Menu,
  X
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check session
    const checkSession = async () => {
      try {
        const session = await userAuth.getSession();
        if (session) {
          setUser(session.user);
        } else if (pathname !== '/login') {
          router.push('/login');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [pathname, router]);

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Close mobile menu when pathname changes (after login/navigation)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await userAuth.logout();
      router.push('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (pathname === '/login') return null;
  if (loading) return <div className={styles.loading}>Loading stock-product system...</div>;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>📦</div>
          <span className={styles.logoText}>STOCK<span className={styles.accent}>PRODUCT</span></span>
          {isMocked && (
            <span className={styles.mockBadge} title="Using client-side LocalStorage fallback database">
              <Database size={12} /> Local Mock
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className={styles.links}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/products" className={`${styles.navLink} ${pathname === '/products' ? styles.active : ''}`}>
            <Package size={18} />
            <span>Products</span>
          </Link>
          <Link href="/transactions" className={`${styles.navLink} ${pathname === '/transactions' ? styles.active : ''}`}>
            <History size={18} />
            <span>Transactions</span>
          </Link>
          <Link href="/reports" className={`${styles.navLink} ${pathname === '/reports' ? styles.active : ''}`}>
            <FileBarChart size={18} />
            <span>Reports</span>
          </Link>
        </div>

        {/* Desktop Profile Section */}
        <div className={styles.profileSection}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user?.username || 'User'}</span>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu}></div>
        <div className={styles.mobileMenuContent}>
          <div className={styles.mobileMenuHeader}>
            <span className={styles.mobileMenuTitle}>เมนู</span>
            <button onClick={closeMobileMenu} className={styles.mobileCloseBtn}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.mobileMenuLinks}>
            <Link
              href="/"
              className={`${styles.mobileNavLink} ${pathname === '/' ? styles.mobileNavLinkActive : ''}`}
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/products"
              className={`${styles.mobileNavLink} ${pathname === '/products' ? styles.mobileNavLinkActive : ''}`}
              onClick={closeMobileMenu}
            >
              <Package size={20} />
              <span>Products</span>
            </Link>
            <Link
              href="/transactions"
              className={`${styles.mobileNavLink} ${pathname === '/transactions' ? styles.mobileNavLinkActive : ''}`}
              onClick={closeMobileMenu}
            >
              <History size={20} />
              <span>Transactions</span>
            </Link>
            <Link
              href="/reports"
              className={`${styles.mobileNavLink} ${pathname === '/reports' ? styles.mobileNavLinkActive : ''}`}
              onClick={closeMobileMenu}
            >
              <FileBarChart size={20} />
              <span>Reports</span>
            </Link>
          </div>
          <div className={styles.mobileMenuFooter}>
            <div className={styles.mobileUserInfo}>
              <span className={styles.mobileUserEmail}>{user?.username || 'User'}</span>
              <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                <LogOut size={18} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
