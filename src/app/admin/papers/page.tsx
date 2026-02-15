'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Sidebar from '../../../components/admin/Sidebar';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';

interface PaperItem {
  _id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  fileUrl: string;
  status: string;
  createdAt: string;
}

const PapersPage = () => {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', authors: '' });

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const data = await res.json();
        setPapers(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch papers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือว่าต้องการลบงานวิจัยนี้?')) {
      try {
        const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setPapers(papers.filter((p) => p._id !== id));
        }
      } catch (err) {
        console.error('Failed to delete paper', err);
        alert('ไม่สามารถลบได้');
      }
    }
  };

  const handleEdit = (paper: PaperItem) => {
    setEditingId(paper._id);
    setEditForm({ title: paper.title, authors: (paper.authors || []).join(', ') });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          authors: editForm.authors.split(',').map((a) => a.trim()),
        }),
      });
      if (res.ok) {
        setPapers(
          papers.map((p) =>
            p._id === id
              ? {
                  ...p,
                  title: editForm.title,
                  authors: editForm.authors.split(',').map((a) => a.trim()),
                }
              : p
          )
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update paper', err);
      alert('ไม่สามารถอัปเดตได้');
    }
  };

  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authors?.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AuthGuard requiredRole="admin">
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '30px' }}>
          <div className={styles.adminHeader}>
            <h1>📚 จัดการงานวิจัย</h1>
            <p>ดู แก้ไข และลบงานวิจัยในระบบ</p>
          </div>

          {/* Search */}
          <div className={styles.section}>
            <h3>🔍 ค้นหา</h3>
            <input
              type="text"
              placeholder="ค้นหาตามชื่องานวิจัยหรือผู้แต่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Export Button */}
          <div className={styles.section}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  const csv = [
                    ['Title', 'Authors', 'Created Date', 'Status'].join(','),
                    ...filteredPapers.map((p) =>
                      [
                        `"${p.title.replace(/"/g, '""')}"`,
                        `"${(p.authors || []).join(';').replace(/"/g, '""')}"`,
                        new Date(p.createdAt).toLocaleDateString('th-TH'),
                        p.status,
                      ].join(',')
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'papers-export.csv';
                  a.click();
                }}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                📥 Export CSV ({filteredPapers.length})
              </button>
            </div>
          </div>

          {/* Papers List */}
          {loading ? (
            <div className={styles.emptyState}>⏳ กำลังโหลด...</div>
          ) : filteredPapers.length === 0 ? (
            <div className={styles.emptyState}>ไม่พบงานวิจัย</div>
          ) : (
            <div className={styles.section}>
              <div style={{ display: 'grid', gap: '15px' }}>
                {filteredPapers.map((paper) => (
                  <div
                    key={paper._id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      background: '#fff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {editingId === paper._id ? (
                      // Edit Mode
                      <div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>ชื่องานวิจัย:</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>ผู้แต่ง:</label>
                          <input
                            type="text"
                            value={editForm.authors}
                            onChange={(e) => setEditForm({ ...editForm, authors: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleSaveEdit(paper._id)}
                            style={{
                              padding: '8px 16px',
                              background: '#667eea',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            ✓ บันทึก
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '8px 16px',
                              background: '#d1d5db',
                              color: '#333',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            ✕ ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '12px',
                          }}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{paper.title}</h4>
                            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#666' }}>
                              👤 {paper.authors?.join(', ') || 'ไม่ระบุ'}
                            </p>
                            {paper.abstract && (
                              <p style={{ margin: '0', fontSize: '12px', color: '#999', maxHeight: '60px', overflow: 'hidden' }}>
                                {paper.abstract.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                          <div
                            style={{
                              padding: '6px 12px',
                              background: paper.status === 'completed' ? '#deffed' : '#fef3c7',
                              color: paper.status === 'completed' ? '#065f46' : '#92400e',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {paper.status === 'completed' ? '✓ เสร็จ' : '⏳ รอ'}
                          </div>
                        </div>

                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>
                          📅 {new Date(paper.createdAt).toLocaleDateString('th-TH')}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <a
                            href={paper.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '8px 12px',
                              background: '#667eea',
                              color: '#fff',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            📄 ดูไฟล์
                          </a>
                          <button
                            onClick={() => handleEdit(paper)}
                            style={{
                              padding: '8px 12px',
                              background: '#f59e0b',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              font: 'inherit',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(paper._id)}
                            style={{
                              padding: '8px 12px',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              font: 'inherit',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default PapersPage;
