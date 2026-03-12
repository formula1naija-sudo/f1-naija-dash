"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ── Types ───────────────────────────────────────────────────── */
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
  code: string;
  givenName: string;
  familyName: string;
  permanentNumber?: string;
  nationality: string;
};

type RaceRound = {
  round: string;
  raceName: string;
  date: string;
  Results: {
    position: string;
    points: string;
    status: string;
    Driver: {
      driverId: string;
      code: string;
      familyName: string;
    };
  }[];
};

/* ── Team profile data ───────────────────────────────────────── */
type TeamProfile = {
  base: string;
  founded: string;
  championships: string;
  tagline: string;
  flag: string;
};

const TEAM_PROFILES: Record<string, TeamProfile> = {
  mclaren: {
    flag: "🇬🇧",
    base: "Woking, Surrey, UK",
    founded: "1963",
    championships: "8 Constructors · 12 Drivers",
    tagline: "One of F1's most iconic teams. Home to Senna, Prost, and Hamilton. The papaya orange is back and faster than ever.",
  },
  ferrari: {
    flag: "🇮🇹",
    base: "Maranello, Italy",
    founded: "1950",
    championships: "16 Constructors · 15 Drivers",
    tagline: "The most successful constructor in F1 history. The Scuderia is the soul of the sport — no team carries more history or passion.",
  },
  red_bull: {
    flag: "🇦🇹",
    base: "Milton Keynes, UK",
    founded: "2005",
    championships: "6 Constructors · 5 Drivers",
    tagline: "The team that redefined F1 dominance. Four straight titles with Vettel, then Verstappen's back-to-back era that swept all before it.",
  },
  mercedes: {
    flag: "🇩🇪",
    base: "Brackley, UK",
    founded: "2010",
    championships: "8 Constructors · 9 Drivers",
    tagline: "Eight consecutive constructors' titles from 2014–2021. The Silver Arrows built the most dominant dynasty in the sport's modern era.",
  },
  williams: {
    flag: "🇬🇧",
    base: "Grove, Oxfordshire, UK",
    founded: "1977",
    championships: "9 Constructors · 7 Drivers",
    tagline: "A proud independent with a glorious past — Mansell, Prost, Hill, and Villeneuve all won the drivers' title here. Now rebuilding.",
  },
  aston_martin: {
    flag: "🇬🇧",
    base: "Silverstone, UK",
    founded: "2021",
    championships: "0",
    tagline: "Racing royalty reborn. The Silverstone-based squad — formerly Force India and Racing Point — relaunched under the iconic Aston Martin name with Fernando Alonso leading the charge.",
  },
  alpine: {
    flag: "🇫🇷",
    base: "Enstone, UK · Viry-Châtillon, France",
    founded: "2021",
    championships: "2 Constructors (as Renault) · 2 Drivers (as Renault)",
    tagline: "The French works team. The Enstone factory has built race-winning cars since the Benetton era. Now chasing a return to glory under the Alpine banner.",
  },
  haas: {
    flag: "🇺🇸",
    base: "Kannapolis, North Carolina, USA",
    founded: "2016",
    championships: "0",
    tagline: "America's home in F1. Gene Haas built the grid's only US-based team from scratch — a true independent operating from the heart of NASCAR country.",
  },
  audi: {
    flag: "🇨🇭",
    base: "Hinwil, Switzerland",
    founded: "1993 (as Sauber)",
    championships: "0",
    tagline: "Sauber's legendary Swiss operation now rebranded under Audi. One of F1's most respected technical academies — the factory that launched Räikkönen, Massa, and Hamilton's junior career.",
  },
  sauber: {
    flag: "🇨🇭",
    base: "Hinwil, Switzerland",
    founded: "1993",
    championships: "0",
    tagline: "The storied Swiss team transitioning to full Audi works status. A technical powerhouse that has launched some of F1's greatest careers.",
  },
  kick_sauber: {
    flag: "🇨🇭",
    base: "Hinwil, Switzerland",
    founded: "1993 (as Sauber)",
    championships: "0",
    tagline: "The storied Swiss team in transition to full Audi works status. A technical powerhouse that has launched some of F1's greatest careers.",
  },
  racing_bulls: {
    flag: "🇮🇹",
    base: "Faenza, Italy",
    founded: "2006 (as Toro Rosso)",
    championships: "0",
    tagline: "Red Bull's Italian sister team — the proving ground for future champions. Vettel, Verstappen, and Ricciardo all came through the Faenza factory.",
  },
  rb: {
    flag: "🇮🇹",
    base: "Faenza, Italy",
    founded: "2006 (as Toro Rosso)",
    championships: "0",
    tagline: "Red Bull's Italian sister team — the proving ground for future champions. Vettel, Verstappen, and Ricciardo all came through the Faenza factory.",
  },
  alphatauri: {
    flag: "🇮🇹",
    base: "Faenza, Italy",
    founded: "2006 (as Toro Rosso)",
    championships: "0",
    tagline: "Red Bull's Italian sister team — the proving ground for future champions. Vettel, Verstappen, and Ricciardo all came through the Faenza factory.",
  },
  cadillac: {
    flag: "🇺🇸",
    base: "Indianapolis, Indiana, USA",
    founded: "2026",
    championships: "0",
    tagline: "The newest team in the paddock. General Motors and Cadillac bring American muscle back to F1 for the first time since 2004 — built on the foundation of Andretti Global.",
  },
};

/* ── Helpers ─────────────────────────────────────────────────── */
const TEAM_COLORS: Record<string, string> = {
  mclaren: "#FF8000", ferrari: "#EF1A2D", red_bull: "#3671C6",
  mercedes: "#27F4D2", williams: "#00A0DD", aston_martin: "#00594F",
  alpine: "#2173B8", haas: "#B6BABD", audi: "#C0002A",
  sauber: "#C0002A", kick_sauber: "#C0002A",
  racing_bulls: "#6692FF", rb: "#6692FF", alphatauri: "#6692FF",
  cadillac: "#C8AA32",
};
const teamColor = (id: string) => TEAM_COLORS[id] ?? "#666";

function posColor(pos: number) {
  if (pos === 1) return "#f5a724";
  if (pos === 2) return "#c0c8d8";
  if (pos === 3) return "#cd7f32";
  if (pos <= 10) return "#00d484";
  return "var(--f1-muted)";
}

const BASE = "https://api.jolpi.ca/ergast/f1";

/* ── Skeleton ────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: "var(--f1-bg-page)", minHeight: "100vh", padding: "40px 0" }}>
      <style>{`@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      {[80, 56, 56, 56, 56, 56].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 10, background: "rgba(255,255,255,.05)", animation: "skPulse 1.5s ease infinite", animationDelay: `${i * 70}ms`, marginBottom: 10 }} />
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function TeamProfilePage() {
  const { constructorId } = useParams<{ constructorId: string }>();
  const [standing, setStanding] = useState<ConstructorStanding | null>(null);
  const [drivers,  setDrivers]  = useState<TeamDriver[]>([]);
  const [races,    setRaces]    = useState<RaceRound[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!constructorId) return;
    Promise.all([
      fetch(`${BASE}/current/constructors/${constructorId}/constructorStandings.json`).then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/current/constructors/${constructorId}/drivers.json`).then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/current/constructors/${constructorId}/results.json?limit=100`).then(r => r.ok ? r.json() : null),
    ])
      .then(([sd, dd, rd]) => {
        const cs: ConstructorStanding | null = sd?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0] ?? null;
        const dvs: TeamDriver[] = dd?.MRData?.DriverTable?.Drivers ?? [];
        const rs: RaceRound[]   = rd?.MRData?.RaceTable?.Races ?? [];

        if (cs)  setStanding(cs);
        if (dvs) setDrivers(dvs);
        if (rs)  setRaces(rs);

        if (!cs && rs.length === 0 && dvs.length === 0) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [constructorId]);

  if (loading) return <Skeleton />;

  if (notFound || (!standing && races.length === 0)) {
    return (
      <div style={{ background: "var(--f1-bg-page)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", color: "var(--f1-muted)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏎️</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--f1-text)", marginBottom: 8 }}>Team not found</h1>
        <p style={{ fontSize: 13, marginBottom: 24 }}>No 2026 data for &quot;{constructorId}&quot;</p>
        <Link href="/standings" style={{ color: "#00d484", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>← Back to Standings</Link>
      </div>
    );
  }

  const name  = standing?.Constructor.name ?? constructorId;
  const color = teamColor(constructorId ?? "");

  // Per-driver totals from race results
  const driverTotals: Record<string, { points: number; wins: number; podiums: number; races: number }> = {};
  for (const race of races) {
    for (const res of race.Results ?? []) {
      const id = res.Driver.driverId;
      if (!driverTotals[id]) driverTotals[id] = { points: 0, wins: 0, podiums: 0, races: 0 };
      const pts = parseFloat(res.points ?? "0");
      const pos = parseInt(res.position ?? "99");
      driverTotals[id].points  += pts;
      driverTotals[id].races   += 1;
      if (pos === 1) driverTotals[id].wins    += 1;
      if (pos <= 3)  driverTotals[id].podiums += 1;
    }
  }

  const STATS = [
    { label: "Points", value: standing?.points ?? "0" },
    { label: "Wins",   value: standing?.wins   ?? "0" },
    { label: "Pos",    value: standing ? `P${standing.position}` : "—" },
    { label: "Races",  value: String(races.length) },
  ];

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes profUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .p-fade { animation: profUp .45s ease both; }
        .res-row { transition: background .15s; border-radius: 8px; }
        @media(hover:hover){ .res-row:hover{ background: rgba(255,255,255,.05) !important; } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <header style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,6vw,64px) 0 clamp(28px,4vw,44px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 80% at 100% 50%,${color}10 0%,transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)", backgroundSize: "64px 64px", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)", maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -24, right: -8, fontSize: "clamp(60px,12vw,160px)", fontWeight: 900, color: `${color}14`, lineHeight: 1, pointerEvents: "none", userSelect: "none", textTransform: "uppercase", letterSpacing: "-.04em" }}>
          {(constructorId ?? "").replace(/_/g, " ")}
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/standings" className="p-fade" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--f1-muted)", textDecoration: "none", marginBottom: 20, letterSpacing: ".04em" }}>
            ← Standings
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            {/* Color swatch */}
            <div className="p-fade" style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg,${color}33,${color}11)`,
              border: `2px solid ${color}66`,
              animationDelay: ".05s",
            }} />

            <div>
              <div className="p-fade" style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 6, animationDelay: ".08s" }}>
                {standing?.Constructor.nationality ?? "—"}
              </div>
              <h1 className="p-fade" style={{ fontSize: "clamp(28px,6vw,64px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: .92, margin: "0 0 10px", animationDelay: ".1s" }}>
                <span style={{ color }}>{name}</span>
              </h1>
              {standing && (
                <div className="p-fade" style={{ fontSize: 12, fontWeight: 700, color: "#f5a724", animationDelay: ".15s" }}>
                  P{standing.position} in Championship · {standing.points} pts
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: "28px 0 80px" }}>

        {/* ── PROFILE ── */}
        {TEAM_PROFILES[constructorId ?? ""] && (() => {
          const p = TEAM_PROFILES[constructorId!];
          return (
            <div className="p-fade" style={{
              background: `linear-gradient(135deg,${color}08,transparent)`,
              border: `1px solid ${color}22`,
              borderRadius: 14, padding: "20px 22px", marginBottom: 16,
              animationDelay: ".18s",
            }}>
              <p style={{ fontSize: 13, color: "var(--f1-text)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                &ldquo;{p.tagline}&rdquo;
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
                {[
                  { label: "Base",          value: `${p.flag} ${p.base}` },
                  { label: "Est.",          value: p.founded },
                  { label: "Titles",        value: p.championships },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--f1-text)" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 8, marginBottom: 28 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 12, padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 900, letterSpacing: "-.03em", color: "var(--f1-text)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--f1-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── DRIVERS ── */}
        {drivers.length > 0 && (
          <section style={{ marginBottom: 28 }} aria-label="Team Drivers">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)", margin: 0 }}>
                2026 Drivers
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {drivers.map(d => {
                const totals = driverTotals[d.driverId];
                return (
                  <Link key={d.driverId} href={`/drivers/${d.driverId}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "var(--f1-card)", border: `1px solid ${color}33`,
                      borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12,
                      transition: "border-color .2s",
                    }}
                    onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) (e.currentTarget as HTMLDivElement).style.borderColor = `${color}66`; }}
                    onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) (e.currentTarget as HTMLDivElement).style.borderColor = `${color}33`; }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg,${color}22,${color}0d)`,
                        border: `2px solid ${color}55`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 900, color,
                      }}>
                        {d.permanentNumber ?? d.code}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "var(--f1-muted)", lineHeight: 1 }}>{d.givenName}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--f1-text)", letterSpacing: "-.01em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.familyName}</div>
                        {totals && (
                          <div style={{ fontSize: 10, color: "#00d484", marginTop: 3, fontWeight: 700 }}>
                            {totals.points} pts · {totals.wins}W · {totals.podiums} podiums
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── RACE RESULTS (grouped by round) ── */}
        {races.length > 0 ? (
          <section aria-label="2026 Race Results">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)", margin: 0 }}>
                2026 Race Results
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {races.map(race => {
                const roundPts = (race.Results ?? []).reduce((sum, r) => sum + parseFloat(r.points ?? "0"), 0);
                return (
                  <div key={race.round} className="res-row" style={{
                    background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)",
                    borderRadius: 10, padding: "12px",
                  }}>
                    {/* Race header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#52525b" }}>R{race.round}</span>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>
                          {race.raceName.replace(" Grand Prix", "").replace(" GP", "")}
                        </span>
                      </div>
                      {roundPts > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#00d484" }}>
                          +{roundPts} pts
                        </span>
                      )}
                    </div>

                    {/* Driver results */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {(race.Results ?? []).map(res => {
                        const pos = parseInt(res.position ?? "99");
                        const finished = res.status === "Finished" || res.status.startsWith("+");
                        const pts = parseFloat(res.points ?? "0");
                        return (
                          <div key={res.Driver.driverId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800, minWidth: 28, textAlign: "center",
                              color: finished ? posColor(pos) : "#ef4444",
                            }}>
                              {finished ? `P${pos}` : "DNF"}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--f1-muted)", flex: 1 }}>
                              {res.Driver.familyName}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: pts > 0 ? "#00d484" : "#52525b", minWidth: 28, textAlign: "right" }}>
                              {res.points}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--f1-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏁</div>
            <p>No race results yet — season hasn&apos;t started.</p>
          </div>
        )}

      </div>
    </div>
  );
}
