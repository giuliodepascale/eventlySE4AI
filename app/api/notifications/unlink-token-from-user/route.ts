// /app/api/notifications/unlink-token-from-user/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
    }

    const updated = await db.pushToken.update({
      where: { deviceId },
      data: { userId: null },
    });

    return NextResponse.json({ success: true, token: updated });
  } catch (error) {
    console.error('[UNLINK_PUSH_TOKEN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}