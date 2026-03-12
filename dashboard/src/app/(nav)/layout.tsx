"use client";

import { type ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

type Props = { children: ReactNode };

/** Returns true when the current time falls inside any scheduled session. */
function useIsLiveSession(): boolean {
  const [isLive, setIsLive] = useState(false);

  const check = useCallback(() => {
    const now = Date.now();
    fetch("/api/schedule")
      .then(r => r.ok ? r.json() : null)
      .then((rounds: Array<{ sessions: Array<{ start: string; end: string }> }> | null) => {
        if (!rounds) return;
        const live = rounds.some(r =>
          r.sessions.some(s => now >= new Date(s.start).getTime() && now <= new Date(s.end).getTime())
        );
        setIsLive(live);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 120_000);
    return () => clearInterval(id);
  }, [check]);

  return isLive;
}

// ── Navigation groups for the drawer ──────────────────────
const NAV_GROUPS = [
  {
    title: "Racing",
    links: [
      { href: "/",           label: "Home",       icon: "🏠" },
      { href: "/schedule",   label: "Schedule",   icon: "📅" },
{ href: "/news",       label: "News",       icon: "📰" },
      { href: "/standings",  label: "Standings",  icon: "🏆" },
      { href: "/teams",      label: "Teams",      icon: "🏎️" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/community",  label: "Community",  icon: "🇳🇬" },
      { href: "/fantasy",    label: "Fantasy",    icon: "🔮" },
      { href: "/start-here", label: "Start Here", icon: "👋" },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/about",      label: "About F1 Naija",  icon: "ℹ️"  },
      { href: "/partner",    label: "Partner With Us", icon: "🤝" },
      { href: "/help",       label: "Help",            icon: "❓" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "https://x.com/f1_naija",              label: "X (Twitter)" },
  { href: "https://www.instagram.com/f1_naija/", label: "Instagram"   },
  { href: "https://www.tiktok.com/@f1.naija",    label: "TikTok"      },
];

// ── Hamburger / Close icon ─────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6"  x2="6"  y2="18" />
          <line x1="6"  y1="6"  x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3"  y1="6"  x2="21" y2="6"  />
          <line x1="3"  y1="12" x2="21" y2="12" />
          <line x1="3"  y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

// ── Layout ─────────────────────────────────────────────────
export default function Layout({ children }: Props) {
  const pathname       = usePathname();
  const [open, setOpen] = useState(false);
  const isLive         = useIsLiveSession();

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow    = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
        /* ── Skip link ── */
        .skip-link {
          position: absolute; top: -60px; left: 16px; z-index: 200;
          padding: 8px 16px; border-radius: 6px;
          background: #00d484; color: #04060e;
          font-size: 13px; font-weight: 700;
          text-decoration: none; transition: top .15s; white-space: nowrap;
        }
        .skip-link:focus { top: 16px; }

        /* ── Hamburger button ── */
        .hbtn {
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; border-radius: 8px;
          background: transparent; border: none; cursor: pointer;
          color: var(--f1-text); transition: background .15s;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          flex-shrink: 0;
        }
        .hbtn:hover  { background: rgba(255,255,255,.06); }
        .hbtn:active { background: rgba(255,255,255,.12); }

        /* ── Backdrop ── */
        .drawer-backdrop {
          position: fixed; inset: 0; z-index: 49;
          background: rgba(4,6,14,.78);
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          animation: bdIn .22s ease both;
        }
        @keyframes bdIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── Drawer panel ── */
        .drawer-panel {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 50;
          width: min(88vw, 340px);
          background: var(--f1-sidebar);
          border-left: 1px solid var(--f1-border-mid);
          display: flex; flex-direction: column;
          overflow-y: auto; overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          animation: drawerIn .28s cubic-bezier(.32,1,.36,1) both;
        }
        @keyframes drawerIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }

        /* ── Drawer links ── */
        .dlink {
          display: flex; align-items: center; gap: 13px;
          padding: 0 24px; height: 50px;
          font-size: 14px; font-weight: 700;
          color: var(--f1-text); text-decoration: none;
          border-bottom: 1px solid var(--f1-border-soft);
          transition: background .15s;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          white-space: nowrap; flex-shrink: 0;
        }
        .dlink:hover  { background: rgba(255,255,255,.04); }
        .dlink:active { background: rgba(255,255,255,.09); }
        .dlink.active { color: #00d484; background: rgba(0,212,132,.07); }

        .drawer-section-title {
          font-size: 9px; font-weight: 800; letter-spacing: .16em;
          text-transform: uppercase; color: var(--f1-muted);
          padding: 14px 24px 5px;
        }

        /* Global touch tweaks */
        a, button { touch-action: manipulation; }
        * { -webkit-tap-highlight-color: transparent; }

        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .35; }
        }
      `}</style>

      {/* ── SKIP LINK ───────────────────────────────────────── */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "sticky", top: 0, left: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 52, padding: "0 8px 0 16px",
          background: "var(--f1-nav)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--f1-border)",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
            minHeight: 44, paddingRight: 8,
          }}
          aria-label="F1 Naija home"
        >
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-.02em", color: "var(--f1-text)" }}>
            F1
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#00d484" }}>
            · Naija
          </span>
        </Link>

        {/* Hamburger */}
        <button
          className="hbtn"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="nav-drawer"
        >
          <HamburgerIcon open={open} />
        </button>
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main
        className="container mx-auto max-w-5xl px-4"
        style={{ paddingBottom: 40 }}
        id="main-content"
      >
        {children}
        <Footer />
      </main>

      {/* ── BACKDROP ─────────────────────────────────────────── */}
      {open && (
        <div
          className="drawer-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── NAVIGATION DRAWER ────────────────────────────────── */}
      {open && (
        <div
          id="nav-drawer"
          className="drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Drawer header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px 14px 24px",
            borderBottom: "1px solid var(--f1-border-mid)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-.02em", color: "var(--f1-text)" }}>F1</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#00d484" }}>· Naija</span>
            </div>
            <button
              className="hbtn"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
            >
              <HamburgerIcon open={true} />
            </button>
          </div>

          {/* Dashboard — always first, highlighted */}
          <Link
            href="/dashboard"
            className={`dlink${pathname === "/dashboard" ? " active" : ""}`}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            style={{
              background: isLive ? "rgba(232,0,31,.07)" : "rgba(0,212,132,.05)",
              borderBottom: `1px solid ${isLive ? "rgba(232,0,31,.14)" : "rgba(0,212,132,.14)"}`,
            }}
            onClick={() => setOpen(false)}
          >
            <span style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: isLive ? "#e8001f" : "#00d484",
              animation: isLive ? "livePulse 1.4s infinite" : "none",
            }} />
            <span style={{ flex: 1 }}>Dashboard</span>
            {isLive && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: ".06em",
                background: "#e8001f", color: "#fff",
                padding: "2px 6px", borderRadius: 4, flexShrink: 0,
              }}>
                LIVE
              </span>
            )}
          </Link>

          {/* Nav groups */}
          {NAV_GROUPS.map(group => (
            <div key={group.title}>
              <div className="drawer-section-title">{group.title}</div>
              {group.links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`dlink${pathname === link.href ? " active" : ""}`}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Social links */}
          <div style={{
            padding: "18px 20px 28px",
            display: "flex", gap: 8, flexWrap: "wrap",
            borderTop: "1px solid var(--f1-border-soft)",
            marginTop: "auto", flexShrink: 0,
          }}>
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 14px", borderRadius: 8, minHeight: 44,
                  background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                  fontSize: 12, fontWeight: 600, color: "var(--f1-muted)",
                  textDecoration: "none", display: "flex", alignItems: "center",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
