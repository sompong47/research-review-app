'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import AuthGuard from '../../components/AuthGuard';
import Header from '../../components/Header';

interface ResearchPaper {
  _id: string;
  title: string;
  authors?: string[];
  team?: string;
  status: 'pending' | 'completed';
  rating?: number;
  fileUrl?: string;
  image?: string;
}

const DashboardPage = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  /* ---------------- helpers ---------------- */
  const formatRating = (r?: number) =>
    typeof r === 'number' ? r.toFixed(1) : '-';

  const renderStars = (rating?: number) => {
    const safe = rating ?? 0;
    return (
      <span className={styles.ratingStars}>
        {'★'.repeat(Math.floor(safe))}
        {safe % 1 !== 0 && '½'}
      </span>
    );
  };

  /* ---------------- load data ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [papersRes, statsRes] = await Promise.all([
          fetch('/api/papers'),
          fetch('/api/dashboard'),
        ]);

        let basePapers: ResearchPaper[] = [];

        if (papersRes.ok) {
          const papersData = await papersRes.json();
          basePapers = (papersData || []).map((p: any) => ({
            ...p,
            team:
              p.authors && p.authors.length
                ? p.authors[0]
                : p.team || '',
            rating: 0,
          }));
        }

        if (statsRes.ok) {
          const stats = await statsRes.json();
          const ratingMap: Record<string, number> = {};

          (stats.perPaper || []).forEach((entry: any) => {
            if (entry._id) {
              ratingMap[String(entry._id)] =
                typeof entry.avgOverall === 'number'
                  ? Number(entry.avgOverall.toFixed(2))
                  : 0;
            }
          });

          basePapers = basePapers.map((p) => ({
            ...p,
            rating: ratingMap[p._id] ?? 0,
          }));
        }

        setPapers(basePapers);
        setPendingCount(basePapers.filter((p) => p.status === 'pending').length);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };

    load();
  }, []);

  /* ---------------- filter ---------------- */
  useEffect(() => {
    let filtered = papers;

    if (activeTab !== 'all') {
      filtered = filtered.filter((p) => p.status === activeTab);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.team || '').toLowerCase().includes(q)
      );
    }

    setFilteredPapers(filtered);
  }, [papers, activeTab, searchTerm]);

  /* ---------------- actions ---------------- */
  const handleEvaluate = (paperId: string) => {
    try {
      sessionStorage.setItem('selectedPaperId', paperId);
    } catch {}
    router.push('/evaluate');
  };

  /* ---------------- UI ---------------- */
  return (
    <AuthGuard>
      <Header />
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerLogo}>📚</span>
            <div>
              <h1 className={styles.headerTitle}>งานวิจัยที่ปิดให้ประเมิน</h1>
              <p className={styles.headerSubtitle}>
                เลือกงานวิจัยที่ต้องการทำการประเมิน
              </p>
            </div>
          </div>
        </header>

        {/* filters */}
        <div className={styles.filterSection}>
          <div className={styles.searchContainer}>
            <input
              placeholder="ค้นหาวิจัย..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            {(['all', 'pending', 'completed'] as const).map((t) => (
              <button
                key={t}
                className={`${styles.tabButton} ${
                  activeTab === t ? styles.active : ''
                } ${t === 'pending' && pendingCount > 0 ? styles.alertTab : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t === 'all'
                  ? 'ทั้งหมด'
                  : t === 'pending'
                  ? (
                      <>
                        ยังไม่ได้ประเมิน
                        {pendingCount > 0 && (
                          <span style={{color:'#dc2626', marginLeft:4}}>({pendingCount})</span>
                        )}
                      </>
                    )
                  : 'ประเมินแล้ว'}
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <div className={styles.mainContent}>
          {filteredPapers.length > 0 ? (
            <div className={styles.cardsGrid}>
              {filteredPapers.map((paper) => {
                const progress =
                  paper.status === 'pending'
                    ? Math.min(
                        70,
                        30 + Number(paper._id.slice(-2)) * 3
                      )
                    : 100;

                return (
                  <div key={paper._id} className={`${styles.card} ${paper.status==='pending' ? styles.pending : ''}`}>
                    <div className={styles.cardImage}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <div style={{ fontSize: 20, fontWeight: 800 }}>
                          {paper.team}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            marginTop: 6,
                            color: 'rgba(230,238,248,0.75)',
                          }}
                        >
                          คะแนน {formatRating(paper.rating)}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{paper.title}</h3>

                      <div className={styles.cardMeta}>
                        {renderStars(paper.rating)}
                        <span className={styles.cardTeam}>{paper.team}</span>
                      </div>

                      <div className={styles.cardStatus}>
                        <span
                          className={`${styles.statusBadge} ${
                            paper.status === 'pending'
                              ? styles.pending
                              : styles.completed
                          }`}
                        >
                          {paper.status === 'pending'
                            ? 'ยังไม่ได้ประเมิน'
                            : 'ประเมินแล้ว'}
                        </span>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div style={{ fontSize: 12, marginTop: 6 }}>
                          {progress}% ความคืบหน้า
                        </div>
                      </div>

                      <div className={styles.cardButtons}>
                        <button
                          className={styles.buttonEvaluate}
                          onClick={() => handleEvaluate(paper._id)}
                        >
                          ประเมิน
                        </button>
                        <button
                          className={styles.buttonOutline}
                          onClick={() =>
                            router.push(`/details?id=${paper._id}`)
                          }
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📭</div>
              <p>ไม่พบงานวิจัยที่ตรงกับการค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;
