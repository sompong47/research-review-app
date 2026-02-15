'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // 1. เพิ่ม import นี้

// 2. เปลี่ยนชื่อ Component เดิม (เช่นเติมคำว่า Content ต่อท้าย)
function DetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // ... โค้ดเดิมของคุณทั้งหมด ...
  
  return (
    // ... JSX เดิมของคุณ ...
    <div>เนื้อหาเดิม...</div>
  );
}

// 3. สร้าง Component หลักใหม่ เพื่อห่อด้วย Suspense
export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailsContent />
    </Suspense>
  );
}