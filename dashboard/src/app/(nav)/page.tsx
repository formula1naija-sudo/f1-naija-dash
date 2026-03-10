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
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <RaceCountdown />
      </div>

      {/* ── HUB GRID ─────────────────────────────────────── */}
      <section style={{ padding: "clamp(40px,7vw,72px) 0 clamp(36px,6vw,60px)" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 20, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Everything F1, one platform
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: 0 }}>
            Your complete<br />F1 headquarters.
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 16,
        }}>
          {HUB_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--f1-card)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 14,
                padding: "26px 24px",
                transition: "border-color .2s, transform .2s",
                cursor: "pointer",
                height: "100%",
              }}
              onMouseEnter={e => {
                if (!window.matchMedia("(hover:hover)").matches) return;
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,212,132,.3)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                if (!window.matchMedia("(hover:hover)").matches) return;
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--f1-border)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em", marginBottom: 6, color: "var(--f1-text)" }}>
                  {item.label}
                </div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
                <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "#00d484", letterSpacing: ".06em" }}>
                  OPEN →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────── */}
      <section style={{
        padding: "56px 0",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "clamp(20px,4vw,40px)",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484", marginBottom: 12 }}>
              Built for the culture
            </p>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, letterSpacing: "-.02em", marginBottom: 16, lineHeight: 1 }}>
              Nigeria&apos;s home<br />for Formula 1.
            </h2>
            <p style={{ fontSize: 14, color: "var(--f1-muted)", lineHeight: 1.75, marginBottom: 16 }}>
              F1 Naija is the #1 Formula 1 platform for Nigerian fans — delivering real-time telemetry,
              live timing, race data, championship standings, and community, all under one roof.
            </p>
            <p style={{ fontSize: 14, color: "var(--f1-muted)", lineHeight: 1.75 }}>
              Lagos. London. Houston. Dubai. Wherever you watch from, F1 Naija keeps you closer to the grid.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px",
                  background: "var(--f1-card)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 10,
                  textDecoration: "none",
                  transition: "border-color .2s",
                }}
                onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
                onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "var(--f1-border)"; }}
              >
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--f1-muted)" }}>{s.handle}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 10, color: "#00d484" }}>↗</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const HUB_ITEMS = [
  {
    href: "/dashboard",
    icon: "📡",
    label: "Live Dashboard",
    desc: "Race-pace telemetry, live gaps, sector times, and tyre data — exactly as it happens on track.",
  },
  {
    href: "/standings",
    icon: "🏆",
    label: "Championship Standings",
    desc: "Driver and constructor standings for the 2026 season, updated the moment each race ends.",
  },
  {
    href: "/schedule",
    icon: "📅",
    label: "Race Calendar",
    desc: "Every round of the 2026 season with session times shown in WAT, GMT, EST, and your local timezone.",
  },
  {
    href: "/news",
    icon: "📰",
    label: "F1 News",
    desc: "The headlines that matter — sourced from BBC Sport, Autosport, The Race, Planet F1, and more.",
  },
  {
    href: "/community",
    icon: "🇳🇬",
    label: "Community",
    desc: "Fantasy leagues, race-day threads, watch parties, and the largest Nigerian F1 fan community online.",
  },
];

const SOCIAL_LINKS = [
  { href: "https://x.com/f1_naija",              icon: "𝕏",  label: "X (Twitter) · 6.6K followers",  handle: "@f1_naija" },
  { href: "https://www.instagram.com/f1_naija/", icon: "📸", label: "Instagram · 5.3K followers",     handle: "@f1_naija" },
  { href: "https://www.threads.com/@f1_naija",   icon: "🧵", label: "Threads · 3K followers",         handle: "@f1_naija" },
  { href: "https://www.tiktok.com/@f1.naija",    icon: "🎵", label: "TikTok",                          handle: "@f1.naija"  },
];
