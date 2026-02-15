'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Sidebar from '../../../components/admin/Sidebar';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface AnalyticsData {
  papers: Array<{
    paperId: string;
    paperTitle: string;
    paperAuthors: string[];
    evaluationCount: number;
    status: string;
    averageScores: {
      originality: number;
      methodology: number;
      clarity: number;
      significance: number;
      overall: number;
    };
  }>;
  totalPapers: number;
  completedPapers: number;
  pendingPapers: number;
  totalEvaluations: number;
  scoreDistribution: {
    originality: number[];
    methodology: number[];
    clarity: number[];
    significance: number[];
    overall: number[];
  };
  average: {
    originality: number;
    methodology: number;
    clarity: number;
    significance: number;
    overall: number;
  };
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [years, setYears] = useState<number[]>([]);

  const fetchAnalytics = async (year?: string, status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year && year !== 'all') params.append('year', year);
      if (status && status !== 'all') params.append('status', status);

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get available years
    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear, currentYear - 1, currentYear - 2];
    setYears(availableYears);
    fetchAnalytics();
  }, []);

  const handleFilterChange = async (year?: string, status?: string) => {
    const newYear = year !== undefined ? year : selectedYear;
    const newStatus = status !== undefined ? status : selectedStatus;
    setSelectedYear(newYear);
    setSelectedStatus(newStatus);
    await fetchAnalytics(newYear, newStatus);
  };

  // Data for average scores comparison
  const averageScoresData = analytics
    ? [
        { name: 'ความเป็นต้นฉบับ', value: analytics.average.originality },
        { name: 'วิธีการวิจัย', value: analytics.average.methodology },
        { name: 'ความชัดเจน', value: analytics.average.clarity },
        { name: 'ความสำคัญ', value: analytics.average.significance },
        { name: 'คะแนนรวม', value: analytics.average.overall },
      ]
    : [];

  // Data for status distribution
  const statusData = analytics
    ? [
        { name: 'เสร็จสิ้น', value: analytics.completedPapers },
        { name: 'รอการประเมิน', value: analytics.pendingPapers },
      ]
    : [];

  // Data for evaluators per paper
  const evaluatorsData = analytics
    ? analytics.papers
        .filter((p) => p.evaluationCount > 0)
        .sort((a, b) => b.evaluationCount - a.evaluationCount)
        .slice(0, 10)
        .map((p) => ({
          name: p.paperTitle.substring(0, 20) + '...',
          evaluators: p.evaluationCount,
          fullTitle: p.paperTitle,
        }))
    : [];

  // Scatter plot for originality vs methodology
  const scatterData = analytics
    ? analytics.papers.map((p) => ({
        originality: p.averageScores.originality,
        methodology: p.averageScores.methodology,
        name: p.paperTitle,
      }))
    : [];

  return (
    <AuthGuard requiredRole="admin">
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '30px' }}>
          <div className={styles.adminHeader}>
            <h1>📈 การวิเคราะห์แบบละเอียด</h1>
            <p>ดูข้อมูลสถิติและความเห็นต่อประสิทธิภาพของการประเมิน</p>
          </div>

          {/* Filters */}
          <div className={styles.section}>
            <h3>🔍 ตัวกรอง</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label>ปีการศึกษา:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleFilterChange(e.target.value, undefined)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="all">ทั้งหมด</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>สถานะ:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleFilterChange(undefined, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="pending">รอการประเมิน</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>⏳ กำลังโหลด...</div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className={styles.section}>
                <h3>📊 ตัวชี้วัดหลัก</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div style={{ padding: '20px', background: '#f0f4ff', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>งานวิจัยทั้งหมด</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{analytics.totalPapers}</div>
                  </div>
                  <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>เสร็จสิ้น</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{analytics.completedPapers}</div>
                  </div>
                  <div style={{ padding: '20px', background: '#fffbf0', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>รอการประเมิน</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{analytics.pendingPapers}</div>
                  </div>
                  <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>การประเมินรวม</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{analytics.totalEvaluations}</div>
                  </div>
                </div>
              </div>

              {/* Average Scores */}
              <div className={styles.section}>
                <h3>⭐ คะแนนเฉลี่ยตามหมวดหมู่</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={averageScoresData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value: any) => (typeof value === 'number' ? value.toFixed(2) : value)} />
                    <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div className={styles.section}>
                <h3>📌 การกระจายสถานะ</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Evaluated Papers */}
              <div className={styles.section}>
                <h3>🔥 งานวิจัยที่ได้รับการประเมินมากที่สุด</h3>
                {evaluatorsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={evaluatorsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                              <p>{payload[0].payload.fullTitle}</p>
                              <p>ผู้ประเมิน: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Bar dataKey="evaluators" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyState}>ยังไม่มีการประเมิน</div>
                )}
              </div>

              {/* Originality vs Methodology Scatter */}
              <div className={styles.section}>
                <h3>🎯 ความเป็นต้นฉบับ vs วิธีการวิจัย</h3>
                {scatterData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="originality" name="ความเป็นต้นฉบับ" domain={[0, 5]} />
                      <YAxis dataKey="methodology" name="วิธีการวิจัย" domain={[0, 5]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                              <p>{payload[0].payload.name}</p>
                              <p>ต้นฉบับ: {payload[0].payload.originality}</p>
                              <p>วิธีการ: {payload[0].payload.methodology}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Scatter name="งานวิจัย" data={scatterData} fill="#667eea" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyState}>ยังไม่มีข้อมูล</div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AuthGuard>
  );
};

export default AnalyticsPage;
