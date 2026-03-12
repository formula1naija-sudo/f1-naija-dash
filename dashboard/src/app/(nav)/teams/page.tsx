"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
};

type TeamDriver = {
  driverId: string;
  givenName: string;
  familyName: string;
  code: string;
  permanentNumber: string;
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
  alphatauri:   "#6692FF",
  cadillac:     "#C8AA32",
};

function tColor(id: string) {
  return teamColors[id.toLowerCase()] ?? "#71717a";
}

function positionStyle(pos: string): React.CSSProperties {
  const p = parseInt(pos);
  if (p === 1) return { color: "#f5a724", fontWeight: 900 };
  if (p === 2) return { color: "#a1a1aa", fontWeight: 800 };
  if (p === 3) return { color: "#cd7f32", fontWeight: 800 };
  return { color: "var(--f1-muted)", fontWeight: 600 };
}

export default function TeamsPage() {
  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [drivers, setDrivers] = useState<Record<string, TeamDriver[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json")
        .then(r => r.ok ? r.json() : Promise.reject()),
      fetch("https://api.jolpi.ca/ergast/f1/current/drivers.json?limit=100")
        .then(r => r.ok ? r.json() : Promise.reject()),
    ]).then(([standingsRes, driversRes]) => {
      if (standingsRes.status === "fulfilled") {
        const list: ConstructorStanding[] =
          standingsRes.value?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
        setStandings(list);
      } else {
        setError(true);
      }

      // Build a simple lookup: constructorId → drivers
      // The /drivers endpoint doesn't include constructor; we skip that for now
      // and rely on driverStandings to map drivers → team
      if (driversRes.status === "fulfilled") {
        // Fetch driver standings to get constructor associations
        fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json")
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (!data) return;
            const driverStandings: Array<{
              Driver: { driverId: string; givenName: string; familyName: string; code: string; permanentNumber: string };
              Constructors: { constructorId: string }[];
            }> = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

            const map: Record<string, TeamDriver[]> = {};
            driverStandings.forEach(ds => {
              const constructorId = ds.Constructors?.[0]?.constructorId;
              if (!constructorId) return;
              if (!map[constructorId]) map[constructorId] = [];
              map[constructorId].push({
                driverId:        ds.Driver.driverId,
                givenName:       ds.Driver.givenName,
                familyName:      ds.Driver.familyName,
                code:            ds.Driver.code,
                permanentNumber: ds.Driver.permanentNumber,
              });
            });
            setDrivers(map);
          })
          .catch(() => null);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      {/* ── Page header ── */}
      <section
        aria-label="Teams header"
        style={{
          paddingTop: "clamp(28px,5vw,52px)",
          paddingBottom: "clamp(20px,3vw,36px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 20, height: 1, background: "#00d484" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
            2026 Season
          </span>
        </div>
        <h1 style={{
          fontSize: "clamp(28px,5vw,48px)", fontWeight: 900,
          letterSpacing: "-.025em", lineHeight: .95, margin: 0,
        }}>
          Constructor<br />Standings
        </h1>
        <p style={{ fontSize: 13, color: "var(--f1-muted)", marginTop: 12, lineHeight: 1.6 }}>
          All 11 teams, ranked by championship points.
        </p>
      </section>

      {/* ── Loading ── */}
      {loading && (
        <section aria-label="Loading teams" style={{ paddingTop: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 96, borderRadius: 14,
                  background: "rgba(255,255,255,.04)",
                  animation: "shimmer 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes shimmer {
              0%, 100% { opacity: 1; }
              50%       { opacity: .45; }
            }
          `}</style>
        </section>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <section aria-label="Error state" style={{ paddingTop: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 14, color: "var(--f1-muted)", marginBottom: 20 }}>
            Couldn&apos;t load constructor standings right now.
          </p>
          <button
            onClick={() => { setError(false); setLoading(true); }}
            style={{
              padding: "10px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "rgba(0,212,132,.12)", border: "1px solid rgba(0,212,132,.25)",
              color: "#00d484", cursor: "pointer", minHeight: 44,
            }}
          >
            Try again
          </button>
        </section>
      )}

      {/* ── Team list ── */}
      {!loading && !error && (
        <section aria-label="Constructor standings list" style={{ paddingTop: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {standings.map(entry => {
              const id    = entry.Constructor.constructorId;
              const color = tColor(id);
              const team  = entry.Constructor;
              const teamDrivers = drivers[id] ?? [];

              return (
                <Link
                  key={id}
                  href={`/teams/${id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "var(--f1-card)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 14, padding: "18px 20px",
                    textDecoration: "none", color: "inherit",
                    position: "relative", overflow: "hidden",
                    transition: "border-color .18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                >
                  {/* Left colour bar */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 4, background: color, borderRadius: "14px 0 0 14px",
                  }} />

                  {/* Position */}
                  <div style={{
                    ...positionStyle(entry.position),
                    fontSize: 20, minWidth: 28, textAlign: "center", flexShrink: 0,
                  }}>
                    {entry.position}
                  </div>

                  {/* Team info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 800, color: "var(--f1-text)",
                      marginBottom: 5, letterSpacing: "-.01em",
                    }}>
                      {team.name}
                    </div>
                    {/* Drivers */}
                    {teamDrivers.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {teamDrivers.map(d => (
                          <span
                            key={d.driverId}
                            style={{
                              fontSize: 10, fontWeight: 700,
                              padding: "2px 8px", borderRadius: 20,
                              background: `${color}18`,
                              border: `1px solid ${color}35`,
                              color: color, letterSpacing: ".04em",
                            }}
                          >
                            {d.code || d.familyName.toUpperCase().slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Points + Wins */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--f1-text)", lineHeight: 1 }}>
                      {entry.points}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "var(--f1-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>
                      pts
                    </div>
                    {parseInt(entry.wins) > 0 && (
                      <div style={{ fontSize: 10, color: "#f5a724", fontWeight: 700, marginTop: 4 }}>
                        {entry.wins}W
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div style={{ color: "var(--f1-muted)", fontSize: 14, flexShrink: 0, paddingLeft: 4 }}>›</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── See drivers CTA ── */}
      {!loading && !error && (
        <div style={{
          marginTop: 40, marginBottom: 8,
          background: "rgba(0,212,132,.05)", border: "1px solid rgba(0,212,132,.15)",
          borderRadius: 14, padding: "24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🚗</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)", marginBottom: 6 }}>
            Driver Standings
          </div>
          <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.65, margin: "0 0 16px" }}>
            See where every driver sits in the 2026 championship.
          </p>
          <Link href="/drivers" style={{
            display: "inline-flex", alignItems: "center", padding: "10px 20px",
            borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none",
            minHeight: 44, background: "rgba(0,212,132,.12)",
            border: "1px solid rgba(0,212,132,.25)", color: "#00d484",
          }}>
            View All Drivers →
          </Link>
        </div>
      )}
    </div>
  );
}
