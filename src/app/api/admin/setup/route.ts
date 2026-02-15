import { connectToDatabase } from '../../../lib/db';
import User from '../../../lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing email or role' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: { email: user.email, role: user.role } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to update role' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const runtime = 'nodejs';
