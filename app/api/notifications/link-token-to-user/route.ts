import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, userId } = body;

    if (!deviceId || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Cerca il token
    const token = await db.pushToken.findUnique({ where: { deviceId } });

    // Se non esiste, errore (oppure potresti creare qui)
    if (!token) {
      return NextResponse.json({ error: 'Device not registered' }, { status: 404 });
    }

    // Se è già collegato correttamente, non fare nulla
    if (token.userId === userId) {
      return NextResponse.json({ success: true, message: 'Already linked' });
    }

    // Altrimenti aggiorna
    const updated = await db.pushToken.update({
      where: { deviceId },
      data: { userId },
    });

    return NextResponse.json({ success: true, token: updated });
  } catch (error) {
    console.error('[LINK_PUSH_TOKEN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
