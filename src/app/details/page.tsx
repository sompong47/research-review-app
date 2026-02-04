'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './details.module.css';

export default function ResearchDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // แปลง params.id ให้เป็นสตริงเดียวเสมอ
  const rawId = params.id;
  const researchId = Array.isArray(rawId) ? rawId[0] : rawId ?? '';

  // กำหนด TypeScript interfaces เพื่อให้การใช้งานข้อมูลชัดเจนและหลีกเลี่ยงข้อผิดพลาด
  interface Researcher { name: string; role: string; id: string; }
  interface Advisor { name: string; faculty: string; department: string; }
  interface ProjectInfo { type: string; category: string; year: number; semester: string; duration: string; budget: string; publishDate: string; lastUpdate: string; }
  interface Research { id: string; title: string; team: string; status: string; pdfUrl: string; researchers: Researcher[]; advisor: Advisor; projectInfo: ProjectInfo; abstract: string; objectives: string[]; keywords: string[]; }

  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: เรียก API จริงเพื่อดึงข้อมูลงานวิจัย
    // const fetchResearch = async () => {
    //   const response = await fetch(`/api/research/${researchId}`);
    //   const data = await response.json();
    //   setResearch(data);
    //   setLoading(false);
    // };
    // fetchResearch();

    // ข้อมูลปลอมสำหรับทดสอบ (จะถูกแทนที่ด้วย API จริง)
    setTimeout(() => {
  setResearch({
    id: researchId,
    title: 'ระบบติดตามและประเมินการใช้พลังงานไฟฟ้าอัจฉริยะในอาคารเรียน',
    team: 'SMART ENERGY TEAM',
    status: 'รอการประเมิน',

    // URL ของ PDF งานวิจัย
    pdfUrl: '/research/smart-energy.pdf',

    researchers: [
      { name: 'นายธนกฤต ศรีสมบัติ', role: 'หัวหน้าทีม', id: '64310001' },
      { name: 'นางสาวปวีณา อินทร์แก้ว', role: 'สมาชิก', id: '64310018' },
      { name: 'นายณัฐพงศ์ แสงทอง', role: 'สมาชิก', id: '64310029' }
    ],

    advisor: {
      name: 'รศ.ดร.วิชัย พูนผล',
      faculty: 'คณะเทคโนโลยีสารสนเทศ',
      department: 'ภาควิชาวิศวกรรมซอฟต์แวร์'
    },

    projectInfo: {
      type: 'งานวิจัยเชิงประยุกต์',
      category: 'พลังงานและสิ่งแวดล้อม',
      year: 2024,
      semester: '1/2567',
      duration: '10 เดือน',
      budget: '250,000 บาท',
      publishDate: '10 พฤศจิกายน 2566',
      lastUpdate: '5 กุมภาพันธ์ 2567'
    },

    abstract: `
การใช้พลังงานไฟฟ้าในอาคารเรียนของสถาบันการศึกษามีแนวโน้มเพิ่มสูงขึ้นอย่างต่อเนื่อง
ส่งผลให้เกิดค่าใช้จ่ายด้านพลังงานและปัญหาด้านสิ่งแวดล้อม งานวิจัยนี้มีวัตถุประสงค์เพื่อ
พัฒนาระบบติดตามและประเมินการใช้พลังงานไฟฟ้าอัจฉริยะ โดยอาศัยเทคโนโลยี IoT
ร่วมกับเว็บแอปพลิเคชัน เพื่อแสดงผลการใช้พลังงานแบบเรียลไทม์
ช่วยให้ผู้ดูแลอาคารสามารถวิเคราะห์และวางแผนการใช้พลังงานได้อย่างมีประสิทธิภาพ
    `,

    objectives: [
      'เพื่อพัฒนาระบบติดตามการใช้พลังงานไฟฟ้าแบบเรียลไทม์',
      'เพื่อแสดงผลข้อมูลการใช้พลังงานในรูปแบบแดชบอร์ดที่เข้าใจง่าย',
      'เพื่อช่วยลดการใช้พลังงานไฟฟ้าในอาคารเรียน',
      'เพื่อสนับสนุนการตัดสินใจด้านการบริหารจัดการพลังงาน'
    ],

    keywords: [
      'พลังงานไฟฟ้า',
      'IoT',
      'Smart Building',
      'Energy Monitoring',
      'Web Application',
      'สิ่งแวดล้อม'
    ]
  });

  setLoading(false);
}, 500);
  }, [researchId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!research) {
    return (
      <div className={styles.errorContainer}>
        <h2>ไม่พบข้อมูลงานวิจัย</h2>
        <button onClick={() => router.back()}>กลับหน้าหลัก</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Sidebar ด้านซ้าย */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.statusSection}>
              <div className={styles.teamBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{research.team}</span>
              </div>
              <div className={styles.statusBadge}>{research.status}</div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.sidebarGroup}>
              <h4 className={styles.groupTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                ทีมผู้วิจัย
              </h4>
              {research.researchers.map((researcher, index) => (
                <div key={index} className={styles.researcherItem}>
                  <div className={styles.researcherIcon}>
                    {index === 0 ? '👑' : '👤'}
                  </div>
                  <div>
                    <p className={styles.researcherName}>{researcher.name}</p>
                    <span className={styles.researcherRole}>{researcher.role} • {researcher.id}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.divider}></div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>อาจารย์ที่ปรึกษา</span>
                <p className={styles.sidebarValue}>{research.advisor.name}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>คณะ</span>
                <p className={styles.sidebarValue}>{research.advisor.faculty}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>ภาควิชา</span>
                <p className={styles.sidebarValue}>{research.advisor.department}</p>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>ประเภทงานวิจัย</span>
                <p className={styles.sidebarValue}>{research.projectInfo.type}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>หมวดหมู่</span>
                <p className={styles.sidebarValue}>{research.projectInfo.category}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>ปีการศึกษา / ภาคเรียน</span>
                <p className={styles.sidebarValue}>{research.projectInfo.year} / {research.projectInfo.semester}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>ระยะเวลาดำเนินการ</span>
                <p className={styles.sidebarValue}>{research.projectInfo.duration}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>งบประมาณ</span>
                <p className={styles.sidebarValue}>{research.projectInfo.budget}</p>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>วันที่เผยแพร่</span>
                <p className={styles.sidebarValue}>{research.projectInfo.publishDate}</p>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <span className={styles.sidebarLabel}>อัปเดตล่าสุด</span>
                <p className={styles.sidebarValue}>{research.projectInfo.lastUpdate}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* เนื้อหาหลักด้านขวา */}
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => router.back()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>ย้อนกลับ</span>
            </button>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.titleSection}>
              <div className={styles.iconWrapper}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h1 className={styles.title}>{research.title}</h1>
            </div>

            {/* PDF Viewer */}
            <div className={styles.pdfSection}>
              <div className={styles.pdfHeader}>
                <h3 className={styles.sectionTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  เอกสารงานวิจัย (PDF)
                </h3>
                <div className={styles.pdfControls}>
                  <a 
                    href={research.pdfUrl} 
                    download 
                    className={styles.downloadBtn}
                    title="ดาวน์โหลด PDF"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    ดาวน์โหลด
                  </a>
                  <a 
                    href={research.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.openBtn}
                    title="เปิดในแท็บใหม่"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    เปิดแท็บใหม่
                  </a>
                </div>
              </div>
              
              <div className={styles.pdfViewer}>
                {/* วิธีที่ 1: ใช้ iframe (ง่ายที่สุด แต่อาจมีปัญหากับบางเบราว์เซอร์) */}
                <iframe
                  src={research.pdfUrl}
                  className={styles.pdfIframe}
                  title="PDF Viewer"
                />
                
                {/* หมายเหตุ: ถ้าต้องการ PDF viewer ที่ดีกว่า ให้ใช้ react-pdf */}
                {/* 
                  npm install react-pdf
                  
                  import { Document, Page, pdfjs } from 'react-pdf';
                  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
                  
                  <Document file={research.pdfUrl}>
                    <Page pageNumber={1} />
                  </Document>
                */}
              </div>
            </div>

            {/* บทคัดย่อ */}
            <div className={styles.abstractSection}>
              <h3 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                บทคัดย่อ
              </h3>
              <p className={styles.abstractText}>{research.abstract}</p>
            </div>

            {/* วัตถุประสงค์ */}
            <div className={styles.objectivesSection}>
              <h3 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                วัตถุประสงค์ของงานวิจัย
              </h3>
              <ul className={styles.objectivesList}>
                {research.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            {/* คำสำคัญ */}
            <div className={styles.keywordsSection}>
              <h3 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                คำสำคัญ
              </h3>
              <div className={styles.keywords}>
                {research.keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* ปุ่มดำเนินการ */}
            <div className={styles.actions}>
              <button className={styles.secondaryBtn} onClick={() => router.back()}>
                ยกเลิก
              </button>
              <button className={styles.evaluateBtn} onClick={() => router.push(`/evaluate/`)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11" />
                </svg>
                <span>เริ่มประเมินงานวิจัย</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}