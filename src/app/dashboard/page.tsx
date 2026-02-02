'use client';

import { useState, useEffect } from 'react';
import styles from '../../styles/modules/Dashboard.module.css';

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

  // Mock data
  useEffect(() => {
    const mockData: ResearchPaper[] = [
      {
        id: '1',
        title: 'GreenPoint - ระบบส่งเสริมกิจกรรมวิจัยเพื่อสาธารณสุข',
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
    alert(`เริ่มประเมินเอกสารที่ ${paperId}`);
    // TODO: Navigate to evaluate page
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
        <button className={styles.createButton}>
          <span>+</span> สร้างประเมิน
        </button>
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
        {filteredPapers.length > 0 ? (
          <div className={styles.cardsGrid}>
            {filteredPapers.map((paper) => (
              <div key={paper.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {paper.image ? (
                    <img src={paper.image} alt={paper.title} />
                  ) : (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      {paper.title.substring(0, 3)}...
                    </div>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{paper.title}</h3>

                  <div className={styles.cardMeta}>
                    <span>{renderStars(paper.rating)}</span>
                    <span className={styles.cardTeam}>{paper.team}</span>
                  </div>

                  <div className={styles.cardStatus}>
                    <span
                      className={`${styles.statusBadge} ${
                        paper.status === 'pending' ? styles.pending : styles.completed
                      }`}
                    >
                      {paper.status === 'pending' ? '● ยังไม่ได้ประเมิน' : '● ประเมินแล้ว'}
                    </span>
                  </div>

                  <div className={styles.cardButtons}>
                    <button
                      className={styles.buttonEvaluate}
                      onClick={() => handleEvaluate(paper.id)}
                    >
                      ประเมินงานวิจัย
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
