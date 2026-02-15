import { connectToDatabase } from '../../../lib/db';
import Paper from '../../../lib/models/Paper';
import Evaluation from '../../../lib/models/Evaluation';

export async function GET() {
  await connectToDatabase();

  const totalPapers = await Paper.countDocuments();
  const pending = await Paper.countDocuments({ status: 'pending' });
  const completed = await Paper.countDocuments({ status: 'completed' });

  const totalEvaluations = await Evaluation.countDocuments();

  // Basic per-paper counts and average scores (aggregation)
  const perPaper = await Evaluation.aggregate([
    { $group: { _id: '$paper', count: { $sum: 1 }, avgOriginality: { $avg: '$scores.originality' }, avgOverall: { $avg: '$scores.overall' } } },
  ]).limit(50);

  return new Response(
    JSON.stringify({ totalPapers, pending, completed, totalEvaluations, perPaper }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export const runtime = 'nodejs';
