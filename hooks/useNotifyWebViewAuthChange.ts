"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export function useNotifyWebViewAuthChange() {
  const { data: session } = useSession();
  const lastUserId = useRef<string | null>(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    const isInApp = /EventlyApp/i.test(navigator.userAgent);
    const rnWebView = (window as Window & {
      ReactNativeWebView?: { postMessage: (message: string) => void };
    }).ReactNativeWebView;

    if (!isInApp || !rnWebView) return;

    if (userId && userId !== lastUserId.current) {
      rnWebView.postMessage(JSON.stringify({ type: 'USER_LOGGED_IN', userId }));
      lastUserId.current = userId;
    }

    if (!userId && lastUserId.current !== null) {
      rnWebView.postMessage(JSON.stringify({ type: 'USER_LOGGED_OUT' }));
      lastUserId.current = null;
    }
  }, [userId]);
}
