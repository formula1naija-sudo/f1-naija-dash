"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type RaceResult = {
  position: string;
  points: string;
  Driver: { driverId: string; givenName: string; familyName: string; code: string };
  Constructor: { constructorId: string; name: string };
  status: string;
  Time?: { time: string };
  laps: string;
  grid: string;
};

type Race = {
  round: string;
  raceName: string;
  Circuit: { circuitName: string; Location: { locality: string; country: string } };
  date: string;
  Results: RaceResult[];
};

const teamColors: Record<string, string> = {
  mclaren:      "#FF8000",
  ferrari:      "#EF1A2D",
  red_bull:     "#3671C6",
  mercedes:     "#27F4D2",
  williams:     "#00A0DD",
  aston_martin: "#00594F",
  alpine:       "#2173B8",
  haas:         "#B6BABD",
  audi:         "#C0002A",
  sauber:       "#C0002A",
  kick_sauber:  "#C0002A",
  racing_bulls: "#6692FF",
  rb:           "#6692FF",
};

function teamColor(id: string) {
  return teamColors[id.toLowerCase()] ?? "#71717a";
}

function positionBadgeStyle(pos: string): React.CSSProperties {
  const p = parseInt(pos);
  if (p === 1) return { color: "#f5a724", fontWeight: 900 };
  if (p === 2) return { color: "#a1a1aa", fontWeight: 800 };
  if (p === 3) return { color: "#cd7f32", fontWeight: 800 };
  return { color: "var(--f1-muted)", fontWeight: 600 };
}

export default function ResultsPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.jolpi.ca/ergast/f1/current/results.json?limit=100")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const raceList: Race[] = data?.MRData?.RaceTable?.Races ?? [];
        // Sort newest first
        const sorted = [...raceList].sort((a, b) => parseInt(b.round) - parseInt(a.round));
        setRaces(sorted);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        /* ── Mobile: collapse 6-col results grid to 5 by hiding driver full name ── */
        @media (max-width: 479px) {
          .results-exp-row {
            grid-template-columns: 2rem 2.5rem 1fr auto auto !important;
            gap: 6px !important;
          }
          .results-col-name { display: none !important; }
        }
        /* ── Very small (360px): tighten padding on expanded rows ── */
        @media (max-width: 374px) {
          .results-exp-row { padding: 7px 12px !important; }
          .results-round-btn { padding: 12px 12px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,7vw,72px) 0 clamp(32px,5vw,52px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#e8001f" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#e8001f" }}>
              2026 Season
            </span>
          </div>
          <h1 style={{ lineHeight: .92, margin: "0 0 16px", fontWeight: "inherit" }}>
            <span style={{ display: "block", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              Race
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#e8001f 0%,#f5a724 60%,#e8001f 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Results.
            </span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", margin: 0, lineHeight: 1.6, maxWidth: 400 }}>
            Every race result from the 2026 F1 season — top 10 finishers, fastest laps, and points haul.
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "32px 0 80px" }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 64, borderRadius: 12,
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.06)",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--f1-text)", marginBottom: 6 }}>
              <span lang="pcm">Wahala dey — couldn&apos;t load results.</span>
            </p>
            <p style={{ fontSize: 13, color: "var(--f1-muted)" }}>
              Try refreshing, or check{" "}
              <a href="https://x.com/f1_naija" target="_blank" rel="noopener noreferrer" style={{ color: "#00d484", textDecoration: "none" }}>@f1_naija</a>{" "}
              for updates.
            </p>
          </div>
        )}

        {!loading && !error && races.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 22, marginBottom: 12 }}>🏁</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--f1-text)", marginBottom: 6 }}>
              Season hasn&apos;t started yet
            </p>
            <p style={{ fontSize: 13, color: "var(--f1-muted)" }}>
              Results will appear here once the first race of 2026 is done.
            </p>
            <Link href="/schedule" style={{
              display: "inline-flex", marginTop: 20,
              padding: "10px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "rgba(0,212,132,.1)", border: "1px solid rgba(0,212,132,.25)",
              color: "#00d484", textDecoration: "none", minHeight: 44,
              alignItems: "center",
            }}>
              📅 View Race Schedule
            </Link>
          </div>
        )}

        {!loading && !error && races.map(race => {
          const isOpen = expanded === race.round;
          const top3 = race.Results.slice(0, 3);

          return (
            <div key={race.round} style={{
              background: "var(--f1-card)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 10,
              transition: "border-color .18s",
            }}>
              {/* Round header */}
              <button
                onClick={() => setExpanded(isOpen ? null : race.round)}
                aria-expanded={isOpen}
                className="results-round-btn"
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "2.5rem 1fr auto",
                  alignItems: "center", gap: 14,
                  padding: "14px 16px",
                  background: "transparent", border: "none", color: "inherit",
                }}
              >
                {/* Round number */}
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: "#52525b", letterSpacing: ".04em",
                  textAlign: "center",
                }}>
                  R{race.round}
                </div>

                {/* Race name + date */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)", lineHeight: 1.2 }}>
                    {race.raceName.replace(" Grand Prix", " GP")}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--f1-muted)", marginTop: 2 }}>
                    {new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{race.Circuit.Location.locality}, {race.Circuit.Location.country}
                  </div>
                </div>

                {/* Top 3 pill + expand indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* P1 winner name */}
                  {top3[0] && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: "#f5a724", whiteSpace: "nowrap",
                    }}>
                      {top3[0].Driver.code || top3[0].Driver.familyName}
                    </span>
                  )}
                  <span style={{ color: "var(--f1-muted)", fontSize: 12, lineHeight: 1 }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {/* Full results (expanded) */}
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                  {race.Results.slice(0, 10).map((result, i) => {
                    const tc = teamColor(result.Constructor.constructorId);
                    const isLast = i === Math.min(race.Results.length, 10) - 1;
                    return (
                      <div
                        key={result.position}
                        className="results-exp-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2rem 2.5rem auto 1fr auto auto",
                          alignItems: "center", gap: 10,
                          padding: "8px 16px",
                          borderBottom: !isLast ? "1px solid rgba(255,255,255,.03)" : "none",
                          position: "relative",
                        }}
                      >
                        {/* Team colour accent */}
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: 3, background: tc, borderRadius: "3px 0 0 3px",
                        }} />

                        {/* Position */}
                        <span style={{ ...positionBadgeStyle(result.position), fontSize: 13, textAlign: "center" }}>
                          {result.position}
                        </span>

                        {/* Driver code */}
                        <span style={{ fontSize: 12, fontWeight: 700, color: tc, letterSpacing: ".04em" }}>
                          {result.Driver.code || result.Driver.familyName.slice(0, 3).toUpperCase()}
                        </span>

                        {/* Full name — hidden on narrow screens via .results-col-name */}
                        <span className="results-col-name" style={{ fontSize: 11, color: "var(--f1-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {result.Driver.givenName[0]}. {result.Driver.familyName}
                        </span>

                        {/* Constructor */}
                        <span style={{ fontSize: 10, color: "#52525b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {result.Constructor.name}
                        </span>

                        {/* Laps / status */}
                        <span style={{ fontSize: 10, color: "var(--f1-muted)", whiteSpace: "nowrap" }}>
                          {result.Time?.time ?? result.status}
                        </span>

                        {/* Points */}
                        <span style={{
                          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                          color: parseFloat(result.points) > 0 ? "#f5a724" : "var(--f1-muted)",
                        }}>
                          {result.points}
                          <span style={{ fontSize: 9, fontWeight: 500 }}> pts</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
