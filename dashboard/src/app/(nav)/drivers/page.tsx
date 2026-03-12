"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Driver = {
  driverId: string;
  code: string;
  permanentNumber: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth: string;
};

type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: { constructorId: string; name: string }[];
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
  cadillac:     "#C8AA32",
};

function tColor(id: string) {
  return teamColors[id.toLowerCase()] ?? "#71717a";
}

export default function DriversPage() {
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list: DriverStanding[] = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        setStandings(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>

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
            <div style={{ width: 16, height: 1, background: "#9c50f5" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#9c50f5" }}>
              2026 Grid
            </span>
          </div>
          <h1 style={{ lineHeight: .92, margin: "0 0 16px", fontWeight: "inherit" }}>
            <span style={{ display: "block", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              Driver
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#9c50f5 0%,#c084fc 50%,#9c50f5 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Profiles.
            </span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", margin: 0, lineHeight: 1.6, maxWidth: 400 }}>
            Every driver on the 2026 grid — championship standings, team, and nationality.
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "32px 0 80px" }}>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{
                height: 80, borderRadius: 12,
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.06)",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--f1-text)", marginBottom: 6 }}>
              <span lang="pcm">Wahala dey — couldn&apos;t load drivers.</span>
            </p>
            <p style={{ fontSize: 13, color: "var(--f1-muted)" }}>Try refreshing.</p>
          </div>
        )}

        {!loading && !error && standings.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 22, marginBottom: 12 }}>🏎️</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--f1-text)", marginBottom: 8 }}>
              Season not started yet
            </p>
            <p style={{ fontSize: 13, color: "var(--f1-muted)", marginBottom: 24 }}>
              Driver standings will appear here once the 2026 season kicks off.
            </p>
            <Link href="/schedule" style={{
              display: "inline-flex", padding: "10px 20px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, textDecoration: "none",
              background: "rgba(0,212,132,.1)", border: "1px solid rgba(0,212,132,.25)", color: "#00d484",
            }}>📅 View Schedule</Link>
          </div>
        )}

        {!loading && !error && standings.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 10,
          }}>
            {standings.map(entry => {
              const tc = tColor(entry.Constructors[0]?.constructorId ?? "");
              return (
                <div
                  key={entry.Driver.driverId}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "var(--f1-card)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Team colour bar */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 3, background: tc, borderRadius: "3px 0 0 3px",
                  }} />

                  {/* Position number */}
                  <div style={{
                    fontSize: 20, fontWeight: 900, lineHeight: 1,
                    color: parseInt(entry.position) <= 3 ? "#f5a724" : "var(--f1-muted)",
                    minWidth: 28, textAlign: "center", flexShrink: 0,
                  }}>
                    {entry.position}
                  </div>

                  {/* Driver code badge */}
                  <div style={{
                    fontSize: 11, fontWeight: 900, letterSpacing: ".06em",
                    color: tc, minWidth: 32, flexShrink: 0, textAlign: "center",
                  }}>
                    {entry.Driver.code || entry.Driver.familyName.slice(0, 3).toUpperCase()}
                  </div>

                  {/* Name + team */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "var(--f1-text)",
                      lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {entry.Driver.givenName} {entry.Driver.familyName}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--f1-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.Constructors[0]?.name} · {entry.Driver.nationality}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "var(--f1-text)", lineHeight: 1 }}>
                      {entry.points}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "var(--f1-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>
                      pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Naija Index CTA */}
        {!loading && !error && (
          <div style={{
            marginTop: 40,
            background: "rgba(245,167,36,.06)", border: "1px solid rgba(245,167,36,.18)",
            borderRadius: 14, padding: "24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>⭐</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)", marginBottom: 6 }}>
              See the Naija Driver Index
            </div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.65, margin: "0 0 16px" }}>
              Our community&apos;s own rating system — ranked by how entertaining, skilled, and Naija-approved each driver is.
            </p>
            <Link href="/community" style={{
              display: "inline-flex", alignItems: "center", padding: "10px 20px",
              borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none",
              minHeight: 44, background: "rgba(245,167,36,.15)",
              border: "1px solid rgba(245,167,36,.3)", color: "#f5a724",
            }}>
              View Naija Driver Index →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
