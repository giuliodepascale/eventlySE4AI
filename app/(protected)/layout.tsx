"use client";

import { Suspense } from 'react';
import Loading from '../loading';

import { useNotifyWebViewAuthChange } from '@/hooks/useNotifyWebViewAuthChange';


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotifyWebViewAuthChange();



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
