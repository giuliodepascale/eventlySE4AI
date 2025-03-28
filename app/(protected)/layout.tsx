"use client";

import { Suspense, useEffect , useRef } from 'react';
import Loading from '../loading';
import { useSession } from 'next-auth/react';


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const isInApp = /EventlyApp/i.test(navigator.userAgent);
    const rnWebView = (window as Window & {
      ReactNativeWebView?: { postMessage: (message: string) => void };
    }).ReactNativeWebView;

    if (!isInApp || !rnWebView) return;

    const currentUserId = session?.user?.id ?? null;

    if (currentUserId && currentUserId !== lastUserId.current) {
      rnWebView.postMessage(JSON.stringify({ type: 'USER_LOGGED_IN', userId: currentUserId }));
      lastUserId.current = currentUserId;
    }

    if (!currentUserId && lastUserId.current !== null) {
      rnWebView.postMessage(JSON.stringify({ type: 'USER_LOGGED_OUT' }));
      lastUserId.current = null;
    }
  }, [session]);




  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Suspense fallback={<Loading/>}>
          <main>
            {children}
          </main>
        </Suspense>
      </div>
     
    </div>
  );
}
