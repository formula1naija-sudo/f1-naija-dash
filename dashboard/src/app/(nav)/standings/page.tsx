"use client";
import { useState, useEffect } from "react";

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

type RaceRetirement = {
  round: number;
  raceName: string;
  driverId: string;
  driverName: string;
  teamId: string;
  teamName: string;
  status: string;
  laps: string;
};

function isDNF(status: string): boolean {
  if (status === "Finished") return false;
  if (/^\+\d+ Lap/.test(status)) return false;
  return true;
}

const STATUS_EMOJI: Record<string, string> = {
  Accident: "💥",
  Collision: "💥",
  "Collision damage": "💥",
  Engine: "🔧",
  Gearbox: "⚙️",
  Hydraulics: "🔧",
  Electrical: "⚡",
  Mechanical: "🔧",
  Brakes: "🛑",
  Suspension: "🔧",
  Clutch: "⚙️",
  Wheel: "🔧",
  "Power Unit": "⚡",
  ERS: "⚡",
  Overheating: "🌡️",
  "Withdrew": "🚫",
  DNF: "🏳️",
  Retired: "🏳️",
  Disqualified: "🚫",
  DNS: "🚫",
};

function getStatusEmoji(status: string): string {
  for (const [key, emoji] of Object.entries(STATUS_EMOJI)) {
    if (status.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "🏳️";
}

const teamColors: { [key: string]: string } = {
  red_bull: "#3671C6",
  mclaren: "#FF8700",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  aston_martin: "#229971",
  alpine: "#0093CC",
  rb: "#6692FF",
  racing_bulls: "#6692FF",
  haas: "#B6BABD",
  williams: "#64C4FF",
  sauber: "#52E252",
  kick_sauber: "#52E252",
  cadillac: "#C8102E",
};

function getTeamColor(constructorId: string): string {
  return teamColors[constructorId] || "#666666";
}

export default function StandingsPage() {
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [retirements, setRetirements] = useState<RaceRetirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drivers" | "constructors" | "retirements">("drivers");
  const [season, setSeason] = useState<string>("");
  const [round, setRound] = useState<string>("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driverRes, constructorRes, resultsRes] = await Promise.all([
          fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json"),
          fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json"),
          fetch("https://api.jolpi.ca/ergast/f1/current/results.json?limit=500"),
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

        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          const races = resultsData?.MRData?.RaceTable?.Races || [];
          const dnfs: RaceRetirement[] = [];
          for (const race of races) {
            const roundNum = parseInt(race.round);
            for (const result of race.Results || []) {
              if (isDNF(result.status)) {
                dnfs.push({
                  round: roundNum,
                  raceName: race.raceName,
                  driverId: result.Driver.driverId,
                  driverName: `${result.Driver.givenName} ${result.Driver.familyName}`,
                  teamId: result.Constructor.constructorId,
                  teamName: result.Constructor.name,
                  status: result.status,
                  laps: result.laps,
                });
              }
            }
          }
          // Sort most recent race first
          setRetirements(dnfs.sort((a, b) => b.round - a.round));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (drivers.length === 0 && constructors.length === 0 && activeTab !== "retirements") {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg">Championship standings unavailable</p>
        <p className="text-sm text-zinc-500">Check back once the season is underway</p>
      </div>
    );
  }

  const maxDriverPoints = parseFloat(drivers[0]?.points || "1");
  const maxConstructorPoints = parseFloat(constructors[0]?.points || "1");

  // Group retirements by round
  const retirementsByRound = retirements.reduce<Record<number, RaceRetirement[]>>((acc, r) => {
    if (!acc[r.round]) acc[r.round] = [];
    acc[r.round].push(r);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-500">
          {season ? `${season} Season${round ? ` — After Round ${round}` : ""}` : "Championship"}
        </p>
        <h1 className="text-3xl font-bold">Championship Standings</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Auto-updated after every race
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("drivers")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "drivers"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Drivers
        </button>
        <button
          onClick={() => setActiveTab("constructors")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "constructors"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Constructors
        </button>
        <button
          onClick={() => setActiveTab("retirements")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "retirements"
              ? "bg-red-700 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          DNFs {retirements.length > 0 && <span className="ml-1 rounded-full bg-red-900/60 px-1.5 py-0.5 text-[10px] text-red-300">{retirements.length}</span>}
        </button>
      </div>

      {/* Driver Standings */}
      {activeTab === "drivers" && (
        <div>
          <div className="mb-2 grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:grid-cols-[2.5rem_3px_1fr_8rem_4rem_3.5rem]">
            <span>Pos</span>
            <span />
            <span>Driver</span>
            <span className="hidden sm:block">Team</span>
            <span className="text-right">Pts</span>
            <span className="text-right">Wins</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {drivers.map((d) => {
              const teamId = d.Constructors?.[0]?.constructorId || "";
              const teamName = d.Constructors?.[0]?.name || "";
              const teamColor = getTeamColor(teamId);
              const barWidth = (parseFloat(d.points) / maxDriverPoints) * 100;
              const isTopThree = parseInt(d.position) <= 3;
              return (
                <div
                  key={d.Driver.driverId}
                  className={`relative grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 overflow-hidden rounded-lg px-3 py-3 sm:grid-cols-[2.5rem_3px_1fr_8rem_4rem_3.5rem] ${
                    isTopThree
                      ? "border border-emerald-900/30 bg-emerald-950/10"
                      : "border border-white/5 bg-white/[0.025]"
                  }`}
                >
                  <div
                    className="absolute top-0 left-0 h-full opacity-[0.07]"
                    style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
                  />
                  <span className={`relative z-10 text-center text-sm font-bold ${isTopThree ? "text-emerald-400" : "text-zinc-500"}`}>
                    {d.position}
                  </span>
                  <div className="relative z-10 h-6 w-[3px] rounded-full" style={{ backgroundColor: teamColor }} />
                  <div className="relative z-10 min-w-0">
                    <span className="text-sm text-zinc-400">{d.Driver.givenName} </span>
                    <span className="text-sm font-bold text-white">{d.Driver.familyName}</span>
                  </div>
                  <span className="relative z-10 hidden truncate text-xs text-zinc-500 sm:block">
                    {teamName}
                  </span>
                  <span className="relative z-10 text-right font-mono text-sm font-bold text-white">
                    {d.points}
                  </span>
                  <span className="relative z-10 text-right font-mono text-sm text-zinc-400">
                    {d.wins}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Constructor Standings */}
      {activeTab === "constructors" && (
        <div>
          <div className="mb-2 grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span>Pos</span>
            <span />
            <span>Constructor</span>
            <span className="text-right">Pts</span>
            <span className="text-right">Wins</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {constructors.map((c) => {
              const teamColor = getTeamColor(c.Constructor.constructorId);
              const barWidth = (parseFloat(c.points) / maxConstructorPoints) * 100;
              const isTopThree = parseInt(c.position) <= 3;
              return (
                <div
                  key={c.Constructor.constructorId}
                  className={`relative grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 overflow-hidden rounded-lg px-3 py-3 ${
                    isTopThree
                      ? "border border-emerald-900/30 bg-emerald-950/10"
                      : "border border-white/5 bg-white/[0.025]"
                  }`}
                >
                  <div
                    className="absolute top-0 left-0 h-full opacity-[0.07]"
                    style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
                  />
                  <span className={`relative z-10 text-center text-sm font-bold ${isTopThree ? "text-emerald-400" : "text-zinc-500"}`}>
                    {c.position}
                  </span>
                  <div className="relative z-10 h-6 w-[3px] rounded-full" style={{ backgroundColor: teamColor }} />
                  <span className="relative z-10 text-sm font-bold text-white">
                    {c.Constructor.name}
                  </span>
                  <span className="relative z-10 text-right font-mono text-sm font-bold text-white">
                    {c.points}
                  </span>
                  <span className="relative z-10 text-right font-mono text-sm text-zinc-400">
                    {c.wins}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DNFs / Retirements Tab */}
      {activeTab === "retirements" && (
        <div>
          {retirements.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-zinc-500">
              <p className="text-lg">No retirements recorded yet</p>
              <p className="text-sm">Data will appear after races complete</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(retirementsByRound)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([roundNum, dnfs]) => (
                  <div key={roundNum}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Round {roundNum} — {dnfs[0].raceName}
                    </h2>
                    <div className="flex flex-col gap-1.5">
                      {dnfs.map((r, i) => {
                        const teamColor = getTeamColor(r.teamId);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2.5"
                          >
                            <div
                              className="h-6 w-[3px] flex-shrink-0 rounded-full"
                              style={{ backgroundColor: teamColor }}
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-bold text-white">{r.driverName}</span>
                              <span className="ml-2 text-xs text-zinc-500">{r.teamName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-base">{getStatusEmoji(r.status)}</span>
                              <span className="text-xs font-medium text-zinc-300">{r.status}</span>
                            </div>
                            <span className="flex-shrink-0 text-[10px] text-zinc-600">L{r.laps}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
