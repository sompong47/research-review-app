import { connectToDatabase } from '../../../lib/db';
import mongoose from 'mongoose';
import Paper from '../../../lib/models/Paper';
import * as jwt from 'jsonwebtoken';

export async function GET() {
  await connectToDatabase();
  const papers = await Paper.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(papers), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

async function verifyAdminToken(request: Request) {
  // Read cookie header directly from the incoming request (safer in route handlers)
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenPair = cookieHeader.split(';').map((s) => s.trim()).find((s) => s.startsWith('auth_token='));
  const token = tokenPair ? decodeURIComponent(tokenPair.split('=')[1]) : null;

  if (!token) return null;

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return verified;
  } catch (err) {
    return null;
  }
}

export async function POST(request: Request) {
  // Verify admin token from request
  const user = await verifyAdminToken(request);
  if (!user || user.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Admin access required' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Accept multipart/form-data (file + fields) via request.formData()
  try {
    const form = await request.formData();
    const title = form.get('title')?.toString() || 'Untitled';
    const authorsRaw = form.get('authors')?.toString() || '';
    const authors = authorsRaw ? authorsRaw.split(',').map((s) => s.trim()) : [];
    const abstract = form.get('abstract')?.toString() || '';
    const file = form.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await connectToDatabase();
    const db = mongoose.connection.db as any;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'papers' });

    const uploadStream = bucket.openUploadStream(file.name || `paper-${Date.now()}`, {
      contentType: (file as any).type || 'application/pdf',
    });

    uploadStream.end(buffer);

    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', () => resolve());
      uploadStream.on('error', (err) => reject(err));
    });

    const fileId = uploadStream.id.toString();
    const fileUrl = `/api/files/${fileId}`;

    const paper = await Paper.create({ title, authors, abstract, fileUrl });

    return new Response(
      JSON.stringify(paper),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const runtime = 'nodejs';
