'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './evaluate.module.css';

const EvaluatePage = () => {
  // เกณฑ์การประเมิน 5 หมวดหลัก
  const [reliability, setReliability] = useState('5');
  const [structure, setStructure] = useState('5');
  const [literature, setLiterature] = useState('5');
  const [methodology, setMethodology] = useState('5');
  const [discussion, setDiscussion] = useState('5');
  
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState<'draft' | 'saved'>('draft');
  const [paperId, setPaperId] = useState<string | null>(null);
  const [paperDetails, setPaperDetails] = useState<any | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const router = useRouter();

  const [toast, setToast] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const id = sessionStorage.getItem('selectedPaperId');
      if (id) {
        setPaperId(id);
        sessionStorage.removeItem('selectedPaperId');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const load = async () => {
      if (!paperId) return;
      try {
        const res = await fetch('/api/papers');
        if (!res.ok) return;
        const list = await res.json();
        const found = (list || []).find((p: any) => p._id === paperId || p.id === paperId);
        if (found) setPaperDetails(found);
      } catch (err) {
        console.error('Failed to load paper details', err);
      }
    };
    load();
  }, [paperId]);

  const totalScore = 
    Number(reliability) + 
    Number(structure) + 
    Number(literature) + 
    Number(methodology) + 
    Number(discussion);
  const maxScore = 25;
  const average = (totalScore / 5).toFixed(2);
  
  // คำนวณระดับคุณภาพตามเกณฑ์
  const getQualityLevel = (avg: number) => {
    if (avg >= 4.50) return { label: 'ดีมาก', color: '#16a34a' };
    if (avg >= 3.50) return { label: 'ดี', color: '#3b82f6' };
    if (avg >= 2.50) return { label: 'พอใช้', color: '#f59e0b' };
    if (avg >= 1.50) return { label: 'ควรปรับปรุง', color: '#ef4444' };
    return { label: 'ปรับปรุงมาก', color: '#991b1b' };
  };

  const qualityLevel = getQualityLevel(Number(average));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        // map local criteria to evaluation model
        const scores = {
          originality: Number(literature),
          methodology: Number(methodology),
          clarity: Number(structure),
          significance: Number(discussion),
          overall: Number(((Number(reliability) + Number(structure) + Number(literature) + Number(methodology) + Number(discussion)) / 5).toFixed(2)),
        };

        const payload = {
          paperId: paperId,
          scores,
          comments,
          userEmail: userEmail || undefined,
        };

        const res = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || 'Failed to submit evaluation');
        }

        setStatus('saved');
        const now = new Date().toLocaleString();
        setSavedAt(now);
        setToast('บันทึกผลการประเมินเรียบร้อย ✅');
      } catch (err: any) {
        console.error(err);
        setToast('เกิดข้อผิดพลาดในการส่ง: ' + (err.message || String(err)));
      }
    })();
  }; 

  const evaluationCriteria = [
    {
      id: 'reliability',
      label: 'ความน่าเชื่อถือ',
      subtitle: 'Reliability & Validity',
      description: 'วัดสิ่งที่ต้องการศึกษาจริง เครื่องมือมีความแม่นยำ และสามารถทำซ้ำได้',
      value: reliability,
      setValue: setReliability,
      icon: (
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      )
    },
    {
      id: 'structure',
      label: 'โครงสร้างวิจัย',
      subtitle: 'Research Structure',
      description: 'ชื่อเรื่องชัดเจน วัตถุประสงค์สอดคล้องกับปัญหา และขอบเขตการวิจัยชัดเจน',
      value: structure,
      setValue: setStructure,
      icon: (
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      )
    },
    {
      id: 'literature',
      label: 'การทบทวนวรรณกรรม',
      subtitle: 'Literature Review',
      description: 'เนื้อหาทันสมัย ครอบคลุม อ้างอิงแหล่งที่มาน่าเชื่อถือ และตรงกับเรื่องที่ศึกษา',
      value: literature,
      setValue: setLiterature,
      icon: (
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      )
    },
    {
      id: 'methodology',
      label: 'วิธีดำเนินการวิจัย',
      subtitle: 'Research Methodology',
      description: 'ประชากร กลุ่มตัวอย่าง และการสุ่มตัวอย่างถูกต้องเหมาะสมกับการวิจัย',
      value: methodology,
      setValue: setMethodology,
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      )
    },
    {
      id: 'discussion',
      label: 'การอภิปรายผลและข้อเสนอแนะ',
      subtitle: 'Discussion & Recommendations',
      description: 'สรุปผลจากข้อมูลจริง มีอคติน้อยที่สุด และข้อเสนอแนะนำไปใช้ได้จริง',
      value: discussion,
      setValue: setDiscussion,
      icon: (
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {toast && <div className={styles.toast}>{toast}</div>}
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h1 className={styles.title}>แบบประเมินคุณภาพงานวิจัย</h1>
            <p className={styles.subtitle}>Research Quality Evaluation Form</p>
            {paperDetails ? (
              <div className={styles.paperIdBadge}>
                <strong style={{ fontWeight: 700 }}>{paperDetails.title}</strong>
                <span style={{ marginLeft: 8, color: '#6b7280' }}>{paperDetails.team}</span>
              </div>
            ) : paperId ? (
              <div className={styles.paperIdBadge}>
                <span>เอกสาร ID:</span>
                <strong>{paperId}</strong>
              </div>
            ) : null}
          </div>
          {status === 'saved' && savedAt && (
            <div className={styles.statusSaved} style={{ alignSelf: 'center' }}>
              บันทึกเมื่อ {savedAt}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Paper Info Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>ข้อมูลงานวิจัย</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ชื่อเรื่อง</span>
                <span className={styles.infoValue}>{paperDetails?.title || 'ไม่ระบุ'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ผู้วิจัย</span>
                <span className={styles.infoValue}>{(paperDetails?.authors || []).join(', ') || 'ไม่ระบุ'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>บทคัดย่อ</span>
                <span className={styles.infoValue} style={{ whiteSpace: 'pre-wrap' }}>{paperDetails?.abstract ? (paperDetails.abstract.length > 240 ? paperDetails.abstract.slice(0, 240) + '...' : paperDetails.abstract) : 'ไม่มีบทคัดย่อ'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ไฟล์</span>
                <span className={styles.infoValue}>{paperDetails?.fileUrl ? <a href={paperDetails.fileUrl} target="_blank" rel="noreferrer">ดาวน์โหลด/ดู</a> : 'ไม่พบไฟล์'}</span>
              </div>
            </div>
          </div>

          {/* Evaluation Form Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>องค์ประกอบการประเมิน</h2>
              <div className={status === 'saved' ? styles.statusSaved : styles.statusDraft}>
                <span className={styles.statusDot}></span>
                {status === 'saved' ? 'บันทึกแล้ว' : 'ร่าง'}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.criteriaInfo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div>
                  <p><strong>การประเมินเชิงปริมาณ:</strong> ให้คะแนน 1-5 ในแต่ละองค์ประกอบ</p>
                  <p className={styles.criteriaSubInfo}>คะแนนเฉลี่ย: ดีมาก (4.50-5.00) | ดี (3.50-4.49) | พอใช้ (2.50-3.49)</p>
                </div>
              </div>

              {evaluationCriteria.map((criteria, index) => (
                <div key={criteria.id} className={styles.formGroup}>
                  <label className={styles.label}>
                    <div className={styles.labelContent}>
                      <div className={styles.criteriaIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {criteria.icon}
                        </svg>
                      </div>
                      <div className={styles.criteriaTextWrapper}>
                        <div className={styles.criteriaTitleRow}>
                          <span className={styles.criteriaNumber}>{index + 1}.</span>
                          <span className={styles.criteriaTitle}>{criteria.label}</span>
                        </div>
                        <span className={styles.criteriaSubtitle}>{criteria.subtitle}</span>
                        <span className={styles.criteriaDesc}>{criteria.description}</span>
                      </div>
                    </div>
                    <span className={styles.scoreIndicator}>{criteria.value}/5</span>
                  </label>
                  <div className={styles.ratingGroup} role="radiogroup" aria-label={criteria.label}>
                    {[5,4,3,2,1].map((v) => (
                      <label
                        key={v}
                        className={`${styles.ratingOption} ${criteria.value === String(v) ? styles.selected : ''}`}
                      >
                        <input
                          type="radio"
                          name={`criteria-${criteria.id}`}
                          value={String(v)}
                          checked={criteria.value === String(v)}
                          onChange={(e) => criteria.setValue(e.target.value)}
                        />
                        <span className={styles.ratingMark} aria-hidden>
                          {criteria.value === String(v) ? '✔' : '✖'}
                        </span>
                        <span className={styles.ratingValue}>{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className={styles.divider}></div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <div className={styles.labelContent}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    <span>ข้อเสนอแนะเชิงคุณภาพ</span>
                  </div>
                </label>
                <input
                  type="email"
                  placeholder="อีเมล (ไม่บังคับ — ใช้เพื่อติดตามการประเมินเท่านั้น)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', marginBottom: 8 }}
                />
                <textarea
                  rows={6}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="กรุณาระบุข้อเสนอแนะเชิงคุณภาพ เช่น ความถูกต้องทางวิชาการ ผลกระทบของการนำไปใช้ จุดเด่น จุดที่ควรปรับปรุง หรือความคิดเห็นเพิ่มเติม..."
                  className={styles.textarea}
                />
              </div>

              {/* Score Summary */}
              <div className={styles.scoreSummary}>
                <div className={styles.scoreHeader}>
                  <div>
                    <div className={styles.scoreLabel}>คะแนนเฉลี่ย (Average Score)</div>
                    <div className={styles.scoreLarge}>
                      {average}<span className={styles.scoreMax}>/5.00</span>
                    </div>
                  </div>
                  <div className={styles.qualityBadge} style={{ background: qualityLevel.color }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    {qualityLevel.label}
                  </div>
                </div>
                <div className={styles.scoreProgress}>
                  <div 
                    className={styles.scoreProgressBar}
                    style={{ 
                      width: `${(Number(average) / 5) * 100}%`,
                      background: qualityLevel.color 
                    }}
                  ></div>
                </div>
                <div className={styles.scoreBreakdown}>
                  <div className={styles.scoreBreakdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    <div>
                      <span>คะแนนรวม</span>
                      <strong>{totalScore}/{maxScore}</strong>
                    </div>
                  </div>
                  <div className={styles.scoreBreakdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <span>จำนวนองค์ประกอบ</span>
                      <strong>5 หมวด</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => router.back()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  ย้อนกลับ
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                  </svg>
                  บันทึกผลการประเมิน
                </button>
              </div>
            </form>
          </div>

          {/* Evaluation Guide Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>เกณฑ์การประเมินคุณภาพ</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.guideGrid}>
                <div className={styles.guideItem} style={{ borderLeft: `4px solid #16a34a` }}>
                  <div className={styles.guideScore} style={{ background: '#16a34a' }}>
                    4.50-5.00
                  </div>
                  <div className={styles.guideText}>
                    <strong>ดีมาก (Excellent)</strong>
                    <p>งานวิจัยมีคุณภาพสูงมาก ผ่านเกณฑ์มาตรฐานทุกด้าน และมีนวัตกรรม</p>
                  </div>
                </div>
                <div className={styles.guideItem} style={{ borderLeft: `4px solid #3b82f6` }}>
                  <div className={styles.guideScore} style={{ background: '#3b82f6' }}>
                    3.50-4.49
                  </div>
                  <div className={styles.guideText}>
                    <strong>ดี (Good)</strong>
                    <p>งานวิจัยมีคุณภาพดี ผ่านเกณฑ์มาตรฐาน สามารถนำไปใช้ได้</p>
                  </div>
                </div>
                <div className={styles.guideItem} style={{ borderLeft: `4px solid #f59e0b` }}>
                  <div className={styles.guideScore} style={{ background: '#f59e0b' }}>
                    2.50-3.49
                  </div>
                  <div className={styles.guideText}>
                    <strong>พอใช้ (Fair)</strong>
                    <p>งานวิจัยผ่านเกณฑ์ขั้นต่ำ แต่ควรปรับปรุงในบางส่วน</p>
                  </div>
                </div>
                <div className={styles.guideItem} style={{ borderLeft: `4px solid #ef4444` }}>
                  <div className={styles.guideScore} style={{ background: '#ef4444' }}>
                    1.50-2.49
                  </div>
                  <div className={styles.guideText}>
                    <strong>ควรปรับปรุง (Needs Improvement)</strong>
                    <p>งานวิจัยต่ำกว่าเกณฑ์ ต้องปรับปรุงหลายส่วนก่อนนำไปใช้</p>
                  </div>
                </div>
                <div className={styles.guideItem} style={{ borderLeft: `4px solid #991b1b` }}>
                  <div className={styles.guideScore} style={{ background: '#991b1b' }}>
                    1.00-1.49
                  </div>
                  <div className={styles.guideText}>
                    <strong>ปรับปรุงมาก (Major Revision)</strong>
                    <p>งานวิจัยต้องปรับปรุงอย่างมากในทุกองค์ประกอบ</p>
                  </div>
                </div>
              </div>

              <div className={styles.noteBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>หมายเหตุ:</strong>
                  <p>การประเมินนี้ใช้เกณฑ์มาตรฐานทางวิชาการ (Scientific Content) ควบคู่กับการพิจารณาผลกระทบของการนำไปใช้ (Impact) และสามารถใช้เครื่องมือเฉพาะทาง เช่น Cochrane หรือ AMSTAR สำหรับงานวิจัยประเภทต่างๆ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© 2026 Research Quality Evaluation System</p>
        </footer>
      </div>
    </div>
  );
};

export default EvaluatePage;