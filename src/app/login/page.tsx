'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }

      const data = await res.json();
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.brandingSide}>
        <div className={styles.brandingContent}>
          <span className={styles.brandingIcon}>📚</span>
          <h1 className={styles.brandingTitle}>Research Review System</h1>
          <p className={styles.brandingDescription}>
            ระบบบริหารและประเมินงานวิจัยออนไลน์ที่ครบครัน
            <br />
            สำหรับสถาบันการศึกษา
          </p>
        </div>
      </div>
      <div className={styles.formSide}>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>เข้าสู่ระบบ</h2>
            <p className={styles.formSubtitle}>
              ใส่บัญชีผู้ใช้ของคุณเพื่อเข้าสู่ระบบ
            </p>
          </div>
          {error && <div style={{ padding: 12, background: '#fecaca', color: '#991b1b', borderRadius: 6, marginBottom: 16 }}>{error}</div>}
          <div className={styles.formGroup}>
            <label className={styles.label}>อีเมล</label>
            <input
              className={styles.input}
              type="email"
              placeholder="กรุณาใส่อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>รหัสผ่าน</label>
            <input
              className={styles.input}
              type="password"
              placeholder="กรุณาใส่รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formOptions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              จำฉันไว้
            </label>
            <a href="#" className={styles.forgotPassword}>
              ลืมรหัสผ่าน?
            </a>
          </div>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>หรือ</span>
            <div className={styles.dividerLine}></div>
          </div>
          <div className={styles.socialButtons}>
            <button
              className={styles.socialButton}
              type="button"
              title="เข้าสู่ระบบด้วย Google"
            >
              🔍
            </button>
            <button
              className={styles.socialButton}
              type="button"
              title="เข้าสู่ระบบด้วย Facebook"
            >
              👤
            </button>
            <button
              className={styles.socialButton}
              type="button"
              title="เข้าสู่ระบบด้วย GitHub"
            >
              💻
            </button>
          </div>
          <div className={styles.signupLink}>
            ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
