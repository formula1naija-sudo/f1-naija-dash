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

interface LastEventResult {
  position: number;
  driverName: string;
  teamName: string;
  teamId: string;
  value: string;
}

interface LastEventData {
  sessionName: string;
  gpName: string;
  circuit: string;
  date: string;
  results: LastEventResult[];
}

const teamColors: Record<string, string> = {
  mclaren: "#FF8000",
  ferrari: "#EF1A2D",
  red_bull: "#3671C6",
  mercedes: "#27F4D2",
  williams: "#00A0DD",
  aston_martin: "#00594F",
  alpine: "#2173B8",
  haas: "#B6BABD",
  audi: "#C0002A",
  sauber: "#C0002A",
  kick_sauber: "#C0002A",
  racing_bulls: "#6692FF",
  rb: "#6692FF",
  cadillac: "#C8AA32",
};

const positionMedals: Record<string, string> = { "1": "ð¥", "2": "ð¥", "3": "ð¥" };

const categoryColor: Record<string, string> = {
  "Race Weekend": "#e10600",
  "Driver": "#3671C6",
  "Team": "#f5a724",
  "General": "#00d484",
};

// ââ Helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function formatLapTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
}

async function loadRaceResults(
  sessionName: string,
  gpName: string,
  circuit: string,
  date: string,
): Promise<LastEventData | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseJolpi = (d: any): LastEventData | null => {
    const race = d?.MRData?.RaceTable?.Races?.[0];
    if (!race) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: LastEventResult[] = race.Results.slice(0, 3).map((r: any) => ({
      position: parseInt(r.position),
      driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
      teamName: r.Constructor.name,
      teamId: (r.Constructor.constructorId as string).toLowerCase(),
      value:
        r.position === "1"
          ? (r.Time?.time ?? "")
          : r.Time?.time
          ? String(r.Time.time).startsWith("+")
            ? String(r.Time.time)
            : `+${r.Time.time}`
          : "",
    }));
    return {
      sessionName: sessionName || "Race",
      gpName: gpName || race.raceName,
      circuit:
        circuit || `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
      date: date || race.date,
      results,
    };
  };
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
    const result = parseJolpi(await res.json());
    if (result) return result;
    const prevYear = new Date().getFullYear() - 1;
    const res2 = await fetch(
      `https://api.jolpi.ca/ergast/f1/${prevYear}/last/results.json`,
    );
    return parseJolpi(await res2.json());
  } catch {
    return null;
  }
}

async function loadQualiResults(
  sessionName: string,
  gpName: string,
  circuit: string,
  date: string,
): Promise<LastEventData | null> {
  try {
    const res = await fetch(
      "https://api.jolpi.ca/ergast/f1/current/last/qualifying.json",
    );
    if (!res.ok) throw new Error("quali");
    const d = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const race = d?.MRData?.RaceTable?.Races?.[0];
    if (!race) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: LastEventResult[] = race.QualifyingResults.slice(0, 3).map((r: any) => ({
      position: parseInt(r.position),
      driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
      teamName: r.Constructor.name,
      teamId: (r.Constructor.constructorId as string).toLowerCase(),
      value: r.Q3 ?? r.Q2 ?? r.Q1 ?? "",
    }));
    return {
      sessionName,
      gpName: gpName || race.raceName,
      circuit:
        circuit || `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
      date: date || race.date,
      results,
    };
  } catch {
    return null;
  }
}

async function loadPracticeResults(
  sessionKey: number,
  sessionName: string,
  gpName: string,
  circuit: string,
  date: string,
): Promise<LastEventData | null> {
  try {
    const [lapsRes, driversRes] = await Promise.all([
      fetch(
        `https://api.openf1.org/v1/laps?session_key=${sessionKey}&is_pit_out_lap=false`,
      ),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`),
    ]);
    if (!lapsRes.ok || !driversRes.ok) return null;
    const laps = await lapsRes.json();
    const driversArr = await driversRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const driverMap: Record<number, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of driversArr as any[]) driverMap[d.driver_number] = d;
    const bestLaps: Record<number, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const lap of laps as any[]) {
      if (!lap.lap_duration || !lap.driver_number) continue;
      if (
        !bestLaps[lap.driver_number] ||
        lap.lap_duration < bestLaps[lap.driver_number]
      )
        bestLaps[lap.driver_number] = lap.lap_duration;
    }
    const sorted = Object.entries(bestLaps)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3);
    if (!sorted.length) return null;
    const best = sorted[0][1];
    const results: LastEventResult[] = sorted.map(([dn, t], i) => {
      const driver = driverMap[parseInt(dn)];
      const rawTeam = (driver?.team_name ?? "").toLowerCase();
      const teamId = rawTeam.replace(/\s+/g, "_").replace(/[^a-z_]/g, "");
      return {
        position: i + 1,
        driverName: driver
          ? `${driver.first_name} ${driver.last_name}`
          : `#${dn}`,
        teamName: driver?.team_name ?? "",
        teamId,
        value:
          i === 0 ? formatLapTime(t) : `+${(t - best).toFixed(3)}s`,
      };
    });
    return { sessionName, gpName, circuit, date, results };
  } catch {
    return null;
  }
}

async function loadLastEvent(): Promise<LastEventData | null> {
  const year = new Date().getFullYear();
  try {
    const sessRes = await fetch(
      `https://api.openf1.org/v1/sessions?year=${year}`,
    );
    if (!sessRes.ok) throw new Error("sessions");
    const sessions = await sessRes.json();
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completed = (sessions as any[])
      .filter(
        (s) => s.date_end && new Date(s.date_end) < now && s.session_key,
      )
      .sort(
        (a, b) =>
          new Date(b.date_end).getTime() - new Date(a.date_end).getTime(),
      );
    const latest = completed[0];
    if (!latest) throw new Error("none");

    const gpName: string = latest.meeting_name ?? latest.country_name ?? "";
    const circuit: string =
      latest.circuit_short_name ?? latest.country_name ?? "";
    const date: string = (latest.date_start ?? "").split("T")[0];
    const sessionName: string =
      latest.session_name ?? latest.session_type ?? "Session";
    const sessionType: string = (latest.session_type ?? "").toLowerCase();

    if (/^race$/.test(sessionType) || sessionType === "sprint") {
      return loadRaceResults(sessionName, gpName, circuit, date);
    } else if (/qualifying/.test(sessionType)) {
      return loadQualiResults(sessionName, gpName, circuit, date);
    } else {
      // Practice
      const result = await loadPracticeResults(
        latest.session_key,
        sessionName,
        gpName,
        circuit,
        date,
      );
      return result ?? loadRaceResults("Race", "", "", "");
    }
  } catch {
    return loadRaceResults("Race", "", "", "");
  }
}

// ââ Page component ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastEvent, setLastEvent] = useState<LastEventData | null>(null);

  useEffect(() => {
    fetch("/api/news-preview")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setNews(d.items);
      })
      .catch(() => {});

    loadLastEvent()
      .then((d) => {
        if (d) setLastEvent(d);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        background: "var(--f1-bg-page)",
        color: "var(--f1-text)",
        minHeight: "100vh",
      }}
    >
      {/* ââ HERO âââââââââââââââââââââââââââââââââââââââââââ */}
      <HomeHero />

      {/* ââ RACE COUNTDOWN âââââââââââââââââââââââââââââââââ */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <RaceCountdown />
      </div>

      {/* ââ LATEST NEWS ââââââââââââââââââââââââââââââââââââ */}
      {news.length > 0 && (
        <section
          aria-label="Latest F1 news"
          style={{
            padding: "clamp(32px,5vw,52px) 0",
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{ width: 20, height: 1, background: "#f5a724" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "#f5a724",
                  }}
                >
                  Latest news
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px,3.5vw,34px)",
                  fontWeight: 900,
                  letterSpacing: "-.025em",
                  margin: 0,
                }}
              >
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
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "var(--f1-card)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 12,
                  padding: "16px 18px",
                  textDecoration: "none",
                  transition: "border-color .2s",
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia("(hover:hover)").matches)
                    e.currentTarget.style.borderColor =
                      "rgba(245,167,36,.3)";
                }}
                onMouseLeave={(e) => {
                  if (window.matchMedia("(hover:hover)").matches)
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,.07)";
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: categoryColor[item.category] ?? "#00d484",
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: `${categoryColor[item.category] ?? "#00d484"}1a`,
                      border: `1px solid ${categoryColor[item.category] ?? "#00d484"}33`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.category}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--f1-text)",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--f1-muted)",
                      marginTop: 3,
                    }}
                  >
                    {item.source}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--f1-muted)",
                    flexShrink: 0,
                  }}
                >
                  â
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ââ LAST EVENT âââââââââââââââââââââââââââââââââââââ */}
      {lastEvent && (
        <section
          aria-label="Last event result"
          style={{
            padding: "clamp(32px,5vw,52px) 0",
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{ width: 20, height: 1, background: "#e10600" }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "#e10600",
                  }}
                >
                  Last {lastEvent.sessionName}
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px,3.5vw,34px)",
                  fontWeight: 900,
                  letterSpacing: "-.025em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {lastEvent.gpName}
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--f1-muted)",
                  margin: "6px 0 0",
                }}
              >
                {lastEvent.circuit}
                {lastEvent.circuit && lastEvent.date ? " Â· " : ""}
                {lastEvent.date
                  ? new Date(
                      lastEvent.date + "T12:00:00",
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
            <Link
              href="/results"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#00d484",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Full results â
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 12,
            }}
          >
            {lastEvent.results.map((r) => {
              const teamColor = teamColors[r.teamId] ?? "#9ca3af";
              return (
                <div
                  key={r.position}
                  style={{
                    background: "var(--f1-card)",
                    border: `1px solid ${teamColor}33`,
                    borderTop: `3px solid ${teamColor}`,
                    borderRadius: 12,
                    padding: "20px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 22 }}>
                    {positionMedals[String(r.position)] ?? `P${r.position}`}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "var(--f1-text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {r.driverName}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: teamColor,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                    }}
                  >
                    {r.teamName}
                  </div>
                  {r.value && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--f1-muted)",
                        marginTop: 4,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ââ COMMUNITY ââââââââââââââââââââââââââââââââââââââ */}
      <section
        aria-label="Join the community"
        style={{
          padding: "clamp(40px,7vw,72px) 0",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ width: 20, height: 1, background: "#00d484" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "#00d484",
              }}
            >
              The community
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 900,
              letterSpacing: "-.025em",
              lineHeight: 0.95,
              margin: 0,
            }}
          >
            Join 5,000+ Naija
            <br />
            F1 fans.
          </h2>
          <p
            lang="pcm"
            style={{
              fontSize: 13,
              color: "var(--f1-muted)",
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            Oya, join the gang â the biggest Nigerian F1 community online.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 14,
          }}
        >
          {/* Fantasy League */}
          <div
            style={{
              background: "var(--f1-card)",
              border: "1px solid rgba(245,167,36,.2)",
              borderRadius: 14,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 28 }}>ð</div>
            <div
              style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}
            >
              Fantasy League
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--f1-muted)",
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}
            >
              200+ players and counting â pick your drivers, manage your team,
              and top the F1 Naija leaderboard.
            </p>
            <a
              href="https://fantasy.formula1.com/en/leagues/join/C1JYXEPWR10"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                minHeight: 44,
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(245,167,36,.15)",
                border: "1px solid rgba(245,167,36,.3)",
                color: "#f5a724",
                textDecoration: "none",
                letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              Join the League â
            </a>
          </div>

          {/* X Spaces */}
          <div
            style={{
              background: "var(--f1-card)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 14,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 28 }}>ðï¸</div>
            <div
              style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}
            >
              X Spaces
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--f1-muted)",
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}
            >
              Catch our live race reactions on X Spaces â raw takes, qualifying
              analysis, and post-race debates.
            </p>
            <a
              href="https://x.com/f1_naija"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                minHeight: 44,
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "var(--f1-text)",
                textDecoration: "none",
                letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              Follow @f1_naija â
            </a>
          </div>

          {/* Race Day Threads */}
          <div
            style={{
              background: "var(--f1-card)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 14,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 28 }}>ð§µ</div>
            <div
              style={{ fontSize: 15, fontWeight: 800, color: "var(--f1-text)" }}
            >
              Race Day Threads
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--f1-muted)",
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}
            >
              Live race commentary and reactions on X and Threads â follow along
              every race weekend.
            </p>
            <Link
              href="/community"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                minHeight: 44,
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "var(--f1-text)",
                textDecoration: "none",
                letterSpacing: ".03em",
                alignSelf: "flex-start",
              }}
            >
              View Community â
            </Link>
          </div>
        </div>
      </section>

      {/* ââ FOOTER CTA âââââââââââââââââââââââââââââââââââââ */}
      <section
        aria-label="Get started with F1 Naija"
        style={{
          padding: "clamp(32px,5vw,52px) 0",
          borderTop: "1px solid rgba(255,255,255,.06)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "#00d484",
              marginBottom: 10,
            }}
          >
            Built for the culture
          </p>
          <h2
            style={{
              fontSize: "clamp(20px,3vw,30px)",
              fontWeight: 900,
              letterSpacing: "-.02em",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Nigeria&apos;s home for Formula 1.
          </h2>
          <Link
            href="/about"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: "#00d484",
              textDecoration: "none",
            }}
          >
            Read our story â
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  background: "var(--f1-card)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: 20,
                  transition: "border-color .2s",
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia("(hover:hover)").matches)
                    e.currentTarget.style.borderColor =
                      "rgba(0,212,132,.3)";
                }}
                onMouseLeave={(e) => {
                  if (window.matchMedia("(hover:hover)").matches)
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,.07)";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
          <Link
            href="/community"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#00d484",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Join the community â
          </Link>
        </div>
      </section>
    </div>
  );
}

const SOCIAL_LINKS = [
  {
    href: "https://x.com/f1_naija",
    icon: "ð",
    label: "X (Twitter) Â· 6.6K followers",
    handle: "@f1_naija",
  },
  {
    href: "https://www.instagram.com/f1_naija/",
    icon: "ð¸",
    label: "Instagram Â· 5.3K followers",
    handle: "@f1_naija",
  },
  {
    href: "https://www.threads.com/@f1_naija",
    icon: "ð§µ",
    label: "Threads Â· 3K followers",
    handle: "@f1_naija",
  },
  {
    href: "https://www.tiktok.com/@f1.naija",
    icon: "ðµ",
    label: "TikTok",
    handle: "@f1.naija",
  },
];
