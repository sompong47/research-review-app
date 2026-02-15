'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/login');
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ background: '#1f2937', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ fontWeight: 600 }}>สวัสดี, {user.name || user.email}</span>
        {user.role === 'admin' && <span style={{ marginLeft: 12, background: '#ff4081', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>Admin</span>}
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
