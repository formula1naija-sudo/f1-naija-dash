"use client";

import { type ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

// ── Theme toggle ────────────────────────────────────────────
type Theme = "dark" | "light" | "system";
const THEME_KEY = "f1-naija-theme";

function getIsDark(theme: Theme) {
  if (theme === "system" && typeof window !== "undefined")
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme !== "light";
}

function applyTheme(theme: Theme) {
  const dark = getIsDark(theme);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as Theme) ?? "dark";
    setThemeState(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
  };

  return { theme, setTheme, mounted, isDark: mounted ? getIsDark(theme) : true };
}

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
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/about",      label: "About F1 Naija",  icon: "ℹ️"  },
      { href: "/help",       label: "Help",            icon: "❓" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    href: "https://x.com/f1_naija",
    label: "X (Twitter)",
    color: "#fff",
    bg: "rgba(255,255,255,.08)",
    border: "rgba(255,255,255,.14)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/f1_naija/",
    label: "Instagram",
    color: "#e1306c",
    bg: "rgba(225,48,108,.1)",
    border: "rgba(225,48,108,.25)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/>
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@f1.naija",
    label: "TikTok",
    color: "#fff",
    bg: "rgba(255,255,255,.08)",
    border: "rgba(255,255,255,.14)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z"/>
      </svg>
    ),
  },
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
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);
  const isLive          = useIsLiveSession();
  const { theme, setTheme, mounted, isDark } = useTheme();

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
            textDecoration: "none", display: "flex", alignItems: "center",
            minHeight: 44, paddingRight: 8,
          }}
          aria-label="F1 Naija home"
        >
          <Image src="/tag-logo.png" alt="F1 Naija" width={36} height={36}
            className="f1-logo-img"
            style={{ objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(0,212,132,0.3))" }}
          />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Theme toggle */}
          {mounted && (
            <button
              className="hbtn"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                /* Sun */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                /* Moon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
                </svg>
              )}
            </button>
          )}
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
        </div>
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
            padding: "10px 16px 10px 20px",
            borderBottom: "1px solid var(--f1-border-mid)",
            flexShrink: 0,
          }}>
            <Image src="/tag-logo.png" alt="F1 Naija" width={44} height={44}
              className="f1-logo-img"
              style={{ objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(0,212,132,0.3))" }}
            />
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

          {/* Theme switcher — Twitter style */}
          {mounted && (
            <div style={{
              padding: "14px 20px 16px",
              borderTop: "1px solid var(--f1-border-soft)",
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 10 }}>
                Appearance
              </div>
              <div style={{
                display: "flex", gap: 6,
                background: "var(--f1-panel)", border: "1px solid var(--f1-border)",
                borderRadius: 12, padding: 4,
              }}>
                {(["dark", "light", "system"] as Theme[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
                      transition: "background .15s, color .15s",
                      background: theme === t ? (t === "light" ? "#f3f4f7" : "#1a1f2e") : "transparent",
                      color: theme === t ? (t === "light" ? "#0f172a" : "#edf2ff") : "var(--f1-muted)",
                      boxShadow: theme === t ? "0 1px 4px rgba(0,0,0,.25)" : "none",
                    }}
                  >
                    {t === "dark" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
                      </svg>
                    )}
                    {t === "light" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4"/>
                        <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                      </svg>
                    )}
                    {t === "system" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    )}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          <div style={{
            padding: "16px 20px 28px",
            borderTop: "1px solid var(--f1-border-soft)",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 10 }}>
              Follow us
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  style={{
                    width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                    background: s.bg, border: `1px solid ${s.border}`,
                    color: s.color,
                    textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform .15s, filter .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.25)"; e.currentTarget.style.transform = "scale(1.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
