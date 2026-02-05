import { connectToDatabase } from '../../../lib/db';
import mongoose from 'mongoose';
import Evaluation from '../../../lib/models/Evaluation';
import User from '../../../lib/models/User';
import Paper from '../../../lib/models/Paper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paperId, scores, comments, userEmail } = body;

    if (!paperId || !scores) {
      return new Response(JSON.stringify({ error: 'paperId and scores are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await connectToDatabase();

    // Create evaluation WITHOUT user reference to preserve anonymity
    const evaluation = await Evaluation.create({ paper: new mongoose.Types.ObjectId(paperId), scores, comments });

    // Mark user as having evaluated this paper (but do NOT link the evaluation content)
    if (userEmail) {
      await User.findOneAndUpdate(
        { email: userEmail },
        { $addToSet: { evaluatedPaperIds: new mongoose.Types.ObjectId(paperId) } },
        { upsert: true }
      );
    }

    // Optionally update Paper status to completed if desired
    await Paper.findByIdAndUpdate(paperId, { status: 'completed' }).catch(() => {});

    return new Response(JSON.stringify({ success: true, evaluationId: evaluation._id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export const runtime = 'nodejs';
