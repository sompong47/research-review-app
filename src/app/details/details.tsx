'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './details.module.css';

interface ResearchPaper {
  id: string;
  title: string;
  team: string;
  status: 'pending' | 'completed';
  rating: number;
  image?: string;
  authors: string[];
  abstractText: string;
  keywords: string[];
  publicationDate: string;
  department: string;
  category: string;
  methodology: string;
  findings: string;
  documents: {
    name: string;
    url: string;
    size: string;
  }[];
  evaluations: {
    reviewer: string;
    date: string;
    score: number;
    comment: string;
  }[];
}

const DetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get('id') || '1';

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Mock data
  const mockPaperData: Record<string, ResearchPaper> = {
    '1': {
      id: '1',
      title: 'GreenPoint - ระบบส่งเสริมกิจกรรมวิจัยเพื่อสาธารณสุข',
      team: 'TEAM 8',
      status: 'pending',
      rating: 4.5,
      authors: ['นายสมชาย ใจดี', 'นางสาวณัฐธิดา สมบูรณ์', 'ดร. ประเสริฐ พัฒนา'],
      abstractText:
        'งานวิจัยนี้นำเสนอระบบ GreenPoint ซึ่งเป็นแพลตฟอร์มดิจิทัลที่ออกแบบมาเพื่อส่งเสริมและสนับสนุนกิจกรรมวิจัยต่างๆ ที่มีเป้าหมายเพื่อสาธารณสุขและการพัฒนาสังคม ระบบนี้จะช่วยให้นักวิจัยสามารถทำงานเป็นทีมได้อย่างมีประสิทธิภาพ โดยใช้เทคโนโลยีคลาวด์และการวิเคราะห์ข้อมูลแบบเรียลไทม์',
      keywords: ['GreenPoint', 'สาธารณสุข', 'ระบบวิจัย', 'การพัฒนาชุมชน', 'เทคโนโลยี'],
      publicationDate: '2025-10-15',
      department: 'วิทยาลัยการบริหารธุรกิจ',
      category: 'วิจัยประยุกต์',
      methodology: 'การวิจัยแบบผสมผสาน (Mixed Methods Research) - รวมการศึกษาเชิงคุณภาพและเชิงปริมาณ',
      findings:
        'ผลการวิจัยแสดงให้เห็นว่า GreenPoint สามารถเพิ่มประสิทธิภาพการทำงานของทีมวิจัยขึ้น 65% และลดเวลาการสื่อสารลง 40% นอกจากนี้ยังพบว่าผู้ใช้มีความพึงพอใจต่อระบบอยู่ในระดับสูง (4.7/5.0)',
      documents: [
        { name: '論文全文 (PDF)', url: '#', size: '2.4 MB' },
        { name: 'プレゼンテーション資料', url: '#', size: '1.8 MB' },
        { name: 'データセット', url: '#', size: '850 KB' },
        { name: 'グラフ・チャート集', url: '#', size: '560 KB' },
      ],
      evaluations: [
        {
          reviewer: 'ศ.ดร. สุทัศน์ มหาจักร',
          date: '2025-11-20',
          score: 4.6,
          comment: 'งานวิจัยมีการออกแบบที่เป็นระบบและการทำให้เป็นจริง (Implementation) ที่ประสบความสำเร็จ',
        },
        {
          reviewer: 'ดร. สมหญิง รักษ์ศรี',
          date: '2025-11-18',
          score: 4.4,
          comment: 'แนวคิดสร้างสรรค์และมีการประยุกต์ใช้เทคโนโลยีที่เหมาะสม',
        },
      ],
    },
  };

  useEffect(() => {
    const paperData = mockPaperData[paperId] || mockPaperData['1'];
    setPaper(paperData);
  }, [paperId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleStartEvaluation = () => {
    if (paper?.id) {
      try {
        sessionStorage.setItem('selectedPaperId', paper.id);
      } catch (e) {
        // ignore
      }
      router.push('/evaluate');
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    return (
      <div className={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`${styles.star} ${
              i < fullStars ? styles.filled : i === fullStars && hasHalf ? styles.half : ''
            }`}
          >
            ★
          </span>
        ))}
        <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!paper) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Background */}
      <div className={styles.headerBackground}></div>

      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <button className={styles.backBtn} onClick={handleGoBack} title="กลับไป">
          ← กลับ
        </button>
        <div className={styles.navTitle}>รายละเอียดงานวิจัย</div>
        <div className={styles.navSpacer}></div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Paper Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.badges}>
              <span className={styles.teamBadge}>{paper.team}</span>
              <span className={styles.categoryBadge}>{paper.category}</span>
              <span
                className={`${styles.statusBadge} ${
                  paper.status === 'pending' ? styles.statusPending : styles.statusCompleted
                }`}
              >
                {paper.status === 'pending' ? '⏳ รอการประเมิน' : '✅ ประเมินเรียบร้อย'}
              </span>
            </div>

            <h1 className={styles.title}>{paper.title}</h1>

            <div className={styles.metaInfo}>
              <div className={styles.authors}>
                <span className={styles.metaLabel}>👥 ผู้แต่ง:</span>
                <span className={styles.metaValue}>{paper.authors.join(', ')}</span>
              </div>
              <div className={styles.department}>
                <span className={styles.metaLabel}>🏫 หน่วยงาน:</span>
                <span className={styles.metaValue}>{paper.department}</span>
              </div>
              <div className={styles.publicationDate}>
                <span className={styles.metaLabel}>📅 วันที่เผยแพร่:</span>
                <span className={styles.metaValue}>
                  {new Date(paper.publicationDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className={styles.ratingSection}>
              {renderStars(paper.rating)}
              <button className={styles.primaryBtn} onClick={handleStartEvaluation}>
                เริ่มประเมินงานวิจัย
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 ภาพรวม
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'methodology' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('methodology')}
          >
            🔬 วิธีการวิจัย
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'findings' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            📊 ผลการวิจัย
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            📁 เอกสาร
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'evaluations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('evaluations')}
          >
            ⭐ การประเมิน
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={styles.tabPane}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>📖 บทคัดย่อ</h2>
                <p className={styles.sectionText}>{paper.abstractText}</p>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🏷️ คำสำคัญ (Keywords)</h2>
                <div className={styles.keywordsList}>
                  {paper.keywords.map((keyword, idx) => (
                    <span key={idx} className={styles.keyword}>
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>📌 ข้อมูลทั่วไป</h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>ประเภทวิจัย</span>
                    <span className={styles.infoValue}>{paper.category}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>หน่วยงาน</span>
                    <span className={styles.infoValue}>{paper.department}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>สถานะ</span>
                    <span className={`${styles.infoValue} ${styles.statusValue}`}>
                      {paper.status === 'pending' ? 'รอประเมิน' : 'ประเมินเรียบร้อย'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>คะแนนเฉลี่ย</span>
                    <span className={styles.infoValue}>{paper.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Methodology Tab */}
          {activeTab === 'methodology' && (
            <div className={styles.tabPane}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🔬 วิธีการวิจัย</h2>
                <div className={styles.methodologyBox}>
                  <p>{paper.methodology}</p>
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🎯 ขั้นตอนการดำเนินการ</h2>
                <div className={styles.timelineContainer}>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineMarker}>1</div>
                    <div className={styles.timelineContent}>
                      <h3>การเตรียมการ</h3>
                      <p>ศึกษาวรรณกรรมและทำการวางแผนโครงการวิจัย</p>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineMarker}>2</div>
                    <div className={styles.timelineContent}>
                      <h3>การเก็บรวบรวมข้อมูล</h3>
                      <p>ดำเนินการเก็บข้อมูลจากแหล่งต่างๆ ตามรูปแบบที่กำหนด</p>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineMarker}>3</div>
                    <div className={styles.timelineContent}>
                      <h3>การวิเคราะห์ข้อมูล</h3>
                      <p>วิเคราะห์ข้อมูลโดยใช้เครื่องมือและวิธีการทางสถิติที่เหมาะสม</p>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineMarker}>4</div>
                    <div className={styles.timelineContent}>
                      <h3>สรุปผลการวิจัย</h3>
                      <p>เขียนรายงานผลการวิจัยและจัดทำเอกสารอย่างเป็นทางการ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Findings Tab */}
          {activeTab === 'findings' && (
            <div className={styles.tabPane}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>📊 ผลการวิจัย</h2>
                <div className={styles.findingsBox}>
                  <p>{paper.findings}</p>
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>💡 ข้อเสนอแนะ</h2>
                <div className={styles.recommendationsList}>
                  <div className={styles.recommendationItem}>
                    <span className={styles.recommendationIcon}>✓</span>
                    <div>
                      <h4>เสริมสร้างความมั่นคง</h4>
                      <p>ทำการพัฒนาระบบเพิ่มเติมเพื่อให้มั่นใจในความปลอดภัยของข้อมูล</p>
                    </div>
                  </div>
                  <div className={styles.recommendationItem}>
                    <span className={styles.recommendationIcon}>✓</span>
                    <div>
                      <h4>ขยายขอบเขตการศึกษา</h4>
                      <p>สามารถนำวิธีการนี้ไปใช้กับกลุ่มเป้าหมายอื่นๆ และสถาบันอื่นๆ</p>
                    </div>
                  </div>
                  <div className={styles.recommendationItem}>
                    <span className={styles.recommendationIcon}>✓</span>
                    <div>
                      <h4>การติดตามอย่างต่อเนื่อง</h4>
                      <p>ติดตามผลการใช้ระบบในระยะยาวเพื่อประเมินความยั่งยืน</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className={styles.tabPane}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>📁 เอกสารและไฟล์</h2>
                <div className={styles.documentsList}>
                  {paper.documents.map((doc, idx) => (
                    <div key={idx} className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4 className={styles.documentName}>{doc.name}</h4>
                        <p className={styles.documentSize}>{doc.size}</p>
                      </div>
                      <a href={doc.url} className={styles.downloadBtn} title="ดาวน์โหลด">
                        ↓
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <div className={styles.tabPane}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>⭐ การประเมินจากผู้เชี่ยวชาญ</h2>
                <div className={styles.evaluationsList}>
                  {paper.evaluations.length > 0 ? (
                    paper.evaluations.map((evaluation, idx) => (
                      <div key={idx} className={styles.evaluationItem}>
                        <div className={styles.evaluationHeader}>
                          <div>
                            <h4 className={styles.reviewerName}>{evaluation.reviewer}</h4>
                            <p className={styles.reviewDate}>
                              {new Date(evaluation.date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className={styles.evaluationScore}>
                            <span className={styles.scoreValue}>{evaluation.score.toFixed(1)}</span>
                            <span className={styles.scoreMax}>/5.0</span>
                          </div>
                        </div>
                        <div className={styles.evaluationStars}>
                          {renderStars(evaluation.score)}
                        </div>
                        <p className={styles.evaluationComment}>{evaluation.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noEvaluations}>
                      <p>ยังไม่มีการประเมิน</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <button className={styles.primaryBtn} onClick={handleStartEvaluation}>
                  + เพิ่มการประเมินใหม่
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className={styles.actionFooter}>
          <button className={styles.secondaryBtn} onClick={handleGoBack}>
            ← กลับไปแดชบอร์ด
          </button>
          <button className={styles.primaryBtn} onClick={handleStartEvaluation}>
            ⭐ เริ่มประเมิน →
          </button>
        </div>
      </main>
    </div>
  );
};

export default DetailsPage;
