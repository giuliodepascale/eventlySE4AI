import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, userId } = body;

    if (!deviceId || !userId) {
      return NextResponse.json({ error: 'Missing deviceId or userId' }, { status: 400 });
    }

    const token = await db.pushToken.updateMany({
        where: { deviceId },
        data: { userId },
      });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('[LINK_PUSH_TOKEN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
