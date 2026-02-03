'use client';

import { useState } from 'react';
import styles from '../styles/modules/Evaluation.module.css';
import { useRouter } from 'next/navigation';

interface Props {
  paperId: string;
  title?: string;
}

const EvaluationForm = ({ paperId, title }: Props) => {
  const [relevance, setRelevance] = useState(3);
  const [methodology, setMethodology] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [impact, setImpact] = useState(3);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const overall = Math.round((relevance + methodology + clarity + impact) / 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate save
    await new Promise((res) => setTimeout(res, 700));

    // TODO: call API to persist evaluation
    alert('บันทึกการประเมินเสร็จสิ้น ✅');

    setSubmitting(false);
    router.push('/dashboard');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>ประเมินงานวิจัย{title ? `: ${title}` : ''}</h2>
      <input type="hidden" name="paperId" value={paperId} />

      <label className={styles.field}>
        ความเกี่ยวข้องกับหัวข้อ (Relevance)
        <input
          type="range"
          min={1}
          max={5}
          value={relevance}
          onChange={(e) => setRelevance(Number(e.target.value))}
        />
        <span className={styles.score}>{relevance}</span>
      </label>

      <label className={styles.field}>
        ระเบียบวิธีวิจัย (Methodology)
        <input
          type="range"
          min={1}
          max={5}
          value={methodology}
          onChange={(e) => setMethodology(Number(e.target.value))}
        />
        <span className={styles.score}>{methodology}</span>
      </label>

      <label className={styles.field}>
        ความชัดเจน (Clarity)
        <input
          type="range"
          min={1}
          max={5}
          value={clarity}
          onChange={(e) => setClarity(Number(e.target.value))}
        />
        <span className={styles.score}>{clarity}</span>
      </label>

      <label className={styles.field}>
        ผลกระทบ (Impact)
        <input
          type="range"
          min={1}
          max={5}
          value={impact}
          onChange={(e) => setImpact(Number(e.target.value))}
        />
        <span className={styles.score}>{impact}</span>
      </label>

      <label className={styles.field}>
        ความเห็นเพิ่มเติม
        <textarea
          rows={5}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </label>

      <div className={styles.summary}>
        <div>คะแนนรวมโดยประมาณ: <strong>{overall} / 5</strong></div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={() => router.back()} disabled={submitting}>
          ย้อนกลับ
        </button>
        <button type="submit" className={styles.submitButton} disabled={submitting}>
          {submitting ? 'กำลังบันทึก...' : 'บันทึกการประเมิน'}
        </button>
      </div>
    </form>
  );
};

export default EvaluationForm;
