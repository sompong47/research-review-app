'use client';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside style={{
      width: 240,
      background: '#0f172a',
      color: '#fff',
      padding: 20
    }}>
      <h2 style={{ marginBottom: 20 }}>🧠 Admin</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/admin">📊 Dashboard</Link>
        <Link href="/admin/papers">📚 งานวิจัย</Link>
        <Link href="/admin/evaluations">🧑‍⚖️ การประเมิน</Link>
        <Link href="/admin/analytics">📈 วิเคราะห์</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
