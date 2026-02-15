'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        {loading ? (
          <>
            <div style={{ marginBottom: 16 }}>⏳</div>
            <p>กำลังตรวจสอบ...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
