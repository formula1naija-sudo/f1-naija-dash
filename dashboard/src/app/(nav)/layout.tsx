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
  { href: "/community", label: "Community" },
  { href: "/help",      label: "Help" },
];

export default function Layout({ children }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav-link {
          position: relative; font-size: 12px; font-weight: 600;
          letter-spacing: .04em; color: var(--f1-muted);
          text-decoration: none; padding: 6px 2px;
          transition: color .18s; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 1.5px; background: #00d484; transform: scaleX(0);
          transition: transform .18s; border-radius: 1px;
        }
        .nav-link:hover { color: var(--f1-text); }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active { color: var(--f1-text); }
        .nav-link.active::after { transform: scaleX(1); }

        .mobile-nav {
          position: fixed; inset: 0;
          background: var(--f1-mob-overlay);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          z-index: 50; display: flex; flex-direction: column;
          padding: 80px 28px 40px; gap: 4px;
          animation: mobileNavIn .22s ease both;
        }
        @keyframes mobileNavIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-link {
          font-size: clamp(28px, 7vw, 40px); font-weight: 900;
          letter-spacing: -.025em; color: var(--f1-muted);
          text-decoration: none; padding: 12px 0;
          border-bottom: 1px solid var(--f1-border-soft);
          transition: color .15s; -webkit-tap-highlight-color: transparent;
        }
        .mobile-nav-link:hover { color: var(--f1-text); }
        .mobile-nav-link.active { color: #00d484; }

        .hamburger {
          display: flex; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 8px;
          -webkit-tap-highlight-color: transparent;
          background: transparent; border: none;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--f1-text); border-radius: 1px;
          transition: transform .25s, opacity .25s; transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
      `}</style>

      <AdBanner />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 40, left: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 48, padding: "0 16px",
        background: "var(--f1-nav)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--f1-border)",
        transition: "background .2s, border-color .2s",
      }}>
        <Link href="/" style={{
          textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{
            fontSize: 15, fontWeight: 900, letterSpacing: "-.02em", color: "var(--f1-text)",
          }}>F1</span>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
            color: "#00d484",
          }}>· Naija</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }} className="hidden sm:flex">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? " active" : ""}`}>
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
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div className="mobile-nav sm:hidden">
          {/* Brand at top-left */}
          <div style={{ position: "absolute", top: 22, left: 28, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-.02em", color: "var(--f1-text)" }}>F1</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#00d484" }}>· Naija</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute", top: 14, right: 16,
              background: "transparent", border: "none",
              fontSize: 13, color: "var(--f1-muted)", cursor: "pointer",
              padding: "8px", WebkitTapHighlightColor: "transparent",
            }}
          >&#x2715; Close</button>

          {NAV_LINKS.map(l => (
            <Link
              key={l.href} href={l.href}
              className={`mobile-nav-link${pathname === l.href ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          <div style={{ marginTop: 24, display: "flex", gap: 20 }}>
            {[
              { href: "https://x.com/f1_naija",              label: "X (Twitter)" },
              { href: "https://www.instagram.com/f1_naija/", label: "Instagram" },
              { href: "https://www.tiktok.com/@f1.naija",    label: "TikTok" },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--f1-muted)", textDecoration: "none" }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="container mx-auto max-w-5xl px-4">
        {children}
        <Footer />
      </main>
    </>
  );
}
