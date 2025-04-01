// /app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, body: message, data } = body;

    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const tokens = await db.pushToken.findMany({ where: { userId } });
    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No tokens found' }, { status: 404 });
    }

    const messages = tokens
      .filter((t) => Expo.isExpoPushToken(t.token))
      .map((t) => ({
        to: t.token,
        sound: 'default',
        title,
        body: message,
        data: data || {},
      }));

    const tickets = await expo.sendPushNotificationsAsync(messages);

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('[SEND_NOTIFICATION_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
