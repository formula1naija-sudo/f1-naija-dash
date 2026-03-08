import { type ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      {/* Single sticky wrapper — AdBanner + nav stick together as one unit */}
      <div className="sticky top-0 z-50">
        <AdBanner />
        <nav className="flex h-12 w-full items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 p-2 px-4 backdrop-blur-lg">
          <div className="flex gap-4 text-sm">
            <Link className="transition duration-100 active:scale-95 hover:text-white text-zinc-300" href="/">Home</Link>
            <Link className="transition duration-100 active:scale-95 hover:text-white text-zinc-300" href="/dashboard">Dashboard</Link>
            <Link className="transition duration-100 active:scale-95 hover:text-white text-zinc-300" href="/schedule">Schedule</Link>
            <Link className="transition duration-100 active:scale-95 hover:text-white text-zinc-300" href="/news">News</Link>
            <Link className="transition duration-100 active:scale-95 hover:text-white text-zinc-300" href="/standings">Standings</Link>
            <Link className="transition duration-100 active:scale-95 hover:text-white text-zinc-300" href="/help">Help</Link>
          </div>

          {/* Social icon buttons */}
          <div className="hidden items-center gap-2 sm:flex">
            {/* X / Twitter */}
            <Link
              href="https://x.com/f1naija"
              target="_blank"
              aria-label="Follow on X"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-400 hover:text-white active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>

            {/* Instagram */}
            <Link
              href="https://instagram.com/f1naija"
              target="_blank"
              aria-label="Follow on Instagram"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-pink-500 hover:text-pink-400 active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </Link>

            {/* TikTok */}
            <Link
              href="https://tiktok.com/@f1naija"
              target="_blank"
              aria-label="Follow on TikTok"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-300 hover:text-white active:scale-95"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
              </svg>
            </Link>
          </div>
        </nav>
      </div>

      <main className="container mx-auto max-w-screen-lg px-4">
        {children}
        <Footer />
      </main>
    </>
  );
}
