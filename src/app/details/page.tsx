'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react'; // เพิ่ม Suspense เข้ามา
import Header from '../../components/Header';
import styles from './details.module.css';

interface Research {
  _id: string;
  title: string;
  authors: string[];
  status: 'pending' | 'completed';
  fileId?: string;
  fileUrl?: string;
  abstract: string;
  objectives: string[];
  keywords: string[];
  advisor: {
    name: string;
    faculty: string;
    department: string;
  };
  projectInfo: {
    type: string;
    category: string;
    year: number;
    semester: string;
    duration: string;
    budget: string;
    publishDate: string;
    lastUpdate: string;
  };
}

// 1. เปลี่ยนชื่อ Component เดิมเป็น Content (เอา logic เดิมทั้งหมดของคุณมาไว้ในนี้)
function ResearchDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const paramsId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const queryId = searchParams?.get('id');
  const researchId = paramsId || queryId;

  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    if (!researchId) {
      setLoading(false);
      return;
    }

    const fetchResearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/papers/${researchId}`);

        if (!res.ok) {
          throw new Error('ไม่พบข้อมูลวิจัย');
        }

        const data = await res.json();

        // Map papers API response to Research interface
        const researchData: Research = {
          _id: data._id,
          title: data.title,
          authors: data.authors || [],
          status: data.status || 'pending',
          fileId: data.fileId,
          fileUrl: data.fileUrl,
          abstract: data.abstract || 'ไม่มีบทคัดย่อ',
          objectives: data.objectives || ['ไม่ได้ระบุวัตถุประสงค์'],
          keywords: data.keywords || [],
          advisor: {
            name: 'อาจารย์ที่ปรึกษา',
            faculty: 'คณะวิทยาศาสตร์',
            department: 'ภาควิชาวิจัย',
          },
          projectInfo: {
            type: 'เอกสารวิจัย',
            category: 'วิจัยทางวิชาการ',
            year: new Date(data.createdAt).getFullYear(),
            semester: '-',
            duration: '-',
            budget: '-',
            publishDate: new Date(data.createdAt).toLocaleDateString('th-TH'),
            lastUpdate: new Date(data.createdAt).toLocaleDateString('th-TH'),
          },
        };

        setResearch(researchData);
      } catch (err: any) {
        console.error('Error fetching research:', err);
        setError(err.message || 'เกิดข้อผิดพลาด');
        setResearch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [researchId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </>
    );
  }

  if (error || !research) {
    return (
      <>
        <Header />
        <div className={styles.errorContainer}>
          <h2>{error || 'ไม่พบข้อมูลวิจัย'}</h2>
          <button onClick={() => router.back()}>ย้อนกลับ</button>
        </div>
      </>
    );
  }

  // use fileUrl directly if available, or fallback to fileId route
  const pdfUrl = research.fileUrl
    ? research.fileUrl
    : research.fileId
    ? `/api/files/${research.fileId}`
    : '';

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.statusBadge}>
                {research.status === 'pending' ? '⏳ รอการประเมิน' : '✓ ประเมินแล้ว'}
              </div>

              <div className={styles.divider} />

              <h4 className={styles.groupTitle}>ผู้เขียน</h4>
              {research.authors && research.authors.length > 0 ? (
                research.authors.map((name, i) => (
                  <div key={i} className={styles.sidebarItem}>
                    👤 {name}
                  </div>
                ))
              ) : (
                <div className={styles.sidebarItem}>ไม่ระบุ</div>
              )}

              <div className={styles.divider} />

              <h4 className={styles.groupTitle}>อาจารย์ที่ปรึกษา</h4>
              <div className={styles.sidebarItem}>
                <strong>{research.advisor.name}</strong>
              </div>
              <div className={styles.sidebarItem}>
                {research.advisor.faculty}
              </div>
              <div className={styles.sidebarItem}>
                {research.advisor.department}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            <div className={styles.header}>
              <button className={styles.backBtn} onClick={() => router.back()}>
                ← ย้อนกลับ
              </button>
            </div>

            <div className={styles.contentCard}>
              {/* Title */}
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{research.title}</h1>
              </div>

              {/* Metadata */}
              <div className={styles.metadataBar}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>👥 ผู้เขียน</span>
                  <span className={styles.metaValue}>{research.authors?.length || 0} คน</span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>📅 วันที่สร้าง</span>
                  <span className={styles.metaValue}>{new Date(research._id).toLocaleDateString('th-TH')}</span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>✓ สถานะ</span>
                  <span className={styles.metaValue} style={{ color: research.status === 'completed' ? '#166534' : '#991b1b' }}>
                    {research.status === 'completed' ? '✓ ประเมินแล้ว' : '⏳ รอการประเมิน'}
                  </span>
                </div>
              </div>

              {/* PDF Section */}
              {pdfUrl && (
                <div className={styles.pdfContainer}>
                  <div className={styles.pdfHeader}>
                    <h3 className={styles.sectionTitle}>📄 เอกสารวิจัย</h3>
                    <div className={styles.pdfActions}>
                      <button
                        className={styles.pdfBtn}
                        onClick={() => setPdfModalOpen(true)}
                        title="เปิดดูเอกสาร"
                      >
                        👁️ ดูเอกสาร
                      </button>
                      <button
                        className={styles.pdfBtn}
                        onClick={() => window.open(pdfUrl, '_blank')}
                        title="เปิดเต็มจอ (แท็บใหม่)"
                      >
                        🔍 เต็มจอ
                      </button>
                      <a
                        href={pdfUrl}
                        download
                        className={styles.pdfBtn}
                        title="ดาวน์โหลด PDF"
                      >
                        ⬇️ ดาวน์โหลด
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Abstract */}
              <section className={styles.abstractSection}>
                <h3 className={styles.sectionTitle}>📝 บทคัดย่อ</h3>
                <p className={styles.abstractText}>{research.abstract}</p>
              </section>

              {/* Objectives */}
              <section className={styles.objectivesSection}>
                <h3 className={styles.sectionTitle}>🎯 วัตถุประสงค์</h3>
                <ul className={styles.objectivesList}>
                  {research.objectives && research.objectives.length > 0 ? (
                    research.objectives.map((objective, i) => (
                      <li key={i}>{objective}</li>
                    ))
                  ) : (
                    <li className={styles.noData}>ไม่ได้ระบุวัตถุประสงค์</li>
                  )}
                </ul>
              </section>

              {/* Keywords */}
              {research.keywords && research.keywords.length > 0 && (
                <section className={styles.keywordsSection}>
                  <h3 className={styles.sectionTitle}>🏷️ คำสำคัญ</h3>
                  <div className={styles.keywords}>
                    {research.keywords.map((keyword, i) => (
                      <span key={i} className={styles.keyword}>{keyword}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* Project Info Grid */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h4>ประเภท</h4>
                  <p>{research.projectInfo.type}</p>
                  <small>{research.projectInfo.category}</small>
                </div>
                <div className={styles.infoCard}>
                  <h4>ปีการศึกษา</h4>
                  <p>{research.projectInfo.year}</p>
                </div>
                <div className={styles.infoCard}>
                  <h4>วันที่สร้าง</h4>
                  <p>{research.projectInfo.publishDate}</p>
                </div>
                <div className={styles.infoCard}>
                  <h4>อัปเดตล่าสุด</h4>
                  <p>{research.projectInfo.lastUpdate}</p>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button onClick={() => router.back()} className={styles.cancelBtn}>
                  ← ยกเลิก
                </button>
                <button onClick={() => router.push('/evaluate')} className={styles.evaluateBtn}>
                  ✓ เริ่มประเมิน
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* PDF Modal */}
      {/* ย้าย Modal ออกมานอก div หลัก หรือไว้ตรงนี้ก็ได้ แต่ต้องมั่นใจว่าครอบด้วย React Fragment หรือ div */}
      <div className={`${styles.pdfModal} ${pdfModalOpen ? styles.open : ''}`} onClick={() => setPdfModalOpen(false)}>
        <div className={styles.pdfModalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.pdfModalHeader}>
            <h2>📄 {research.title}</h2>
            <button
              className={styles.closeBtn}
              onClick={() => setPdfModalOpen(false)}
              title="ปิด"
            >
              ✕
            </button>
          </div>
          <div className={styles.pdfModalBody}>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className={styles.pdfModalIframe}
                title="PDF Viewer"
                allowFullScreen
              />
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                ไม่มีไฟล์เอกสาร
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// 2. สร้าง Wrapper Component เพื่อแก้ปัญหา Build Error (Missing Suspense)
export default function ResearchDetailsPage() {
  return (
    <Suspense fallback={
      // Loading State ระหว่างรอ URL Params
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column',
        gap: '1rem' 
      }}>
        <div className={styles.spinner} style={{width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />
        <p>กำลังโหลดหน้ารายละเอียด...</p>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    }>
      <ResearchDetailsContent />
    </Suspense>
  );
}