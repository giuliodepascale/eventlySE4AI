// /lib/notifications/sendPushNotification.ts
import { Expo } from 'expo-server-sdk';
import { db } from '@/lib/db';

const expo = new Expo();

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string | number | boolean | null> = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; tickets?: any[]; error?: string }> {
  try {
    const tokens = await db.pushToken.findMany({ where: { userId } });
    if (tokens.length === 0) {
      return { success: false, error: 'No push tokens found for user' };
    }

    const messages = tokens
      .filter((t) => Expo.isExpoPushToken(t.token))
      .map((t) => ({
        to: t.token,
        sound: 'default',
        title,
        body,
        data,
      }));

    const tickets = await expo.sendPushNotificationsAsync(messages);
    return { success: true, tickets };
  } catch (error) {
    console.error('[sendPushNotification] Error sending push:', error);
    return { success: false, error: 'Internal error' };
  }
}
