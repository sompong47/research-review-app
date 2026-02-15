'use client';

interface StatCardsProps {
  stats: {
    totalPapers: number;
    pending: number;
    completed: number;
    totalEvaluations: number;
  };
}

const StatCards = ({ stats }: StatCardsProps) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      <Card title="📚 งานวิจัยทั้งหมด" value={stats.totalPapers} />
      <Card title="⏳ รอประเมิน" value={stats.pending} />
      <Card title="✅ เสร็จสิ้น" value={stats.completed} />
      <Card title="🧾 การประเมินทั้งหมด" value={stats.totalEvaluations} />
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: number }) => (
  <div style={{
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  }}>
    <div style={{ fontSize: 14, color: '#666' }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</div>
  </div>
);

export default StatCards;
