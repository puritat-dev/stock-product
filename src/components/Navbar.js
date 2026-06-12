'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, isMocked } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  History, 
  LogOut, 
  Sun, 
  Moon, 
  Database
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session
    const checkSession = async () => {
      try {
        const { data } = await auth.getSession();
        if (data?.session) {
          setUser(data.session.user);
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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
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

        <div className={styles.links}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/products" className={`${styles.navLink} ${pathname === '/products' ? styles.active : ''}`}>
            <Package size={18} />
            <span>Products</span>
          </Link>
          <Link href="/inventory" className={`${styles.navLink} ${pathname === '/inventory' ? styles.active : ''}`}>
            <Warehouse size={18} />
            <span>Inventory</span>
          </Link>
          <Link href="/transactions" className={`${styles.navLink} ${pathname === '/transactions' ? styles.active : ''}`}>
            <History size={18} />
            <span>Transactions</span>
          </Link>
        </div>

        <div className={styles.profileSection}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user?.email || 'demo@stockproduct.com'}</span>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
