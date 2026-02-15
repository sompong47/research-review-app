'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.includes(path)) return true;
    return false;
  };

  const navItems = [
    { href: '/admin', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/papers', label: '📚 งานวิจัย', icon: '📚' },
    { href: '/admin/evaluations', label: '📋 การประเมิน', icon: '📋' },
    { href: '/admin/analytics', label: '📈 วิเคราะห์', icon: '📈' },
  ];

  return (
    <aside style={{
      width: 240,
      background: '#0f172a',
      color: '#fff',
      padding: 0,
      minHeight: '100vh',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>🧠 Admin</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Control Center</p>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '12px 0' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: '12px 16px',
              color: isActive(item.href) ? '#667eea' : '#cbd5e1',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive(item.href) ? '600' : '400',
              background: isActive(item.href) ? '#1e293b' : 'transparent',
              borderLeft: isActive(item.href) ? '4px solid #667eea' : '4px solid transparent',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.background = '#1e293b';
                e.currentTarget.style.color = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
