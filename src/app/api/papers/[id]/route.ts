import { connectToDatabase } from '../../../../lib/db';
import Paper from '../../../../lib/models/Paper';
import mongoose from 'mongoose';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response('Invalid id', { status: 400 });
    }

    const paper = await Paper.findById(id).lean();

    if (!paper) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(JSON.stringify(paper), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(err.message || 'Server error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response('Invalid id', { status: 400 });
    }

    const paper = await Paper.findByIdAndDelete(id);

    if (!paper) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Paper deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(err.message || 'Server error', { status: 500 });
  }
}

export const runtime = 'nodejs';
