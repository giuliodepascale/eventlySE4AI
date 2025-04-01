// /app/api/register-push-token/route.ts
import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, token } = body;

    console.log('[📩 register-push-token]', { deviceId, token });

    if (!deviceId || !token) {
      return NextResponse.json({ error: 'Missing deviceId or token' }, { status: 400 });
    }

    const result = await db.pushToken.upsert({
      where: { deviceId },
      update: {
        token,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      create: {
        deviceId,
        token,
      },
    });

    return NextResponse.json({ success: true, token: result });
  } catch (error) {
    console.error('[REGISTER_PUSH_TOKEN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
