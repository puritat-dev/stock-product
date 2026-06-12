'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, isMocked } from '@/lib/supabase';
import { KeyRound, Mail, AlertCircle, Database, ShieldAlert } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      try {
        const { data } = await auth.getSession();
        if (data?.session) {
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
      const { data, error } = await auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

        {isMocked ? (
          <div className={styles.mockAlert}>
            <Database size={16} className={styles.alertIcon} />
            <div className={styles.alertText}>
              <strong>โหมดฐานข้อมูลทดลอง (Mock Mode)</strong>
              <p>ระบบรันบน LocalStorage ของบราวเซอร์เพื่อความสะดวกในการทดสอบ สามารถใส่ Email และ Password ใดก็ได้เพื่อเข้าใช้งาน</p>
            </div>
          </div>
        ) : (
          <div className={styles.liveAlert}>
            <ShieldAlert size={16} className={styles.liveIcon} />
            <div className={styles.alertText}>
              <strong>โหมดใช้งานจริง (Supabase Connected)</strong>
              <p>เชื่อมต่อระบบฐานข้อมูลคลาวด์แล้ว กรุณาเข้าใช้งานด้วยบัญชีผู้ใช้จริงของคุณ</p>
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
            <label htmlFor="email" className={styles.label}>อีเมล (Email)</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
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
