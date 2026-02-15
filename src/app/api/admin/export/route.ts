import { connectToDatabase } from '../../../../lib/db';
import Evaluation from '../../../../lib/models/Evaluation';
import Paper from '../../../../lib/models/Paper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel
    const paperId = searchParams.get('paperId');
    const year = searchParams.get('year');

    await connectToDatabase();

    let papers = await Paper.find().lean();

    if (year) {
      const yearNum = parseInt(year);
      papers = papers.filter((p: any) => new Date(p.createdAt).getFullYear() === yearNum);
    }

    // filter by specific paper(s) if requested (comma-separated list)
    if (paperId) {
      const ids = paperId.split(',').map((s) => s.trim()).filter(Boolean);
      papers = papers.filter((p: any) => ids.includes(p._id.toString()));
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
          counts: {
            originality: evals.reduce((acc: any, cur: any) => {
              const v = cur.scores.originality || 0;
              if (v >= 1 && v <= 5) acc[v] = (acc[v] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
            methodology: evals.reduce((acc: any, cur: any) => {
              const v = cur.scores.methodology || 0;
              if (v >= 1 && v <= 5) acc[v] = (acc[v] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
            clarity: evals.reduce((acc: any, cur: any) => {
              const v = cur.scores.clarity || 0;
              if (v >= 1 && v <= 5) acc[v] = (acc[v] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
            significance: evals.reduce((acc: any, cur: any) => {
              const v = cur.scores.significance || 0;
              if (v >= 1 && v <= 5) acc[v] = (acc[v] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
            overall: evals.reduce((acc: any, cur: any) => {
              const v = cur.scores.overall || 0;
              if (v >= 1 && v <= 5) acc[v] = (acc[v] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
          },
        };
      })
    );

    if (format === 'csv' || format === 'excel') {
      // Generate CSV format (Excel can open CSV or .xls wrapper)
      // prepend BOM so Excel opens with UTF-8 encoding (Thai characters display properly)
      let csv = '\uFEFF';
      // only paper title and aggregated score info (no evaluator details or authors)
      csv += 'Paper ID,Title,Evaluations Count,Avg Originality,Avg Methodology,Avg Clarity,Avg Significance,Avg Overall';
      // add columns for counts (5 down to 1) per criterion
      ['Originality','Methodology','Clarity','Significance','Overall'].forEach((crit) => {
        for (let score = 5; score >= 1; score--) {
          csv += `,${crit} ${score}`;
        }
      });
      csv += '\n';

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

          // counts per score value for each field
          const counts: any = {
            originality: {1:0,2:0,3:0,4:0,5:0},
            methodology: {1:0,2:0,3:0,4:0,5:0},
            clarity: {1:0,2:0,3:0,4:0,5:0},
            significance: {1:0,2:0,3:0,4:0,5:0},
            overall: {1:0,2:0,3:0,4:0,5:0},
          };
          item.evaluations.forEach((e: any) => {
            ['originality','methodology','clarity','significance','overall'].forEach((key) => {
              const v = e.scores[key] || 0;
              if (v >= 1 && v <= 5) counts[key][v] = (counts[key][v] || 0) + 1;
            });
          });

          csv += `"${item.paper._id}","${item.paper.title.replace(/"/g, '""')}",${item.evaluationCount},${avgOriginality},${avgMethodology},${avgClarity},${avgSignificance},${avgOverall}`;
          // append counts
          ['originality','methodology','clarity','significance','overall'].forEach((key) => {
            for (let score = 5; score >= 1; score--) {
              csv += `,${counts[key][score]}`;
            }
          });
          csv += '\n';
        }
      });

      const isExcel = format === 'excel';
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': isExcel ? 'application/vnd.ms-excel' : 'text/csv',
          'Content-Disposition': `attachment; filename="evaluations-export.${isExcel ? 'xls' : 'csv'}"`,
        },
      });
    }

    // Default JSON format: only aggregated exportData without individual evaluations
    const summary = exportData.map((item: any) => ({
      paper: item.paper,
      evaluationCount: item.evaluationCount,
      averageOriginality: item.evaluations.length ?
        (item.evaluations.reduce((s: any, e: any) => s + e.scores.originality, 0) / item.evaluations.length) : 0,
      averageMethodology: item.evaluations.length ?
        (item.evaluations.reduce((s: any, e: any) => s + e.scores.methodology, 0) / item.evaluations.length) : 0,
      averageClarity: item.evaluations.length ?
        (item.evaluations.reduce((s: any, e: any) => s + e.scores.clarity, 0) / item.evaluations.length) : 0,
      averageSignificance: item.evaluations.length ?
        (item.evaluations.reduce((s: any, e: any) => s + e.scores.significance, 0) / item.evaluations.length) : 0,
      averageOverall: item.evaluations.length ?
        (item.evaluations.reduce((s: any, e: any) => s + (e.scores.overall||0), 0) / item.evaluations.length) : 0,
      counts: item.counts,
    }));
    return new Response(JSON.stringify(summary), {
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
