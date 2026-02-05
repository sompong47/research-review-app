import { connectToDatabase } from '../../../../lib/db';
import Evaluation from '../../../../lib/models/Evaluation';
import Paper from '../../../../lib/models/Paper';

export async function GET() {
  try {
    await connectToDatabase();

    // ได้สถิติรวม
    const totalEvaluations = await Evaluation.countDocuments();
    const papers = await Paper.find().lean();

    // สถิติต่อ paper
    const paperStats = await Promise.all(
      papers.map(async (paper: any) => {
        const evals = await Evaluation.find({ paper: paper._id }).lean();
        const count = evals.length;

        if (count === 0) {
          return {
            paperId: paper._id,
            paperTitle: paper.title,
            paperAuthors: paper.authors || [],
            evaluationCount: 0,
            averageScores: {
              originality: 0,
              methodology: 0,
              clarity: 0,
              significance: 0,
              overall: 0,
            },
            status: 'pending',
          };
        }

        const avgOriginality =
          evals.reduce((sum: number, e: any) => sum + (e.scores.originality || 0), 0) / count;
        const avgMethodology =
          evals.reduce((sum: number, e: any) => sum + (e.scores.methodology || 0), 0) / count;
        const avgClarity =
          evals.reduce((sum: number, e: any) => sum + (e.scores.clarity || 0), 0) / count;
        const avgSignificance =
          evals.reduce((sum: number, e: any) => sum + (e.scores.significance || 0), 0) / count;
        const avgOverall =
          evals.reduce((sum: number, e: any) => sum + (e.scores.overall || 0), 0) / count;

        return {
          paperId: paper._id,
          paperTitle: paper.title,
          paperAuthors: paper.authors || [],
          evaluationCount: count,
          averageScores: {
            originality: parseFloat(avgOriginality.toFixed(2)),
            methodology: parseFloat(avgMethodology.toFixed(2)),
            clarity: parseFloat(avgClarity.toFixed(2)),
            significance: parseFloat(avgSignificance.toFixed(2)),
            overall: parseFloat(avgOverall.toFixed(2)),
          },
          status: count > 0 ? 'completed' : 'pending',
        };
      })
    );

    // Score distribution
    const allEvals = await Evaluation.find().lean();
    const scoreDistribution = {
      originality: [0, 0, 0, 0, 0],
      methodology: [0, 0, 0, 0, 0],
      clarity: [0, 0, 0, 0, 0],
      significance: [0, 0, 0, 0, 0],
      overall: [0, 0, 0, 0, 0],
    };

    allEvals.forEach((e: any) => {
      if (e.scores.originality) scoreDistribution.originality[e.scores.originality - 1]++;
      if (e.scores.methodology) scoreDistribution.methodology[e.scores.methodology - 1]++;
      if (e.scores.clarity) scoreDistribution.clarity[e.scores.clarity - 1]++;
      if (e.scores.significance) scoreDistribution.significance[e.scores.significance - 1]++;
      if (e.scores.overall) scoreDistribution.overall[e.scores.overall - 1]++;
    });

    return new Response(
      JSON.stringify({
        totalEvaluations,
        totalPapers: papers.length,
        completedPapers: paperStats.filter((s: any) => s.status === 'completed').length,
        pendingPapers: paperStats.filter((s: any) => s.status === 'pending').length,
        paperStats,
        scoreDistribution,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const runtime = 'nodejs';
