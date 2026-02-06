import { connectToDatabase } from '../../../../lib/db';
import Evaluation from '../../../../lib/models/Evaluation';
import Paper from '../../../../lib/models/Paper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv
    const paperId = searchParams.get('paperId');
    const year = searchParams.get('year');

    await connectToDatabase();

    let papers = await Paper.find().lean();

    if (year) {
      const yearNum = parseInt(year);
      papers = papers.filter((p: any) => new Date(p.createdAt).getFullYear() === yearNum);
    }

    // Get all evaluations with paper details
    const exportData = await Promise.all(
      papers.map(async (paper: any) => {
        let evals = await Evaluation.find({ paper: paper._id }).lean();

        return {
          paper: {
            _id: paper._id,
            title: paper.title,
            authors: (paper.authors || []).join('; '),
            abstract: paper.abstract || '',
          },
          evaluations: evals.map((e: any, idx: number) => ({
            evaluatorNumber: idx + 1,
            scores: e.scores,
            comments: e.comments || '',
            averageScore: parseFloat(
              ((e.scores.originality +
                e.scores.methodology +
                e.scores.clarity +
                e.scores.significance +
                (e.scores.overall || 0)) /
                5).toFixed(2)
            ),
            evaluatedDate: e.createdAt,
          })),
          evaluationCount: evals.length,
        };
      })
    );

    if (format === 'csv') {
      // Generate CSV format
      let csv = 'Paper ID,Title,Authors,Evaluations Count,Avg Originality,Avg Methodology,Avg Clarity,Avg Significance,Avg Overall\n';

      exportData.forEach((item: any) => {
        if (item.evaluations.length > 0) {
          const avgOriginality = (
            item.evaluations.reduce((sum: number, e: any) => sum + e.scores.originality, 0) / item.evaluations.length
          ).toFixed(2);
          const avgMethodology = (
            item.evaluations.reduce((sum: number, e: any) => sum + e.scores.methodology, 0) / item.evaluations.length
          ).toFixed(2);
          const avgClarity = (
            item.evaluations.reduce((sum: number, e: any) => sum + e.scores.clarity, 0) / item.evaluations.length
          ).toFixed(2);
          const avgSignificance = (
            item.evaluations.reduce((sum: number, e: any) => sum + e.scores.significance, 0) / item.evaluations.length
          ).toFixed(2);
          const avgOverall = (
            item.evaluations.reduce((sum: number, e: any) => sum + e.scores.overall, 0) / item.evaluations.length
          ).toFixed(2);

          csv += `"${item.paper._id}","${item.paper.title.replace(/"/g, '""')}","${item.paper.authors.replace(/"/g, '""')}",${item.evaluationCount},${avgOriginality},${avgMethodology},${avgClarity},${avgSignificance},${avgOverall}\n`;
        }
      });

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="evaluations-export.csv"',
        },
      });
    }

    // Default JSON format
    return new Response(JSON.stringify(exportData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="evaluations-export.json"',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to export data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
