'use client';

interface PapersTableProps {
  papers: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    fileUrl: string;
  }>;
  onDelete?: (id: string) => void;
}

const PapersTable = ({ papers, onDelete }: PapersTableProps) => {
  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบงานวิจัยนี้หรือไม่?')) return;
    
    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(id);
      } else {
        alert('ลบไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <table width="100%" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ddd' }}>
          <th style={{ padding: '12px', textAlign: 'left' }}>ชื่อเรื่อง</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>สถานะ</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>วันที่</th>
          <th style={{ padding: '12px', textAlign: 'center' }}>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {papers.map((p) => (
          <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px' }}>{p.title}</td>
            <td style={{ padding: '12px' }}>
              <span style={{
                background: p.status === 'completed' ? '#d1fae5' : '#fef3c7',
                color: p.status === 'completed' ? '#065f46' : '#92400e',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {p.status === 'completed' ? '✓ เสร็จ' : '⏳ รอ'}
              </span>
            </td>
            <td style={{ padding: '12px' }}>{new Date(p.createdAt).toLocaleDateString('th-TH')}</td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              <a href={p.fileUrl} target="_blank" rel="noreferrer" style={{
                margin: '0 4px',
                padding: '4px 8px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textDecoration: 'none',
                fontSize: '12px'
              }}>
                📄
              </a>
              <a href={`/details?id=${p._id}`} style={{
                margin: '0 4px',
                padding: '4px 8px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textDecoration: 'none',
                fontSize: '12px'
              }}>
                ℹ️
              </a>
              <button 
                onClick={() => handleDelete(p._id)}
                style={{
                  margin: '0 4px',
                  padding: '4px 8px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PapersTable;
