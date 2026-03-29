import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniDow | Stream Anime & Beyond",
  description: "Modern Anime Exploration Platform built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#050505] text-zinc-400 selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <Suspense fallback={<div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none" />}>
          <Navbar />
        </Suspense>
        <main className="pt-28 pb-10 px-6 w-full max-w-7xl mx-auto flex-grow">
          {children}
        </main>
        <footer className="w-full text-center py-8 text-zinc-600/80 text-xs font-medium border-t border-white/5 mt-auto bg-[#0a0a0a]/30">
           <p>project gabut by <a href="https://github.com/dhodhoo/AniDow" target="_blank" rel="noopener noreferrer" className="text-indigo-400/80 hover:text-indigo-400 transition-colors cursor-pointer">@dhodho</a></p>
        </footer>
      </body>
    </html>
  );
}
