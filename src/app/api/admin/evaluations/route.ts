import { connectToDatabase } from '../../../../lib/db';
import Evaluation from '../../../../lib/models/Evaluation';
import Paper from '../../../../lib/models/Paper';
import User from '../../../../lib/models/User';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paperId');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, score
    const sortOrder = searchParams.get('sortOrder') || '-1'; // -1 for desc, 1 for asc

    await connectToDatabase();

    let query: any = {};
    if (paperId) {
      query.paper = new mongoose.Types.ObjectId(paperId);
    }

    const evaluations = await Evaluation.find(query)
      .populate('paper', 'title authors')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .lean();

    // Enrich with user count who evaluated
    const enrichedEvals = await Promise.all(
      evaluations.map(async (e: any) => ({
        ...e,
        paperId: e.paper._id,
        paperTitle: e.paper.title,
        paperAuthors: e.paper.authors,
        averageScore:
          (e.scores.originality +
            e.scores.methodology +
            e.scores.clarity +
            e.scores.significance +
            e.scores.overall) /
          5,
      }))
    );

    return new Response(JSON.stringify(enrichedEvals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch evaluations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const runtime = 'nodejs';
