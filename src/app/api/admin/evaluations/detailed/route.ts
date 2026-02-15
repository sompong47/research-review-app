import { connectToDatabase } from '../../../../../lib/db';
import Evaluation from '../../../../../lib/models/Evaluation';
import Paper from '../../../../../lib/models/Paper';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paperId');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, score, originality, methodology, clarity, significance
    const sortOrder = searchParams.get('sortOrder') || '-1'; // -1 for desc, 1 for asc
    const minScore = searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : 0;

    await connectToDatabase();

    let query: any = {};
    if (paperId) {
      const ids = paperId.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length === 1) {
        query.paper = new mongoose.Types.ObjectId(ids[0]);
      } else if (ids.length > 1) {
        query.paper = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    let evaluations = await Evaluation.find(query)
      .populate('paper', 'title authors')
      .lean();

    // Convert score-based sorting
    let sortKey = sortBy;
    if (sortBy === 'score' || sortBy === 'overall') {
      sortKey = 'scores.overall';
    } else if (['originality', 'methodology', 'clarity', 'significance'].includes(sortBy)) {
      sortKey = `scores.${sortBy}`;
    }

    // Filter by minimum score if provided
    if (minScore > 0) {
      evaluations = evaluations.filter((e: any) => {
        const avg = (e.scores.originality + e.scores.methodology + e.scores.clarity + e.scores.significance + (e.scores.overall || 0)) / 5;
        return avg >= minScore;
      });
    }

    // Sort
    evaluations.sort((a: any, b: any) => {
      let aVal = a;
      let bVal = b;

      sortKey.split('.').forEach((key) => {
        aVal = aVal[key];
        bVal = bVal[key];
      });

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return parseInt(sortOrder) === -1 ? -comparison : comparison;
    });

    // Enrich evaluations with anonymized info (no user identification)
    const enrichedEvals = evaluations.map((e: any, idx: number) => ({
      _id: e._id,
      paperId: e.paper._id,
      paperTitle: e.paper.title,
      paperAuthors: e.paper.authors,
      evaluatorNumber: idx + 1, // Anonymous evaluator reference (1st evaluator, 2nd evaluator, etc.)
      scores: e.scores,
      comments: e.comments || '',
      averageScore: parseFloat(
        ((e.scores.originality + e.scores.methodology + e.scores.clarity + e.scores.significance + (e.scores.overall || 0)) / 5).toFixed(2)
      ),
      createdAt: e.createdAt,
    }));

    return new Response(JSON.stringify(enrichedEvals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch detailed evaluations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
