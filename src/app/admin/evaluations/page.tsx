'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import Sidebar from '../../../components/admin/Sidebar';
import AuthGuard from '../../../components/AuthGuard';
import Header from '../../../components/Header';

interface DetailedEvaluation {
  _id: string;
  paperId: string;
  paperTitle: string;
  paperAuthors: string[];
  evaluatorNumber: number;
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

interface Paper {
  _id: string;
  title: string;
  authors?: string[];
}

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<DetailedEvaluation[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('-1');
  const [minScore, setMinScore] = useState<number>(0);

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

  const fetchEvaluations = async (paperId?: string, sort?: string, order?: string, minSc?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (paperId) params.append('paperId', paperId);
      if (sort) params.append('sortBy', sort);
      if (order) params.append('sortOrder', order);
      if (minSc && minSc > 0) params.append('minScore', minSc.toString());

      const res = await fetch(`/api/admin/evaluations/detailed?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch evaluations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
    fetchEvaluations();
  }, []);

  const handleFilterChange = async () => {
    await fetchEvaluations(selectedPaper || undefined, sortBy, sortOrder, minScore);
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 4.5) return '#deffed';
    if (score >= 3) return '#fef3c7';
    return '#fee2e2';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 4.5) return '#059669';
    if (score >= 3) return '#d97706';
    return '#dc2626';
  };

  return (
    <AuthGuard requiredRole="admin">
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '30px' }}>
          <div className={styles.adminHeader}>
            <h1>📋 การจัดการการประเมิน</h1>
            <p>ดูประวัติการประเมินและความคิดเห็นโดยไม่เปิดเผยตัวตน (ความปลอดภัยของผู้ประเมิน)</p>
          </div>

          {/* Filters */}
          <div className={styles.section}>
            <h3>🔍 ตัวกรองและการจัดเรียง</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>งานวิจัย:</label>
                <select
                  value={selectedPaper}
                  onChange={(e) => setSelectedPaper(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="">ทั้งหมด</option>
                  {papers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>จัดเรียงตาม:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="createdAt">วันที่ประเมิน</option>
                  <option value="overall">คะแนนรวม</option>
                  <option value="originality">ความเป็นต้นฉบับ</option>
                  <option value="methodology">วิธีการวิจัย</option>
                  <option value="clarity">ความชัดเจน</option>
                  <option value="significance">ความสำคัญ</option>
                </select>
              </div>
              <div>
                <label>ลำดับ:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="-1">จากมากไปน้อย</option>
                  <option value="1">จากน้อยไปมาก</option>
                </select>
              </div>
              <div>
                <label>คะแนนขั้นต่ำ:</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minScore}
                    onChange={(e) => setMinScore(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: '40px', fontWeight: 'bold' }}>{minScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleFilterChange}
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              🔍 ใช้ตัวกรอง
            </button>
          </div>

          {/* Evaluations List */}
          {loading ? (
            <div className={styles.emptyState}>⏳ กำลังโหลด...</div>
          ) : evaluations.length === 0 ? (
            <div className={styles.emptyState}>ยังไม่มีการประเมิน</div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                พบการประเมิน: <strong>{evaluations.length}</strong> รายการ
              </div>
              <div style={{ display: 'grid', gap: '20px' }}>
                {evaluations.map((evaluation) => (
                  <div
                    key={evaluation._id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      background: '#fff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '15px',
                        paddingBottom: '15px',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{evaluation.paperTitle}</h4>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>👤 {evaluation.paperAuthors.join(', ')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            background: getScoreBgColor(evaluation.averageScore),
                            color: getScoreTextColor(evaluation.averageScore),
                            padding: '12px 16px',
                            borderRadius: '8px',
                            minWidth: '80px',
                          }}
                        >
                          ⭐ {evaluation.averageScore.toFixed(2)}
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#999' }}>
                          ผู้ประเมิน #{evaluation.evaluatorNumber}
                        </p>
                      </div>
                    </div>

                    {/* Scores Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '15px' }}>
                      {[
                        { label: 'ความเป็นต้นฉบับ', score: evaluation.scores.originality },
                        { label: 'วิธีการวิจัย', score: evaluation.scores.methodology },
                        { label: 'ความชัดเจน', score: evaluation.scores.clarity },
                        { label: 'ความสำคัญ', score: evaluation.scores.significance },
                        { label: 'คะแนนรวม', score: evaluation.scores.overall },
                      ].map((criterion, idx) => (
                        <div key={idx} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>{criterion.label}</div>
                          <div
                            style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              background: getScoreBgColor(criterion.score),
                              color: getScoreTextColor(criterion.score),
                              padding: '10px',
                              borderRadius: '6px',
                            }}
                          >
                            {criterion.score}/5
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comments */}
                    {evaluation.comments && (
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '12px' }}>💬 ความเห็น:</p>
                        <div
                          style={{
                            background: '#f9fafb',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            borderLeft: '4px solid #667eea',
                          }}
                        >
                          {evaluation.comments}
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      📅 {new Date(evaluation.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
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

export default EvaluationsPage;
