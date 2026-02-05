'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

interface ResearchPaper {
  id: string;
  title: string;
  team: string;
  status: 'pending' | 'completed';
  rating: number;
  image?: string;
}

const DashboardPage = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const router = useRouter();

  // Mock data
  useEffect(() => {
    const mockData: ResearchPaper[] = [
      {
        id: '1',
        title: 'แมว - ระบบส่งเสริมกิจกรรมวิจัยเพื่อสาธารณสุข',
        team: 'TEAM 8',
        status: 'pending',
        rating: 4.5,
      },
      {
        id: '2',
        title: 'การพัฒนาเอกสารวิจัยด้านการศึกษา',
        team: 'TEAM 5',
        status: 'pending',
        rating: 4.0,
      },
      {
        id: '3',
        title: 'การศึกษาผลกระทบของเทคโนโลยีต่อสังคม',
        team: 'TEAM 3',
        status: 'completed',
        rating: 4.8,
      },
      {
        id: '4',
        title: 'ระบบจัดการข้อมูลการวิจัย',
        team: 'TEAM 7',
        status: 'pending',
        rating: 4.2,
      },
      {
        id: '5',
        title: 'วิทยานิพนธ์เรื่องการค้นหาข้อมูลออนไลน์',
        team: 'TEAM A',
        status: 'completed',
        rating: 3.9,
      },
      {
        id: '6',
        title: 'การวิเคราะห์แนวโน้มการศึกษาในปัจจุบัน',
        team: 'TEAM B',
        status: 'pending',
        rating: 4.3,
      },
      {
        id: '7',
        title: 'ศึกษาความพึงพอใจของผู้ใช้งาน',
        team: 'TEAM C',
        status: 'completed',
        rating: 4.6,
      },
      {
        id: '8',
        title: 'การพัฒนาแอปพลิเคชันมือถือ',
        team: 'TEAM D',
        status: 'pending',
        rating: 4.4,
      },
    ];
    setPapers(mockData);
  }, []);

  // Filter papers based on tab and search
  useEffect(() => {
    let filtered = papers;

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter((p) => p.status === 'pending');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((p) => p.status === 'completed');
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPapers(filtered);
  }, [papers, activeTab, searchTerm]);

  const handleEvaluate = (paperId: string) => {
    // Save selected paper id to sessionStorage and navigate to /evaluate
    try {
      sessionStorage.setItem('selectedPaperId', paperId);
    } catch (e) {
      // sessionStorage unavailable — ignore
    }
    router.push('/details');
  }; 

  const renderStars = (rating: number) => {
    return (
      <span className={styles.ratingStars}>
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 !== 0 && '½'}
      </span>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
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

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="ค้นหาวิจัย..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.tabButton + ' ' + styles.active}>
            🔄
          </button>
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'all' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('all')}
          >
            ทั้งหมด
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'pending' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('pending')}
          >
            ยังไม่ได้ประเมิน
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'completed' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('completed')}
          >
            ประเมินแล้ว
          </button>
          <button className={styles.tabButton}>ตัวกรอง</button>
        </div>

        <div className={styles.filterOptions}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            แสดง: {filteredPapers.length} รายการ
          </span>
          <button className={styles.filterOption}>🔒</button>
          <button className={styles.filterOption}>👁️</button>
          <button className={styles.filterOption}>🗑️</button>
          <button className={styles.filterOption}>⋯</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left stats rail */}
        <aside className={styles.leftRail} aria-hidden>
          <div className={styles.statBlock}>
            <div className={styles.statTitle}>ทั้งหมด</div>
            <div className={styles.statValue}>{papers.length}</div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statTitle}>รอประเมิน</div>
            <div className={styles.statValue}>{papers.filter((p) => p.status === 'pending').length}</div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statTitle}>ประเมินแล้ว</div>
            <div className={styles.statValue}>{papers.filter((p) => p.status === 'completed').length}</div>
          </div>
          <div style={{ height: 12 }} />
          <div className={styles.statBlock}>
            <div className={styles.statTitle}>ค้นหา</div>
            <div style={{ marginTop: 8 }}>
              <input
                placeholder="พิมพ์เพื่อกรอง"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: 'none', width: '100%' }}
              />
            </div>
          </div>
        </aside>

        {filteredPapers.length > 0 ? (
          <div className={styles.cardsGrid}>
            {filteredPapers.map((paper) => {
              const progress = paper.status === 'pending' ? Math.min(70, 30 + Number(paper.id) * 7) : 100;
              return (
                <div key={paper.id} className={styles.card}>
                  <div className={styles.cardImage} aria-hidden>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%'}}>
                      <div style={{fontSize:20,fontWeight:800}}>{paper.team}</div>
                      <div style={{fontSize:12,marginTop:6,color:'rgba(230,238,248,0.75)'}}>คะแนน {paper.rating.toFixed(1)}</div>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle} title={paper.title}>{paper.title}</h3>

                    <div className={styles.cardMeta}>
                      <span className={styles.ratingStars}>{renderStars(paper.rating)}</span>
                      <span className={styles.cardTeam}>{paper.team}</span>
                    </div>

                    <div className={styles.cardStatus}>
                      <span
                        className={`${styles.statusBadge} ${
                          paper.status === 'pending' ? styles.pending : styles.completed
                        }`}
                      >
                        <span className={styles.statusSquare} aria-hidden />
                        {paper.status === 'pending' ? 'ยังไม่ได้ประเมิน' : 'ประเมินแล้ว'}
                      </span>
                    </div>

                    <div style={{marginTop:10}}>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                      </div>
                      <div style={{fontSize:12,color:'rgba(15,23,42,0.6)',marginTop:6}}>{progress}% ความคืบหน้า</div>
                    </div>

                    <div className={styles.cardButtons}>
                      <button
                        className={styles.buttonEvaluate}
                        onClick={() => handleEvaluate(paper.id)}
                      >
                        ประเมิน
                      </button>
                      <button
                        className={styles.buttonOutline}
                        onClick={() => router.push(`/details?id=${paper.id}`)}
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
            <p className={styles.emptyStateText}>
              ไม่พบงานวิจัยที่ตรงกับการค้นหา
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
