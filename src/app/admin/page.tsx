'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import AuthGuard from '../../components/AuthGuard';
import Header from '../../components/Header';
import StatCards from '../../components/admin/StatCards';
import PapersTable from '../../components/admin/PapersTable';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
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
} from 'recharts';

interface PaperItem {
  _id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  fileUrl: string;
  status: string;
  createdAt: string;
}

interface EvaluationData {
  _id: string;
  paperId: string;
  paperTitle: string;
  paperAuthors?: string[];
  scores: {
    originality: number;
    methodology: number;
    clarity: number;
    significance: number;
    overall: number;
  };
  comments: string;
  averageScore: number;
  createdAt: string;
}

interface AdminStats {
  totalEvaluations: number;
  totalPapers: number;
  completedPapers: number;
  pendingPapers: number;
  paperStats: Array<{
    paperId: string;
    paperTitle: string;
    paperAuthors: string[];
    evaluationCount: number;
    averageScores: {
      originality: number;
      methodology: number;
      clarity: number;
      significance: number;
      overall: number;
    };
    status: string;
  }>;
  scoreDistribution: {
    originality: number[];
    methodology: number[];
    clarity: number[];
    significance: number[];
    overall: number[];
  };
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<string>('');

  const fetchPapers = async () => {
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const data = await res.json();
        setPapers(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch papers', err);
    }
  };

  const fetchEvaluations = async (paperId?: string) => {
    try {
      const url = paperId ? `/api/admin/evaluations?paperId=${paperId}` : '/api/admin/evaluations';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch evaluations', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchPapers();
    fetchEvaluations();
    fetchStats();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('กรุณาเลือกไฟล์ PDF');
      return;
    }
    setLoading(true);
    setSuccessMessage('');
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('authors', authors);
      form.append('abstract', abstractText);
      form.append('file', file);

      const res = await fetch('/api/papers', { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Upload failed');
      }

      setTitle('');
      setAuthors('');
      setAbstractText('');
      setFile(null);
      setSuccessMessage('✓ อัปโหลดสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchPapers();
      await fetchStats();
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handlePaperFilter = async (paperId: string) => {
    setSelectedPaper(paperId);
    await fetchEvaluations(paperId || undefined);
  };

  const chartDataOriginality = [
    { score: '⭐', count: stats?.scoreDistribution.originality[0] || 0 },
    { score: '⭐⭐', count: stats?.scoreDistribution.originality[1] || 0 },
    { score: '⭐⭐⭐', count: stats?.scoreDistribution.originality[2] || 0 },
    { score: '⭐⭐⭐⭐', count: stats?.scoreDistribution.originality[3] || 0 },
    { score: '⭐⭐⭐⭐⭐', count: stats?.scoreDistribution.originality[4] || 0 },
  ];

  return (
    <AuthGuard requiredRole="admin">
      <Header />
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <h1>🎯 Admin Control Center</h1>
          <p>บริหารจัดการระบบประเมินงานวิจัยอย่างครบครัน</p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 ภาพรวม
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'upload' ? styles.active : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📤 อัปโหลดงานวิจัย
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 การวิเคราะห์
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'evaluations' ? styles.active : ''}`}
            onClick={() => setActiveTab('evaluations')}
          >
            📋 รายการประเมิน
          </button>
        </div>

        <main className={styles.adminContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              <StatCards stats={{
                totalPapers: stats?.totalPapers || 0,
                pending: stats?.pendingPapers || 0,
                completed: stats?.completedPapers || 0,
                totalEvaluations: stats?.totalEvaluations || 0,
              }} />

              {/* Papers Status Table */}
              <div className={styles.section}>
                <h2>📑 สถานะงานวิจัยทั้งหมด</h2>
                <div className={styles.tableContainer}>
                  <PapersTable 
                    papers={papers}
                    onDelete={(id) => {
                      setPapers(papers.filter(p => p._id !== id));
                      fetchStats();
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className={styles.tabContent}>
              <section className={styles.section}>
                <h2>📤 อัปโหลดงานวิจัยใหม่</h2>
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                <form onSubmit={handleUpload} className={styles.uploadForm}>
                  <div className={styles.formGroup}>
                    <label>หัวข้องานวิจัย *</label>
                    <input
                      type="text"
                      placeholder="เช่น การศึกษาผลกระทบของ AI ต่อการศึกษา"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ผู้แต่ง (คั่นด้วย comma) *</label>
                    <input
                      type="text"
                      placeholder="เช่น นาย ก, นาย ข"
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>บทคัดย่อ</label>
                    <textarea
                      placeholder="สรุปเนื้อหาหลัก..."
                      value={abstractText}
                      onChange={(e) => setAbstractText(e.target.value)}
                      rows={4}
                      className={styles.textarea}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>เลือกไฟล์ PDF *</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                      className={styles.fileInput}
                    />
                    {file && <div className={styles.fileInfo}>✓ {file.name}</div>}
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      disabled={loading}
                      className={styles.submitButton}
                    >
                      {loading ? '⏳ กำลังอัปโหลด...' : '✓ อัปโหลด'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('');
                        setAuthors('');
                        setAbstractText('');
                        setFile(null);
                      }}
                      className={styles.resetButton}
                    >
                      ล้างฟอร์ม
                    </button>
                  </div>
                </form>
              </section>

              {/* Papers List */}
              <section className={styles.section}>
                <h2>📚 รายการงานวิจัยที่อัปโหลด ({papers.length})</h2>
                {papers.length === 0 ? (
                  <div className={styles.emptyState}>ยังไม่มีงานวิจัย</div>
                ) : (
                  <div className={styles.papersList}>
                    {papers.map((p) => (
                      <div key={p._id} className={styles.paperCard}>
                        <div className={styles.paperHeader}>
                          <div className={styles.paperTitle}>{p.title}</div>
                          <div className={styles.paperStatus}>{p.status}</div>
                        </div>
                        <div className={styles.paperAuthors}>👤 {p.authors?.join(', ') || 'ไม่ระบุ'}</div>
                        {p.abstract && (
                          <div className={styles.paperAbstract}>
                            {p.abstract.substring(0, 150)}...
                          </div>
                        )}
                        <div className={styles.paperMeta}>
                          <small>📅 {new Date(p.createdAt).toLocaleDateString('th-TH')}</small>
                        </div>
                        <div className={styles.paperActions}>
                          <a
                            href={p.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.actionLink}
                          >
                            📄 ดูไฟล์
                          </a>
                          <a
                            href={`/details?id=${p._id}`}
                            className={styles.actionLink}
                          >
                            ℹ️ รายละเอียด
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className={styles.tabContent}>
              <AnalyticsCharts />

              {/* Score comparison by criteria */}
              <section className={styles.section}>
                <h2>🎯 เปรียบเทียบคะแนนตามหมวดหมู่</h2>
                {stats && (
                  <div className={styles.criteriaGrid}>
                    {[
                      {
                        name: 'ความเป็นต้นฉบับ',
                        key: 'originality',
                        color: '#667eea',
                      },
                      {
                        name: 'วิธีการวิจัย',
                        key: 'methodology',
                        color: '#f59e0b',
                      },
                      {
                        name: 'ความชัดเจน',
                        key: 'clarity',
                        color: '#10b981',
                      },
                      {
                        name: 'ความสำคัญ',
                        key: 'significance',
                        color: '#ef4444',
                      },
                    ].map((criteria) => {
                      const dist = stats.scoreDistribution[criteria.key as keyof typeof stats.scoreDistribution];
                      const data = [
                        { name: '1 ⭐', value: dist[0] },
                        { name: '2 ⭐', value: dist[1] },
                        { name: '3 ⭐', value: dist[2] },
                        { name: '4 ⭐', value: dist[3] },
                        { name: '5 ⭐', value: dist[4] },
                      ];

                      return (
                        <div key={criteria.key} className={styles.criteriaCard}>
                          <h4>{criteria.name}</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) =>
                                  value > 0 ? `${name}: ${value}` : ''
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {data.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'][index]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <div className={styles.tabContent}>
              <section className={styles.section}>
                <h2>📋 รายละเอียดการประเมิน</h2>

                {/* Filter by paper */}
                <div className={styles.filterSection}>
                  <label>ฟิลเตอร์ตามงานวิจัย:</label>
                  <select
                    value={selectedPaper}
                    onChange={(e) => handlePaperFilter(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">ทั้งหมด</option>
                    {papers.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Evaluations List */}
                {evaluations.length === 0 ? (
                  <div className={styles.emptyState}>ยังไม่มีการประเมิน</div>
                ) : (
                  <div className={styles.evaluationsList}>
                    {evaluations.map((evaluation, idx) => (
                      <div key={idx} className={styles.evaluationCard}>
                        <div className={styles.evalHeader}>
                          <div>
                            <div className={styles.evalTitle}>{evaluation.paperTitle}</div>
                            <div className={styles.evalAuthor}>
                              👤 {evaluation.paperAuthors?.join(', ')}
                            </div>
                          </div>
                          <div className={styles.evalScore}>
                            ⭐ {evaluation.averageScore.toFixed(2)}
                          </div>
                        </div>

                        <div className={styles.scoresGrid}>
                          <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>ความเป็นต้นฉบับ</span>
                            <div className={styles.scoreBar}>
                              <div
                                className={styles.scoreBarFill}
                                style={{
                                  width: `${(evaluation.scores.originality / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className={styles.scoreValue}>{evaluation.scores.originality}/5</span>
                          </div>

                          <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>วิธีการวิจัย</span>
                            <div className={styles.scoreBar}>
                              <div
                                className={styles.scoreBarFill}
                                style={{
                                  width: `${(evaluation.scores.methodology / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className={styles.scoreValue}>{evaluation.scores.methodology}/5</span>
                          </div>

                          <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>ความชัดเจน</span>
                            <div className={styles.scoreBar}>
                              <div
                                className={styles.scoreBarFill}
                                style={{
                                  width: `${(evaluation.scores.clarity / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className={styles.scoreValue}>{evaluation.scores.clarity}/5</span>
                          </div>

                          <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>ความสำคัญ</span>
                            <div className={styles.scoreBar}>
                              <div
                                className={styles.scoreBarFill}
                                style={{
                                  width: `${(evaluation.scores.significance / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className={styles.scoreValue}>{evaluation.scores.significance}/5</span>
                          </div>
                        </div>

                        {evaluation.comments && (
                          <div className={styles.evalComment}>
                            <strong>ความเห็น:</strong> {evaluation.comments}
                          </div>
                        )}

                        <div className={styles.evalDate}>
                          📅 {new Date(evaluation.createdAt).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>

        <footer className={styles.adminFooter}>
          <p>Admin Control Center &copy; 2026 | Research Review System</p>
        </footer>
      </div>
    </AuthGuard>
  );
};

export default AdminPage;
