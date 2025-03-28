"use client";

import { Suspense, useEffect } from 'react';
import Loading from '../loading';
import { useSession } from 'next-auth/react';


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && /EventlyApp/i.test(navigator.userAgent)) {
      (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView?.postMessage(
        JSON.stringify({ type: 'USER_LOGGED_IN', userId: session.user.id })
      );
    }
    if (!session?.user &&/EventlyApp/i.test(navigator.userAgent)) {
      (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView?.postMessage(
        JSON.stringify({ type: 'USER_LOGGED_OUT' })
      );
    }
  }, [session])



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
