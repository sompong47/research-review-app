import { connectToDatabase } from '@/lib/db';
import Paper from '@/lib/models/Paper';

// สำหรับ Next.js 15+ params จะเป็น Promise ต้องกำหนด Type และ await ครับ
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. ดึง ID จาก URL parameters
    const { id } = await params;

    await connectToDatabase();

    // 2. ค้นหางานวิจัยตาม ID
    const paper = await Paper.findById(id);

    if (!paper) {
      return new Response(JSON.stringify({ error: 'Paper not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. ส่งข้อมูลกลับ
    return new Response(JSON.stringify(paper), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const runtime = 'nodejs';