'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userAuth, isMocked } from '@/lib/supabase';
import { KeyRound, User, AlertCircle, Database } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      try {
        const session = await userAuth.getSession();
        if (session) {
          router.push('/');
        }
      } catch (err) {
        console.error("Session check error on login page:", err);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await userAuth.login(username, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.loginCard} glass-card`}>
        <div className={styles.header}>
          <div className={styles.logo}>📦</div>
          <h1 className={styles.title}>STOCK<span className={styles.accent}>PRODUCT</span></h1>
          <p className={styles.subtitle}>ระบบจัดการสินค้าและคลังสินค้าอัจฉริยะ</p>
        </div>

        {isMocked && (
          <div className={styles.mockAlert}>
            <Database size={16} className={styles.alertIcon} />
            <div className={styles.alertText}>
              <strong>โหมดฐานข้อมูลทดลอง (Mock Mode)</strong>
              <p>ระบบรันบน LocalStorage ของบราวเซอร์ เข้าใช้งานด้วย: <strong>admin / 123456</strong></p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorContainer}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>ชื่อผู้ใช้ (Username)</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.fieldIcon} />
              <input
                id="username"
                type="text"
                placeholder="เช่น testuser"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>รหัสผ่าน (Password)</label>
            <div className={styles.inputWrapper}>
              <KeyRound size={18} className={styles.fieldIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
