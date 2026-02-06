import { connectToDatabase } from '../../../../lib/db';
import Evaluation from '../../../../lib/models/Evaluation';
import Paper from '../../../../lib/models/Paper';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const status = searchParams.get('status'); // 'completed', 'pending', 'all'

    await connectToDatabase();

    let papers = await Paper.find().lean();

    // Filter by year if provided
    if (year) {
      const yearNum = parseInt(year);
      papers = papers.filter((p: any) => {
        const paperYear = new Date(p.createdAt).getFullYear();
        return paperYear === yearNum;
      });
    }

    // Get comprehensive analytics
    const analyticsData = await Promise.all(
      papers.map(async (paper: any) => {
        const evals = await Evaluation.find({ paper: paper._id }).lean();
        const evalCount = evals.length;
        const isCompleted = evalCount > 0;

        if (status && status !== 'all') {
          const targetStatus = status === 'completed' ? true : false;
          if (isCompleted !== targetStatus) {
            return null;
          }
        }

        let scores = {
          originality: [] as number[],
          methodology: [] as number[],
          clarity: [] as number[],
          significance: [] as number[],
          overall: [] as number[],
        };

        let averages = {
          originality: 0,
          methodology: 0,
          clarity: 0,
          significance: 0,
          overall: 0,
        };

        if (evalCount > 0) {
          evals.forEach((e: any) => {
            if (e.scores.originality) scores.originality.push(e.scores.originality);
            if (e.scores.methodology) scores.methodology.push(e.scores.methodology);
            if (e.scores.clarity) scores.clarity.push(e.scores.clarity);
            if (e.scores.significance) scores.significance.push(e.scores.significance);
            if (e.scores.overall) scores.overall.push(e.scores.overall);
          });

          averages = {
            originality: parseFloat((scores.originality.reduce((a: number, b: number) => a + b, 0) / evalCount).toFixed(2)),
            methodology: parseFloat((scores.methodology.reduce((a: number, b: number) => a + b, 0) / evalCount).toFixed(2)),
            clarity: parseFloat((scores.clarity.reduce((a: number, b: number) => a + b, 0) / evalCount).toFixed(2)),
            significance: parseFloat((scores.significance.reduce((a: number, b: number) => a + b, 0) / evalCount).toFixed(2)),
            overall: parseFloat((scores.overall.reduce((a: number, b: number) => a + b, 0) / evalCount).toFixed(2)),
          };
        }

        return {
          paperId: paper._id,
          paperTitle: paper.title,
          paperAuthors: paper.authors || [],
          evaluationCount: evalCount,
          status: isCompleted ? 'completed' : 'pending',
          averageScores: averages,
          evaluationYear: new Date(paper.createdAt).getFullYear(),
        };
      })
    );

    // Remove null entries (filtered out)
    const filtered = analyticsData.filter((d: any) => d !== null);

    // Calculate overall statistics
    const totalEvaluations = await Evaluation.countDocuments();
    const completedCount = filtered.filter((d: any) => d.status === 'completed').length;
    const pendingCount = filtered.filter((d: any) => d.status === 'pending').length;

    // Score distribution for all evaluations
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
        papers: filtered,
        totalPapers: filtered.length,
        completedPapers: completedCount,
        pendingPapers: pendingCount,
        totalEvaluations,
        scoreDistribution,
        average: {
          originality: parseFloat((allEvals.reduce((sum: number, e: any) => sum + (e.scores.originality || 0), 0) / (allEvals.length || 1)).toFixed(2)),
          methodology: parseFloat((allEvals.reduce((sum: number, e: any) => sum + (e.scores.methodology || 0), 0) / (allEvals.length || 1)).toFixed(2)),
          clarity: parseFloat((allEvals.reduce((sum: number, e: any) => sum + (e.scores.clarity || 0), 0) / (allEvals.length || 1)).toFixed(2)),
          significance: parseFloat((allEvals.reduce((sum: number, e: any) => sum + (e.scores.significance || 0), 0) / (allEvals.length || 1)).toFixed(2)),
          overall: parseFloat((allEvals.reduce((sum: number, e: any) => sum + (e.scores.overall || 0), 0) / (allEvals.length || 1)).toFixed(2)),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch analytics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
