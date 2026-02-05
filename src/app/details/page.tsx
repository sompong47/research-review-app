'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './details.module.css';

/* ================== TYPES ================== */
interface Researcher {
  name: string;
  role: string;
  id: string;
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
  id: string;
  title: string;
  team: string;
  status: string;
  pdfUrl: string; // 👉 backend ต้องส่ง path หรือ url PDF มา
  researchers: Researcher[];
  advisor: Advisor;
  projectInfo: ProjectInfo;
  abstract: string;
  objectives: string[];
  keywords: string[];
}

/* ================== PAGE ================== */
export default function ResearchDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params.id;
  const researchId = Array.isArray(rawId) ? rawId[0] : rawId ?? '';

  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================== FETCH REAL DATA ================== */
  useEffect(() => {
    if (!researchId) return;

    const fetchResearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/research/${researchId}`);

        if (!res.ok) {
          throw new Error('ไม่พบข้อมูลงานวิจัย');
        }

        const data: Research = await res.json();
        setResearch(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'เกิดข้อผิดพลาด');
        setResearch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [researchId]);

  /* ================== STATES ================== */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className={styles.errorContainer}>
        <h2>{error ?? 'ไม่พบข้อมูลงานวิจัย'}</h2>
        <button onClick={() => router.back()}>ย้อนกลับ</button>
      </div>
    );
  }

  /* ================== RENDER ================== */
  return (
    <div className={styles.container}>
      <div className={styles.layout}>

        {/* ================== SIDEBAR ================== */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.statusSection}>
              <div className={styles.teamBadge}>{research.team}</div>
              <div className={styles.statusBadge}>{research.status}</div>
            </div>

            <div className={styles.divider} />

            <h4 className={styles.groupTitle}>ทีมผู้วิจัย</h4>
            {research.researchers.map((r, i) => (
              <div key={i} className={styles.researcherItem}>
                {i === 0 ? '👑' : '👤'} {r.name}
                <div className={styles.researcherRole}>
                  {r.role} • {r.id}
                </div>
              </div>
            ))}

            <div className={styles.divider} />

            <p><b>อาจารย์ที่ปรึกษา</b></p>
            <p>{research.advisor.name}</p>
            <p>{research.advisor.faculty}</p>
            <p>{research.advisor.department}</p>
          </div>
        </aside>

        {/* ================== MAIN ================== */}
        <main className={styles.mainContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← ย้อนกลับ
          </button>

          <h1 className={styles.title}>{research.title}</h1>

          {/* PDF */}
          {research.pdfUrl && (
            <div className={styles.pdfSection}>
              <iframe
                src={research.pdfUrl}
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
            <button onClick={() => router.push(`/evaluate/${research.id}`)}>
              เริ่มประเมินงานวิจัย
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
