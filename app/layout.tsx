import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from "@/components/altre/navbar";
import  Footer  from "@/components/footer";
import BottomNavbar from "@/components/bottom-navbar";


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
    canonical: "https://www.eventlyitalia.com/",
  },

  // Metadati Open Graph (per Facebook, LinkedIn, ecc.)
  openGraph: {
    title: "Evently Italia – Eventi Salerno",
    description:
      "Evently ti aiuta a scoprire gli eventi più interessanti di Salerno. Concerti, festival e molto altro.",
    url: "https://www.eventlyitalia.com/",
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

 // const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent("Salerno B-side")}&output=embed`;

  
  return (
    
    <SessionProvider session={session}>
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen flex-col">
        <Navbar currentUser={session?.user}/>
        <Toaster/>
        <main className="flex-1 pt-[7rem] md:pt-[9rem] py-4 px-4">{children}</main>
        <div className="sticky bottom-0 z-50">
        <BottomNavbar />
      </div>
        <Footer/>
        
        </div>
        
        <Analytics/>
        <SpeedInsights/>
      </body>
      
    </html>
    </SessionProvider>
  );
}
