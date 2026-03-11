"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    code: string;
    nationality: string;
  };
  Constructors: {
    constructorId: string;
    name: string;
    nationality: string;
  }[];
};

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


const teamColors: { [key: string]: string } = {
  // 2026 teams
  mclaren:       "#FF8000",
  ferrari:       "#EF1A2D",
  red_bull:      "#3671C6",
  mercedes:      "#27F4D2",
  williams:      "#00A0DD",
  aston_martin:  "#00594F",
  alpine:        "#2173B8",
  haas:          "#B6BABD",
  // Audi replaces Sauber/Kick Sauber — API might use either ID
  audi:          "#C0002A",
  sauber:        "#C0002A",
  kick_sauber:   "#C0002A",
  // Racing Bulls (formerly AlphaTauri / RB)
  racing_bulls:  "#6692FF",
  rb:            "#6692FF",
  alphatauri:    "#6692FF",
  // Cadillac (new 2026 entrant)
  cadillac:      "#C8AA32",
};

function getTeamColor(constructorId: string): string {
  return teamColors[constructorId] || "#666666";
}

export default function StandingsPage() {
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drivers" | "constructors">("drivers");
  const [season, setSeason] = useState<string>("");
  const [round, setRound] = useState<string>("");

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const [driverRes, constructorRes] = await Promise.all([
          fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json"),
          fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json"),
        ]);

        if (driverRes.ok) {
          const driverData = await driverRes.json();
          const standingsList = driverData?.MRData?.StandingsTable?.StandingsLists?.[0];
          if (standingsList) {
            setDrivers(standingsList.DriverStandings || []);
            setSeason(standingsList.season || "");
            setRound(standingsList.round || "");
          }
        }

        if (constructorRes.ok) {
          const constructorData = await constructorRes.json();
          const standingsList = constructorData?.MRData?.StandingsTable?.StandingsLists?.[0];
          if (standingsList) {
            setConstructors(standingsList.ConstructorStandings || []);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const maxDriverPoints = parseFloat(drivers[0]?.points || "1");
  const maxConstructorPoints = parseFloat(constructors[0]?.points || "1");

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes standFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stand-fade { animation: standFadeUp .55s ease both; }
        .stand-fade-1 { animation-delay: .1s; }
        .stand-fade-2 { animation-delay: .25s; }
        .stand-fade-3 { animation-delay: .4s; }
        .stand-row {
          transition: background .18s, border-color .18s;
          -webkit-tap-highlight-color: transparent;
        }
        .stand-row:active { background: rgba(0,212,132,.04) !important; }
        .stand-tab {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>

      {/* ── PAGE HERO ───────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(48px,8vw,80px) 0 clamp(36px,6vw,60px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 20% 40%,rgba(245,167,36,.04) 0%,transparent 60%)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, right: -10,
          fontSize: "clamp(90px,14vw,200px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.012)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none",
          WebkitUserSelect: "none",
        }}>2026</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="stand-fade stand-fade-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#f5a724", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#f5a724" }}>
              {season ? `${season} Season` : "Championship"}{round ? ` · After Round ${round}` : ""}
            </span>
          </div>
          <div className="stand-fade stand-fade-2" style={{ lineHeight: .88 }}>
            <div style={{ fontSize: "clamp(32px,7vw,96px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              Championship
            </div>
            <div style={{
              fontSize: "clamp(32px,7vw,96px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#f5a724 0%,#ffd580 50%,#00d484 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Standings.
            </div>
          </div>
          <p className="stand-fade stand-fade-3" style={{ marginTop: 18, fontSize: 13, color: "var(--f1-muted)", maxWidth: 380 }}>
            Live points tally — auto-updated after every round.
          </p>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div style={{ padding: "32px 0 80px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {(["drivers", "constructors"] as const).map(tab => (
            <button
              key={tab}
              className="stand-tab"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                border: "1px solid",
                cursor: "pointer",
                transition: "all .2s",
                minHeight: 44,
                borderColor: activeTab === tab ? "rgba(0,212,132,.4)" : "rgba(255,255,255,.08)",
                background: activeTab === tab ? "rgba(0,212,132,.08)" : "transparent",
                color: activeTab === tab ? "#00d484" : "var(--f1-muted)",
              }}
            >
              {tab === "drivers" ? "Drivers" : "Constructors"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                height: 56, borderRadius: 10, background: "rgba(255,255,255,.04)",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 60}ms`,
              }} />
            ))}
          </div>
        )}

        {/* No data */}
        {!loading && drivers.length === 0 && constructors.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: 240, gap: 8, color: "var(--f1-muted)",
          }}>
            <div style={{ fontSize: 36 }}>🏎️</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Championship standings unavailable</p>
            <p style={{ fontSize: 12 }}>Check back once the season is underway</p>
          </div>
        )}

        {/* ── DRIVER STANDINGS ── */}
        {!loading && activeTab === "drivers" && drivers.length > 0 && (
          <div>
            {drivers[0] && (() => {
              const d = drivers[0];
              const teamId = d.Constructors?.[0]?.constructorId || "";
              const teamColor = getTeamColor(teamId);
              return (
                <div style={{
                  background: "linear-gradient(135deg,rgba(245,167,36,.08) 0%,rgba(0,212,132,.06) 100%)",
                  border: "1px solid rgba(245,167,36,.25)",
                  borderRadius: 14, padding: "20px", marginBottom: 16,
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: `radial-gradient(circle,${teamColor}33,transparent)`,
                    border: `2px solid ${teamColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 900, color: "#f5a724", flexShrink: 0,
                  }}>1</div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#f5a724", marginBottom: 4 }}>Championship Leader</div>
                    <div style={{ fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, letterSpacing: "-.02em" }}>
                      {d.Driver.givenName} <span style={{ color: "#f5a724" }}>{d.Driver.familyName}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 2 }}>{d.Constructors?.[0]?.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "clamp(28px,6vw,42px)", fontWeight: 900, letterSpacing: "-.04em", color: "#f5a724", lineHeight: 1 }}>{d.points}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--f1-muted)" }}>pts</div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: "grid", gridTemplateColumns: "2.5rem 4px 1fr auto auto", gap: "0 12px", padding: "0 12px 8px", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#52525b" }}>
              <span>Pos</span><span /><span>Driver</span>
              <span style={{ textAlign: "right" }}>Pts</span>
              <span style={{ textAlign: "right" }}>W</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {drivers.map((d) => {
                const teamId = d.Constructors?.[0]?.constructorId || "";
                const teamColor = getTeamColor(teamId);
                const barPct = (parseFloat(d.points) / maxDriverPoints) * 100;
                const pos = parseInt(d.position);
                const isTop3 = pos <= 3;
                return (
                  <Link key={d.Driver.driverId} href={`/drivers/${d.Driver.driverId}`} style={{ textDecoration: "none", display: "block" }}>
                    <div className="stand-row" style={{
                      position: "relative", display: "grid", gridTemplateColumns: "2.5rem 4px 1fr auto auto",
                      gap: "0 12px", alignItems: "center", overflow: "hidden", borderRadius: 10, padding: "12px",
                      border: "1px solid",
                      borderColor: isTop3 ? "rgba(0,212,132,.12)" : "rgba(255,255,255,.05)",
                      background: isTop3 ? "rgba(0,212,132,.04)" : "rgba(255,255,255,.02)",
                      cursor: "pointer",
                    }}>
                      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${barPct}%`, background: teamColor, opacity: .06, transition: "width .8s ease" }} />
                      <div style={{ position: "relative", zIndex: 1, fontSize: 13, fontWeight: 800, textAlign: "center", color: pos === 1 ? "#f5a724" : pos === 2 ? "#c0c8d8" : pos === 3 ? "#cd7f32" : "#52525b" }}>{d.position}</div>
                      <div style={{ position: "relative", zIndex: 1, height: 24, width: 4, borderRadius: 2, background: teamColor, flexShrink: 0 }} />
                      <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "var(--f1-muted)", lineHeight: 1 }}>{d.Driver.givenName}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.Driver.familyName}</div>
                        <div style={{ fontSize: 10, color: "var(--f1-muted)", marginTop: 1, opacity: 0.7 }}>{d.Constructors?.[0]?.name}</div>
                      </div>
                      <div style={{ position: "relative", zIndex: 1, fontFamily: "monospace", fontSize: 14, fontWeight: 700, textAlign: "right", color: "var(--f1-text)" }}>{d.points}</div>
                      <div style={{ position: "relative", zIndex: 1, fontFamily: "monospace", fontSize: 12, textAlign: "right", color: "var(--f1-muted)" }}>{d.wins}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONSTRUCTOR STANDINGS ── */}
        {!loading && activeTab === "constructors" && constructors.length > 0 && (
          <div>
            {constructors[0] && (() => {
              const c = constructors[0];
              const teamColor = getTeamColor(c.Constructor.constructorId);
              return (
                <div style={{
                  background: "linear-gradient(135deg,rgba(245,167,36,.08) 0%,rgba(0,212,132,.06) 100%)",
                  border: "1px solid rgba(245,167,36,.25)",
                  borderRadius: 14, padding: "20px", marginBottom: 16,
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: `radial-gradient(circle,${teamColor}33,transparent)`,
                    border: `2px solid ${teamColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 900, color: "#f5a724", flexShrink: 0,
                  }}>1</div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#f5a724", marginBottom: 4 }}>Championship Leader</div>
                    <div style={{ fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, letterSpacing: "-.02em" }}>
                      <span style={{ color: "#f5a724" }}>{c.Constructor.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 2 }}>{c.Constructor.nationality}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "clamp(28px,6vw,42px)", fontWeight: 900, letterSpacing: "-.04em", color: "#f5a724", lineHeight: 1 }}>{c.points}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--f1-muted)" }}>pts</div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: "grid", gridTemplateColumns: "2.5rem 4px 1fr auto auto", gap: "0 12px", padding: "0 12px 8px", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#52525b" }}>
              <span>Pos</span><span /><span>Constructor</span>
              <span style={{ textAlign: "right" }}>Pts</span>
              <span style={{ textAlign: "right" }}>W</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {constructors.map((c) => {
                const teamColor = getTeamColor(c.Constructor.constructorId);
                const barPct = (parseFloat(c.points) / maxConstructorPoints) * 100;
                const pos = parseInt(c.position);
                const isTop3 = pos <= 3;
                return (
                  <Link key={c.Constructor.constructorId} href={`/teams/${c.Constructor.constructorId}`} style={{ textDecoration: "none", display: "block" }}>
                    <div className="stand-row" style={{
                      position: "relative", display: "grid", gridTemplateColumns: "2.5rem 4px 1fr auto auto",
                      gap: "0 12px", alignItems: "center", overflow: "hidden", borderRadius: 10, padding: "14px 12px",
                      border: "1px solid",
                      borderColor: isTop3 ? "rgba(0,212,132,.12)" : "rgba(255,255,255,.05)",
                      background: isTop3 ? "rgba(0,212,132,.04)" : "rgba(255,255,255,.02)",
                      cursor: "pointer",
                    }}>
                      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${barPct}%`, background: teamColor, opacity: .06 }} />
                      <div style={{ position: "relative", zIndex: 1, fontSize: 13, fontWeight: 800, textAlign: "center", color: pos === 1 ? "#f5a724" : pos === 2 ? "#c0c8d8" : pos === 3 ? "#cd7f32" : "#52525b" }}>{c.position}</div>
                      <div style={{ position: "relative", zIndex: 1, height: 24, width: 4, borderRadius: 2, background: teamColor, flexShrink: 0 }} />
                      <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.Constructor.name}</div>
                        <div style={{ fontSize: 10, color: "var(--f1-muted)", marginTop: 1, opacity: 0.7 }}>{c.Constructor.nationality}</div>
                      </div>
                      <div style={{ position: "relative", zIndex: 1, fontFamily: "monospace", fontSize: 14, fontWeight: 700, textAlign: "right", color: "var(--f1-text)" }}>{c.points}</div>
                      <div style={{ position: "relative", zIndex: 1, fontFamily: "monospace", fontSize: 12, textAlign: "right", color: "var(--f1-muted)" }}>{c.wins}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
