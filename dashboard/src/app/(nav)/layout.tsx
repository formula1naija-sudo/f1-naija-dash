"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

type Props = {
  children: ReactNode;
};

const NAV_LINKS = [
  { href: "/",          label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule",  label: "Schedule" },
  { href: "/news",      label: "News" },
  { href: "/standings", label: "Standings" },
  { href: "/help",      label: "Help" },
];

export default function Layout({ children }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .04em;
          color: #5a6888;
          text-decoration: none;
          padding: 6px 2px;
          transition: color .18s;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1.5px;
          background: #00d484;
          transform: scaleX(0);
          transition: transform .18s;
          border-radius: 1px;
        }
        .nav-link:hover { color: #edf2ff; }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active { color: #edf2ff; }
        .nav-link.active::after { transform: scaleX(1); }

        .mobile-nav {
          position: fixed;
          inset: 0;
          background: rgba(4,6,14,.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 50;
          display: flex;
          flex-direction: column;
          padding: 80px 28px 40px;
          gap: 4px;
          animation: mobileNavIn .22s ease both;
        }
        @keyframes mobileNavIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-link {
          font-size: clamp(28px, 7vw, 40px);
          font-weight: 900;
          letter-spacing: -.025em;
          color: #3a4560;
          text-decoration: none;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
          transition: color .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-nav-link:hover,
        .mobile-nav-link.active { color: #edf2ff; }
        .mobile-nav-link.active { color: #00d484; }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
          -webkit-tap-highlight-color: transparent;
          background: transparent;
          border: none;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #edf2ff;
          border-radius: 1px;
          transition: transform .25s, opacity .25s;
          transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
      `}</style>

      <AdBanner />

      {/* ââ NAV âââââââââââââââââââââââââââââââââââââââââââ */}
      <nav style={{
        position: "sticky", top: 40, left: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 48, padding: "0 16px",
        background: "rgba(4,6,14,.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}>
        {/* Logo wordmark */}
        <Link href="/" style={{
          fontSize: 13, fontWeight: 900, letterSpacing: ".06em",
          textTransform: "uppercase", color: "#edf2ff",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ color: "#00d484" }}>F1</span>
          <span style={{ color: "#5a6888", fontWeight: 400 }}>Â·</span>
          Naija
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }} className="hidden sm:flex">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname === l.href ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`hamburger sm:hidden${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ââ MOBILE MENU OVERLAY âââââââââââââââââââââââââââ */}
      {menuOpen && (
        <div className="mobile-nav sm:hidden">
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute", top: 14, right: 16,
              background: "transparent", border: "none",
              fontSize: 13, color: "#5a6888", cursor: "pointer",
              padding: "8px", WebkitTapHighlightColor: "transparent",
            }}
          >â Close</button>

          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`mobile-nav-link${pathname === l.href ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            <a href="https://x.com/f1_naija" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "#5a6888", textDecoration: "none" }}>
              ð Twitter
            </a>
            <a href="https://www.instagram.com/f1_naija/" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "#5a6888", textDecoration: "none" }}>
              Instagram
            </a>
            <a href="https://www.tiktok.com/@f1.naija" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "#5a6888", textDecoration: "none" }}>
              TikTok
            </a>
          </div>
        </div>
      )}

      {/* ââ MAIN âââââââââââââââââââââââââââââââââââââââââââ */}
      <main className="container mx-auto max-w-(--breakpoint-lg) px-4">
        {children}
        <Footer />
      </main>
    </>
  );
}
