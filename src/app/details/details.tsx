'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './details.module.css';

const pdfUrl = "/research/smart-energy.pdf";

interface Researcher {
  name: string;
  role?: string;
  id?: string;
}

interface Advisor {
  name: string;
  faculty: string;
  department: string;
}

interface ProjectInfo {
  type: string;
  category: string;
  year: number;
  semester: string;
  duration: string;
  budget: string;
  publishDate: string;
  lastUpdate: string;
}

interface Research {
  _id: string;
  title: string;
  authors: string[];
  status: 'pending' | 'completed';
  fileId?: string;
  abstract: string;
  objectives: string[];
  keywords: string[];
  advisor: Advisor;
  projectInfo: ProjectInfo;
}

export default function ResearchDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params.id;
  const researchId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!researchId) return;

    const fetchResearch = async () => {
      try {
        const res = await fetch(`/api/papers/${researchId}`);
        if (!res.ok) throw new Error('Not found');

        const data = await res.json();
        setResearch(data);
      } catch (err) {
        console.error(err);
        setResearch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [researchId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!research) {
    return (
      <div className={styles.errorContainer}>
        <h2>ไม่พบข้อมูลงานวิจัย</h2>
        <button onClick={() => router.back()}>ย้อนกลับ</button>
      </div>
    );
  }

  const pdfUrl = research.fileId
    ? `/api/files/${research.fileId}`
    : '';

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* ---------- SIDEBAR ---------- */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.teamBadge}>
              {research.authors?.[0] || 'ไม่ระบุทีม'}
            </div>

            <div className={styles.statusBadge}>
              {research.status === 'pending'
                ? 'รอการประเมิน'
                : 'ประเมินแล้ว'}
            </div>

            <div className={styles.divider} />

            <h4 className={styles.groupTitle}>ทีมผู้วิจัย</h4>
            {research.authors.map((name, i) => (
              <div key={i} className={styles.researcherItem}>
                👤 {name}
              </div>
            ))}

            <div className={styles.divider} />

            <p><b>อาจารย์ที่ปรึกษา</b></p>
            <p>{research.advisor.name}</p>
            <p>{research.advisor.faculty}</p>
            <p>{research.advisor.department}</p>
          </div>
        </aside>

        {/* ---------- MAIN ---------- */}
        <main className={styles.mainContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← ย้อนกลับ
          </button>

          <h1 className={styles.title}>{research.title}</h1>

          {/* PDF */}
          {pdfUrl && (
            <div className={styles.pdfSection}>
              <iframe
                src={pdfUrl}
                className={styles.pdfIframe}
                title="PDF Viewer"
              />
            </div>
          )}

          {/* Abstract */}
          <section>
            <h3>บทคัดย่อ</h3>
            <p>{research.abstract}</p>
          </section>

          {/* Objectives */}
          <section>
            <h3>วัตถุประสงค์</h3>
            <ul>
              {research.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </section>

          {/* Keywords */}
          <section>
            <h3>คำสำคัญ</h3>
            <div className={styles.keywords}>
              {research.keywords.map((k, i) => (
                <span key={i} className={styles.keyword}>{k}</span>
              ))}
            </div>
          </section>

          <div className={styles.actions}>
            <button onClick={() => router.back()}>ยกเลิก</button>
            <button onClick={() => router.push('/evaluate')}>
              เริ่มประเมิน
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
