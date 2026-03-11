"use client";

import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

type Props = { children: ReactNode };

// ── Desktop nav + More-menu links ─────────────────────────────
const NAV_LINKS = [
  { href: "/",           label: "Home" },
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/schedule",   label: "Schedule" },
  { href: "/news",       label: "News" },
  { href: "/standings",  label: "Standings" },
  { href: "/community",  label: "Community" },
  { href: "/fantasy",    label: "Fantasy" },
  { href: "/about",      label: "About" },
  { href: "/help",       label: "Help" },
];

// ── Mobile bottom tabs (most-used 4 + More) ───────────────────
const BOTTOM_TABS = [
  { href: "/",          label: "Home",      icon: IconHome },
  { href: "/dashboard", label: "Live",      icon: IconDash },
  { href: "/schedule",  label: "Schedule",  icon: IconCal  },
  { href: "/standings", label: "Standings", icon: IconTrophy },
];

// ── More-menu grouped links ────────────────────────────────────
const MORE_GROUPS = [
  {
    title: "Platform",
    links: [
      { href: "/news",      label: "📰 F1 News" },
      { href: "/community", label: "🇳🇬 Community" },
      { href: "/fantasy",   label: "🏆 Fantasy League" },
    ],
  },
  {
    title: "F1 Naija Originals",
    links: [
      { href: "/naija-index", label: "⭐ Naija Driver Index" },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/start-here", label: "👋 Start Here (New Fans)" },
      { href: "/about",      label: "ℹ️ About F1 Naija" },
      { href: "/partner",    label: "🤝 Partner With Us" },
      { href: "/help",       label: "❓ Help & FAQ" },
    ],
  },
];

// ── SVG Icons ─────────────────────────────────────────────────
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00d484" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconDash({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00d484" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconCal({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00d484" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconTrophy({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00d484" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 21 16 21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M7 4H4a1 1 0 0 0-1 1v3c0 2.76 2.24 5 5 5h.5" />
      <path d="M17 4h3a1 1 0 0 1 1 1v3c0 2.76-2.24 5-5 5h-.5" />
      <path d="M12 17a5 5 0 0 1-5-5V4h10v8a5 5 0 0 1-5 5z" />
    </svg>
  );
}
function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00d484" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9"  cy="9"  r="1.5" fill={active ? "#00d484" : "currentColor"} />
      <circle cx="15" cy="9"  r="1.5" fill={active ? "#00d484" : "currentColor"} />
      <circle cx="9"  cy="15" r="1.5" fill={active ? "#00d484" : "currentColor"} />
      <circle cx="15" cy="15" r="1.5" fill={active ? "#00d484" : "currentColor"} />
    </svg>
  );
}

// ── Layout ────────────────────────────────────────────────────
export default function Layout({ children }: Props) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [moreOpen]);

  // Close menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const isMoreActive = moreOpen || MORE_GROUPS
    .flatMap(g => g.links)
    .some(l => pathname === l.href);

  return (
    <>
      <style>{`
        /* ── Desktop nav link ── */
        .nav-link {
          position: relative; font-size: 12px; font-weight: 600;
          letter-spacing: .04em; color: var(--f1-muted);
          text-decoration: none; padding: 6px 2px;
          transition: color .18s; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
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

        /* ── Bottom tab bar ── */
        .btab-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          display: flex; align-items: stretch;
          background: var(--f1-nav);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid var(--f1-border);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          height: calc(56px + env(safe-area-inset-bottom, 0px));
        }
        .btab-bar a, .btab-bar button {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 3px;
          color: var(--f1-muted); text-decoration: none;
          font-size: 10px; font-weight: 600; letter-spacing: .04em;
          background: transparent; border: none; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 56px; padding: 0 4px;
          transition: color .15s;
        }
        .btab-bar a.active, .btab-bar button.btab-more-active {
          color: #00d484;
        }
        .btab-bar a:active, .btab-bar button:active {
          opacity: .7;
        }

        /* ── More overlay (bottom sheet) ── */
        .more-overlay-backdrop {
          position: fixed; inset: 0; z-index: 48;
          background: rgba(4,6,14,.7);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          animation: backdropIn .22s ease both;
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .more-overlay-sheet {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 49;
          background: var(--f1-sidebar);
          border-top: 1px solid var(--f1-border-mid);
          border-radius: 20px 20px 0 0;
          max-height: 82dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          padding: 0 0 calc(72px + env(safe-area-inset-bottom, 0px));
          animation: sheetIn .28s cubic-bezier(.32,1,.36,1) both;
        }
        @keyframes sheetIn {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .sheet-drag-handle {
          width: 36px; height: 4px; border-radius: 2px;
          background: var(--f1-border-mid); margin: 12px auto 8px;
        }
        .sheet-link {
          display: flex; align-items: center; gap: 10;
          padding: 14px 20px; font-size: 15px; font-weight: 700;
          color: var(--f1-text); text-decoration: none;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          min-height: 52px;
          border-bottom: 1px solid var(--f1-border-soft);
          transition: background .15s;
        }
        .sheet-link:active { background: rgba(255,255,255,.04); }
        .sheet-link.active { color: #00d484; }
        .sheet-group-title {
          font-size: 10px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--f1-muted);
          padding: 16px 20px 6px;
        }

        /* ── Hamburger (desktop only fallback) ── */
        .hamburger {
          display: flex; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 8px; min-height: 44px; min-width: 44px;
          align-items: center; justify-content: center;
          -webkit-tap-highlight-color: transparent;
          background: transparent; border: none; touch-action: manipulation;
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

      {/* ── TOP NAV ────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "sticky", top: 0, left: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 48, padding: "0 16px",
          background: "var(--f1-nav)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--f1-border)",
        }}
      >
        {/* Brand */}
        <Link href="/" style={{
          textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
          minHeight: 44, paddingRight: 8,
        }} aria-label="F1 Naija home">
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-.02em", color: "var(--f1-text)" }}>F1</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#00d484" }}>· Naija</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex" style={{ alignItems: "center", gap: 22 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile: right-side live indicator (optional) */}
        <div className="sm:hidden flex" style={{ alignItems: "center", gap: 8 }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 6, minHeight: 36,
              background: "rgba(0,212,132,.12)", border: "1px solid rgba(0,212,132,.25)",
              color: "#00d484", textDecoration: "none",
              fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
              WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d484", display: "inline-block", animation: "pulse 2s infinite" }} />
            LIVE
          </Link>
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main
        className="container mx-auto max-w-5xl px-4"
        style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
        id="main-content"
      >
        {children}
        <Footer />
      </main>

      {/* ── BOTTOM TAB BAR (mobile only) ───────────────────── */}
      <div className="btab-bar sm:hidden" role="navigation" aria-label="Bottom navigation">
        {BOTTOM_TABS.map(tab => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={active ? "active" : ""}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon active={active} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        {/* More button */}
        <button
          onClick={() => setMoreOpen(o => !o)}
          className={isMoreActive ? "btab-more-active" : ""}
          aria-label="More navigation options"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
        >
          <IconGrid active={isMoreActive} />
          <span>More</span>
        </button>
      </div>

      {/* ── MORE BOTTOM SHEET ──────────────────────────────── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="more-overlay-backdrop sm:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          {/* Sheet */}
          <div
            className="more-overlay-sheet sm:hidden"
            role="menu"
            aria-label="More navigation"
          >
            <div className="sheet-drag-handle" aria-hidden="true" />
            <div style={{ padding: "4px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "var(--f1-text)" }}>Menu</span>
              <button
                onClick={() => setMoreOpen(false)}
                style={{
                  background: "rgba(255,255,255,.08)", border: "none",
                  borderRadius: "50%", width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--f1-text)", cursor: "pointer", fontSize: 14,
                  WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {MORE_GROUPS.map(group => (
              <div key={group.title}>
                <div className="sheet-group-title">{group.title}</div>
                {group.links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sheet-link${pathname === link.href ? " active" : ""}`}
                    role="menuitem"
                    aria-current={pathname === link.href ? "page" : undefined}
                    onClick={() => setMoreOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Social links in sheet */}
            <div style={{ padding: "16px 20px 0", display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { href: "https://x.com/f1_naija",              label: "X (Twitter)" },
                { href: "https://www.instagram.com/f1_naija/", label: "Instagram" },
                { href: "https://www.tiktok.com/@f1.naija",    label: "TikTok" },
              ].map(s => (
                <a
                  key={s.href} href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: "10px 16px", borderRadius: 8, minHeight: 44,
                    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                    fontSize: 12, fontWeight: 600, color: "var(--f1-muted)",
                    textDecoration: "none", WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
        /* Prevent double-tap zoom on all interactive elements */
        a, button { touch-action: manipulation; }
        /* Remove iOS tap flash */
        * { -webkit-tap-highlight-color: transparent; }
        /* Smooth momentum scrolling on iOS */
        .more-overlay-sheet { -webkit-overflow-scrolling: touch; }
        /* Desktop: no bottom padding for main content */
        @media (min-width: 640px) {
          #main-content { padding-bottom: 0 !important; }
        }
      `}</style>
    </>
  );
}
