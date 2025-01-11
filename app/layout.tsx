import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from "@/components/altre/navbar";
import { Suspense } from "react";
import Loading from "./loading";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evently Italia – Eventi Salerno",
  description:
    "Evently ti aiuta a scoprire gli eventi più interessanti di Salerno. Concerti, festival e molto altro: trova ora il tuo prossimo evento!",
  
  alternates: {
    canonical: "https://www.evently.com/",
  },

  // Metadati Open Graph (per Facebook, LinkedIn, ecc.)
  openGraph: {
    title: "Evently Italia – Eventi Salerno",
    description:
      "Evently ti aiuta a scoprire gli eventi più interessanti di Salerno. Concerti, festival e molto altro.",
    url: "https://www.evently.com/",
    siteName: "Evently Italia",
    locale: "it_IT",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();
  
  return (
    
    <SessionProvider session={session}>
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar currentUser={session?.user}/>
        <Toaster/>
        <Suspense fallback={<Loading/>}>
        <div className="pt-20 pt-28">
        {children}
        </div>
        </Suspense>
        <Analytics/>
        <SpeedInsights/>
      </body>
      
    </html>
    </SessionProvider>
  );
}
