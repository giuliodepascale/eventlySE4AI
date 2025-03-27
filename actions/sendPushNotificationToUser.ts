// /app/actions/sendPushToUser.ts
'use server';

import { sendPushNotification } from '@/lib/notifications/sendPushNotification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPushToUser(userId: string, title: string, body: string, data: Record<string, any> = {}) {
  const result = await sendPushNotification(userId, title, body, data);
  return result;
}