import mongoose from 'mongoose';
import { connectToDatabase } from '../../../../lib/db';
import { Readable } from 'stream';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  await connectToDatabase();

  const db = mongoose.connection.db as any;
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'papers',
  });

  try {
    const _id = new mongoose.Types.ObjectId(id);
    const downloadStream = bucket.openDownloadStream(_id);

    // Node stream → Web stream (Node 18+)
    const webStream = Readable.toWeb(downloadStream as Readable);

    return new Response(webStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}.pdf"`,
      },
    });
  } catch (err: any) {
    return new Response(
      err?.message || 'File not found',
      { status: 404 }
    );
  }
}
