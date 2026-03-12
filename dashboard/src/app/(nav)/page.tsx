"use client";

import { useEffect, useState } from "react";
import HomeHero from "@/components/HomeHero";
import RaceCountdown from "@/components/RaceCountdown";
import Link from "next/link";

interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
  category: string;
}

interface PodiumEntry {
  position: string;
  driverName: string;
  constructorName: string;
  constructorId: string;
  time: string;
}

interface LastRaceData {
  raceName: string;
  circuit: string;
  date: string;
  podium: PodiumEntry[];
}

const teamColors: Record<string, string> = {
  mclaren: "#FF8000", ferrari: "#EF1A2D", red_bull: "#3671C6",
  mercedes: "#27F4D2", williams: "#00A0DD", aston_martin: "#00594F",
  alpine: "#2173B8", haas: "#B6BABD", audi: "#C0002A",
  sauber: "#C0002A", kick_sauber: "#C0002A",
  racing_bulls: "#6692FF", rb: "#6692FF",
  cadillac: "#C8AA32",
};

const positionMedals: Record<string, string> = { "1": "🥇", "2": "🥈", "3": "🥉" };

const categoryColor: Record<string, string> = {
  "Race Weekend": "#e10600",
  "Driver": "#3671C6",
  "Team": "#f5a724",
  "General": "#00d484",
};

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastRace, setLastRace] = useState<LastRaceData | null>(null);

  useEffect(() => {
    fetch("/api/news-preview")
      .then(r => r.json())
      .then(d => { if (d.items) setNews(d.items); })
      .catch(() => {});

    // Try current season first; if no races yet (pre-season) fall back to last season
    const parseRace = (d: unknown): boolean => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const race = (d as any)?.MRData?.RaceTable?.Races?.[0];
      if (!race) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const podium: PodiumEntry[] = race.Results.slice(0, 3).map((r: any) => ({
        position: r.position,
        driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
        constructorName: r.Constructor.name,
        constructorId: (r.Constructor.constructorId as string).toLowerCase(),
        time: r.position === "1" ? (r.Time?.time ?? "") : (r.Time?.time ? `+${r.Time.time}` : ""),
      }));
      setLastRace({
        raceName: race.raceName,
        circuit: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
        date: race.date as string,
        podium,
      });
      return true;
    };
    fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json")
      .then(r => r.json())
      .then(d => {
        if (!parseRace(d)) {
          // No races in current season yet — show last race of previous season
          const prevYear = new Date().getFullYear() - 1;
          fetch(`https://api.jolpi.ca/ergast/f1/${prevYear}/last/results.json`)
            .then(r2 => r2.json())
            .then(d2 => parseRace(d2))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

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

          {/* WhatsApp Community — active */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(37,211,102,.25)",
            borderRadius: 14, padding: "24px 22px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 28 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}>WhatsApp Community</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
              Race alerts, score updates, and pure Naija F1 banter — straight to your phone.
            </p>
            <Link
              href="/community"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", minHeight: 44, borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(37,211,102,.15)", border: "1px solid rgba(37,211,102,.35)",
                color: "#25d366", textDecoration: "none", letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              Join Community →
            </Link>
          </div>
        </div>
      </section>

      {/* ── LAST RACE PODIUM ─────────────────────────────── */}
      {lastRace && (
        <section aria-label="Last race result" style={{
          padding: "clamp(32px,5vw,52px) 0",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 1, background: "#e10600" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#e10600" }}>
                  Last race
                </span>
              </div>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900, letterSpacing: "-.025em", margin: 0, lineHeight: 1.1 }}>
                {lastRace.raceName}
              </h2>
              <p style={{ fontSize: 12, color: "var(--f1-muted)", margin: "6px 0 0" }}>
                {lastRace.circuit} · {new Date(lastRace.date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <Link href="/results" style={{
              fontSize: 12, fontWeight: 700, color: "#00d484", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              Full results →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {lastRace.podium.map((p) => {
              const teamColor = teamColors[p.constructorId] ?? "#9ca3af";
              return (
                <div key={p.position} style={{
                  background: "var(--f1-card)",
                  border: `1px solid ${teamColor}33`,
                  borderTop: `3px solid ${teamColor}`,
                  borderRadius: 12, padding: "20px 18px",
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ fontSize: 22 }}>{positionMedals[p.position]}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)", lineHeight: 1.2 }}>{p.driverName}</div>
                  <div style={{ fontSize: 11, color: teamColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                    {p.constructorName}
                  </div>
                  {p.time && (
                    <div style={{ fontSize: 12, color: "var(--f1-muted)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                      {p.time}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── LATEST NEWS ──────────────────────────────────── */}
      {news.length > 0 && (
        <section aria-label="Latest F1 news" style={{
          padding: "clamp(32px,5vw,52px) 0",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 1, background: "#f5a724" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#f5a724" }}>
                  Latest news
                </span>
              </div>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900, letterSpacing: "-.025em", margin: 0 }}>
                F1 Headlines.
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {news.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 12, padding: "16px 18px", textDecoration: "none",
                  transition: "border-color .2s",
                }}
                onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(245,167,36,.3)"; }}
                onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
              >
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                    color: categoryColor[item.category] ?? "#00d484",
                    padding: "3px 8px", borderRadius: 4,
                    background: `${categoryColor[item.category] ?? "#00d484"}1a`,
                    border: `1px solid ${categoryColor[item.category] ?? "#00d484"}33`,
                    whiteSpace: "nowrap",
                  }}>
                    {item.category}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 3 }}>
                    {item.source}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: "var(--f1-muted)", flexShrink: 0 }}>↗</div>
              </a>
            ))}
          </div>
        </section>
      )}

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
