import { connectToDatabase } from '../../../lib/db';
import mongoose from 'mongoose';
import Evaluation from '../../../lib/models/Evaluation';
import User from '../../../lib/models/User';
import Paper from '../../../lib/models/Paper';

// ส่วน GET เหมือนเดิม ไม่ต้องแก้
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const paperId = url.searchParams.get('paperId');
    const userEmail = url.searchParams.get('userEmail');

    if (!paperId) {
      return new Response(JSON.stringify({ error: 'paperId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectToDatabase();

    let hasEvaluated = false;
    if (userEmail) {
      const user = await User.findOne({ email: userEmail }).lean();
      hasEvaluated = !!(
        user?.evaluatedPaperIds &&
        user.evaluatedPaperIds.some((id: any) => id.toString() === paperId)
      );
    }

    return new Response(JSON.stringify({ hasEvaluated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paperId, scores, comments, userEmail } = body;

    if (!paperId || !scores) {
      return new Response(JSON.stringify({ error: 'paperId and scores are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await connectToDatabase();

    // ส่วนนี้คือ Logic ที่ถูกต้อง: เช็คว่า User คนนี้ เคยประเมินงานนี้หรือยัง
    // ถ้าเคยแล้ว ให้ Error กลับไป (ป้องกันคนเดิมประเมินซ้ำ)
    if (userEmail) {
      const existingUser = await User.findOne({ email: userEmail }).lean();
      if (
        existingUser?.evaluatedPaperIds &&
        existingUser.evaluatedPaperIds.some((id: any) => id.toString() === paperId)
      ) {
        return new Response(
          JSON.stringify({ error: 'คุณได้ประเมินงานวิจัยชิ้นนี้แล้ว' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // สร้าง Evaluation ใหม่ (คนอื่นยังประเมินได้เรื่อยๆ เพราะเราสร้าง record ใหม่เสมอ)
    const evaluation = await Evaluation.create({ paper: new mongoose.Types.ObjectId(paperId), scores, comments });

    // บันทึกว่า User คนนี้ประเมินแล้ว
    if (userEmail) {
      await User.findOneAndUpdate(
        { email: userEmail },
        { $addToSet: { evaluatedPaperIds: new mongoose.Types.ObjectId(paperId) } },
        { upsert: true }
      );
    }

    // --- จุดที่แก้ไข ---
    // ผม Comment บรรทัดนี้ออก เพื่อไม่ให้งานวิจัยถูกปิดสถานะเป็น Completed
    // ทำให้ User คนอื่น ยังสามารถเข้ามาประเมินต่อได้ครับ
    
    // await Paper.findByIdAndUpdate(paperId, { status: 'completed' }).catch(() => {});
    
    // ------------------

    return new Response(JSON.stringify({ success: true, evaluationId: evaluation._id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export const runtime = 'nodejs';