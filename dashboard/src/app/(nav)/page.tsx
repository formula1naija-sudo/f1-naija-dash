"use client";

import HomeHero from "@/components/HomeHero";
import RaceCountdown from "@/components/RaceCountdown";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <HomeHero />

      {/* ── RACE COUNTDOWN ───────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <RaceCountdown />
      </div>

      {/* ── COMMUNITY ────────────────────────────────────── */}
      <section aria-label="Join the community" style={{
        padding: "clamp(40px,7vw,72px) 0",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 20, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              The community
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: 0 }}>
            Join 5,000+ Naija<br />F1 fans.
          </h2>
          <p lang="pcm" style={{ fontSize: 13, color: "var(--f1-muted)", marginTop: 12, lineHeight: 1.6 }}>
            Oya, join the gang — the biggest Nigerian F1 community online.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
        }}>
          {/* Fantasy League */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(245,167,36,.2)",
            borderRadius: 14, padding: "24px 22px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 28 }}>🏆</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}>Fantasy League</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
              200+ players and counting — pick your drivers, manage your team, and top the F1 Naija leaderboard.
            </p>
            <a
              href="https://fantasy.formula1.com/en/leagues/join/C1JYXEPWR10"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", minHeight: 44, borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(245,167,36,.15)", border: "1px solid rgba(245,167,36,.3)",
                color: "#f5a724", textDecoration: "none", letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              Join the League →
            </a>
          </div>

          {/* X Spaces */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14, padding: "24px 22px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 28 }}>🎙️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}>X Spaces</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
              Catch our live race reactions on X Spaces — raw takes, qualifying analysis, and post-race debates.
            </p>
            <a
              href="https://x.com/f1_naija"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", minHeight: 44, borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                color: "var(--f1-text)", textDecoration: "none", letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              Follow @f1_naija →
            </a>
          </div>

          {/* Watch Parties */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(0,212,132,.15)",
            borderRadius: 14, padding: "24px 22px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 28 }}>🇳🇬</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}>Lagos Watch Parties</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
              We host Lagos watch parties on race weekends. Follow us for the next event announcement.
            </p>
            <a
              href="https://www.instagram.com/f1_naija/"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", minHeight: 44, borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(0,212,132,.12)", border: "1px solid rgba(0,212,132,.25)",
                color: "#00d484", textDecoration: "none", letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              Instagram ↗
            </a>
          </div>

          {/* Race Day Threads */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14, padding: "24px 22px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 28 }}>🧵</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}>Race Day Threads</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
              Live race commentary and reactions on X and Threads — follow along every race weekend.
            </p>
            <Link
              href="/community"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", minHeight: 44, borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                color: "var(--f1-text)", textDecoration: "none", letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              View Community →
            </Link>
          </div>

          {/* WhatsApp Community — coming soon */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(37,211,102,.18)",
            borderRadius: 14, padding: "24px 22px",
            display: "flex", flexDirection: "column", gap: 10,
            opacity: 0.65,
          }}>
            <div style={{ fontSize: 28 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}>WhatsApp Community</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
              Race alerts, score updates, and pure Naija F1 banter — straight to your phone. Coming soon!
            </p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700,
              background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
              color: "var(--f1-muted)", letterSpacing: ".03em",
              alignSelf: "flex-start", cursor: "not-allowed",
            }}>
              Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────── */}
      <section aria-label="Get started with F1 Naija" style={{
        padding: "clamp(32px,5vw,52px) 0",
        borderTop: "1px solid rgba(255,255,255,.06)",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 24,
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484", marginBottom: 10 }}>
            Built for the culture
          </p>
          <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1.1, marginBottom: 12 }}>
            Nigeria&apos;s home for Formula 1.
          </h2>
          <Link href="/about" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 700, color: "#00d484", textDecoration: "none",
          }}>
            Read our story →
          </Link>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 16px", minHeight: 44,
                background: "var(--f1-card)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 10, textDecoration: "none",
                transition: "border-color .2s",
              }}
              onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
              onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "var(--f1-border)"; }}
            >
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--f1-muted)" }}>{s.handle}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

const SOCIAL_LINKS = [
  { href: "https://x.com/f1_naija",              icon: "𝕏",  label: "X (Twitter) · 6.6K followers",  handle: "@f1_naija" },
  { href: "https://www.instagram.com/f1_naija/", icon: "📸", label: "Instagram · 5.3K followers",     handle: "@f1_naija" },
  { href: "https://www.threads.com/@f1_naija",   icon: "🧵", label: "Threads · 3K followers",         handle: "@f1_naija" },
  { href: "https://www.tiktok.com/@f1.naija",    icon: "🎵", label: "TikTok",                          handle: "@f1.naija"  },
];
