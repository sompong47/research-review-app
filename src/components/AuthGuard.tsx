'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'reviewer';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (requiredRole && data.user?.role !== requiredRole) {
          router.push('/');
          return;
        }
        setAuthenticated(true);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router, requiredRole]);

  if (loading) return <div>กำลังโหลด...</div>;
  if (!authenticated) return null;

  return <>{children}</>;
}
