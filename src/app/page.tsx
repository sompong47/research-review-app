'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      if (response.ok) {
        // Handle successful login
        alert('เข้าสู่ระบบสำเร็จ');
        // Redirect to dashboard
        // window.location.href = '/dashboard';
      } else {
        alert('ไม่สามารถเข้าสู่ระบบ กรุณาลองใหม่');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      {/* Branding Side */}
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


      {/* Form Side */}
      <div className={styles.formSide}>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>เข้าสู่ระบบ</h2>
            <p className={styles.formSubtitle}>
              ใส่บัญชีผู้ใช้ของคุณเพื่อเข้าสู่ระบบ
            </p>
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Remember Me & Forgot Password */}
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

          {/* Submit Button */}
          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>หรือ</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Social Login */}
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

          {/* Sign Up Link */}
          <div className={styles.signupLink}>
            ยังไม่มีบัญชี? <a href="/dashboard">สมัครสมาชิก</a>
          </div>
        </form>
      </div>
    </div>
  );
}
