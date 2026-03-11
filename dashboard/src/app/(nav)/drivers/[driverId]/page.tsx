"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ── Types ───────────────────────────────────────────────────── */
type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
    dateOfBirth?: string;
    permanentNumber?: string;
  };
  Constructors: { constructorId: string; name: string }[];
};

type RaceResult = {
  round: string;
  raceName: string;
  date: string;
  Circuit: { circuitId: string; circuitName: string };
  Results: {
    position: string;
    points: string;
    grid: string;
    status: string;
    Time?: { time: string };
    FastestLap?: { rank: string };
  }[];
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
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[80, 56, 56, 56, 56, 56].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 10, background: "rgba(255,255,255,.05)", animation: "skPulse 1.5s ease infinite", animationDelay: `${i * 70}ms` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DriverProfilePage() {
  const { driverId } = useParams<{ driverId: string }>();
  const [standing, setStanding] = useState<DriverStanding | null>(null);
  const [results,  setResults]  = useState<RaceResult[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!driverId) return;
    Promise.all([
      fetch(`${BASE}/current/drivers/${driverId}/driverStandings.json`).then(r => r.ok ? r.json() : null),
      fetch(`${BASE}/current/drivers/${driverId}/results.json?limit=100`).then(r => r.ok ? r.json() : null),
    ])
      .then(([sd, rd]) => {
        const ds: DriverStanding | null = sd?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0] ?? null;
        const races: RaceResult[] = rd?.MRData?.RaceTable?.Races ?? [];
        if (ds) setStanding(ds);
        setResults(races);
        if (!ds && races.length === 0) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [driverId]);

  if (loading) return <Skeleton />;

  if (notFound || (!standing && results.length === 0)) {
    return (
      <div style={{ background: "var(--f1-bg-page)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", color: "var(--f1-muted)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏎️</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--f1-text)", marginBottom: 8 }}>Driver not found</h1>
        <p style={{ fontSize: 13, marginBottom: 24 }}>No 2026 data for &quot;{driverId}&quot;</p>
        <Link href="/standings" style={{ color: "#00d484", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>← Back to Standings</Link>
      </div>
    );
  }

  // Build a minimal standing from results if the API returned no standing yet
  const driver = standing?.Driver ?? {
    driverId,
    code: (driverId ?? "").toUpperCase().slice(0, 3),
    givenName: driverId ?? "",
    familyName: "",
    nationality: "",
    permanentNumber: undefined,
  };
  const team  = standing?.Constructors?.[0];
  const color = teamColor(team?.constructorId ?? "");

  // Derived season stats
  const podiums = results.filter(r => parseInt(r.Results?.[0]?.position ?? "99") <= 3).length;
  const pointsF = results.filter(r => parseInt(r.Results?.[0]?.position ?? "99") <= 10).length;
  const dnfs    = results.filter(r => {
    const s = r.Results?.[0]?.status ?? "";
    return s !== "Finished" && !s.startsWith("+");
  }).length;

  const STATS = [
    { label: "Points",   value: standing?.points ?? "0" },
    { label: "Wins",     value: standing?.wins   ?? "0" },
    { label: "Podiums",  value: String(podiums)         },
    { label: "Points Fin.", value: String(pointsF)      },
    { label: "Races",    value: String(results.length)  },
    { label: "DNFs",     value: String(dnfs)            },
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
        {/* Ambient team-colour glow */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at 100% 50%,${color}12 0%,transparent 60%)`, pointerEvents: "none" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)", backgroundSize: "64px 64px", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)", maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)", pointerEvents: "none" }} />
        {/* Ghost number */}
        {driver.permanentNumber && (
          <div aria-hidden="true" style={{ position: "absolute", bottom: -24, right: -8, fontSize: "clamp(100px,18vw,220px)", fontWeight: 900, color: `${color}18`, lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
            {driver.permanentNumber}
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/standings" className="p-fade" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--f1-muted)", textDecoration: "none", marginBottom: 20, letterSpacing: ".04em" }}>
            ← Standings
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            {/* Number badge */}
            <div className="p-fade" style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg,${color}22,${color}0d)`,
              border: `2px solid ${color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: driver.permanentNumber ? 22 : 14,
              fontWeight: 900, color, animationDelay: ".05s",
            }}>
              {driver.permanentNumber ?? driver.code}
            </div>

            <div>
              {team && (
                <div className="p-fade" style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color, marginBottom: 6, animationDelay: ".08s" }}>
                  <Link href={`/teams/${team.constructorId}`} style={{ color, textDecoration: "none" }}>
                    {team.name}
                  </Link>
                </div>
              )}
              <h1 className="p-fade" style={{ fontSize: "clamp(28px,6vw,64px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: .92, margin: "0 0 10px", animationDelay: ".1s" }}>
                {driver.givenName} <span style={{ color }}>{driver.familyName}</span>
              </h1>
              <div className="p-fade" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", animationDelay: ".15s" }}>
                {driver.code && (
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", padding: "3px 8px", borderRadius: 5, background: "rgba(255,255,255,.07)", color: "var(--f1-text)" }}>
                    {driver.code}
                  </span>
                )}
                {driver.nationality && (
                  <span style={{ fontSize: 12, color: "var(--f1-muted)" }}>{driver.nationality}</span>
                )}
                {standing?.position && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#00d484" }}>
                    P{standing.position} in Championship
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: "28px 0 80px" }}>

        {/* ── SEASON STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 8, marginBottom: 32 }}>
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

        {/* ── RACE RESULTS TABLE ── */}
        {results.length > 0 ? (
          <section aria-label="2026 Race Results">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)", margin: 0 }}>
                2026 Race Results
              </h2>
            </div>

            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "2.2rem 1fr 2.5rem 2.8rem 3rem", gap: "0 10px", padding: "0 12px 8px", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#52525b" }}>
              <span>Rd</span><span>Grand Prix</span>
              <span style={{ textAlign: "center" }}>Grid</span>
              <span style={{ textAlign: "center" }}>Pos</span>
              <span style={{ textAlign: "right" }}>Pts</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {results.map(race => {
                const res = race.Results?.[0];
                if (!res) return null;
                const pos = parseInt(res.position);
                const finished = res.status === "Finished" || res.status.startsWith("+");
                const hasFastestLap = res.FastestLap?.rank === "1";
                const pts = parseFloat(res.points ?? "0");
                return (
                  <div key={race.round} className="res-row" style={{
                    display: "grid", gridTemplateColumns: "2.2rem 1fr 2.5rem 2.8rem 3rem",
                    gap: "0 10px", alignItems: "center",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#52525b" }}>R{race.round}</span>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {race.raceName.replace(" Grand Prix", "").replace(" GP", "")}
                      </div>
                      {!finished && <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>{res.status}</div>}
                      {hasFastestLap && <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700 }}>⚡ Fastest Lap</div>}
                    </div>

                    <span style={{ fontSize: 11, color: "var(--f1-muted)", textAlign: "center" }}>P{res.grid}</span>

                    <span style={{ fontSize: 12, fontWeight: 800, textAlign: "center", color: finished ? posColor(pos) : "#ef4444" }}>
                      {finished ? `P${pos}` : "DNF"}
                    </span>

                    <span style={{ fontSize: 12, fontWeight: 700, textAlign: "right", color: pts > 0 ? "#00d484" : "var(--f1-muted)" }}>
                      {res.points}
                    </span>
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
