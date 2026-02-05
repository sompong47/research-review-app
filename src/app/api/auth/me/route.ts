import { connectToDatabase } from '../../../../lib/db';
import User from '../../../../lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-password').lean();

    if (!user) {
      return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ authenticated: true, user }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ authenticated: false, error: err.message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST() {
  // Logout: clear cookie
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export const runtime = 'nodejs';
