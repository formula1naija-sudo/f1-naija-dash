"use client";

import { useState, useMemo } from "react";

type Driver = {
  name: string;
  team: string;
  teamColor: string;
  nationality: string;
  flag: string;
  number: number;
  naijaRating: number;
  categories: {
    pace: number;
    racecraft: number;
    consistency: number;
    hype: number;
    potential: number;
  };
  verdict: string;
  status: "🔥 Hot" | "📈 Rising" | "😐 Mid" | "📉 Struggling" | "👀 Watch" | "🆕 Rookie";
};

const DRIVERS_2026: Driver[] = [
  // ── McLAREN ─────────────────────────────────────────────────────
  {
    name: "Lando Norris",
    team: "McLaren",
    teamColor: "#FF8000",
    nationality: "British",
    flag: "🇬🇧",
    number: 1,
    naijaRating: 9,
    categories: { pace: 9, racecraft: 9, consistency: 9, hype: 10, potential: 10 },
    verdict: "2025 World Champion! Naija fans don adopt am as our guy. Him carry the #1 with swag — make e defend am well.",
    status: "🔥 Hot",
  },
  {
    name: "Oscar Piastri",
    team: "McLaren",
    teamColor: "#FF8000",
    nationality: "Australian",
    flag: "🇦🇺",
    number: 81,
    naijaRating: 8,
    categories: { pace: 9, racecraft: 8, consistency: 9, hype: 7, potential: 10 },
    verdict: "Quietly menacing. This boy dey score points like breathing — the next superstar dey rise.",
    status: "📈 Rising",
  },
  // ── MERCEDES ────────────────────────────────────────────────────
  {
    name: "George Russell",
    team: "Mercedes",
    teamColor: "#27F4D2",
    nationality: "British",
    flag: "🇬🇧",
    number: 63,
    naijaRating: 7,
    categories: { pace: 8, racecraft: 8, consistency: 9, hype: 6, potential: 8 },
    verdict: "Underrated and understated. If that silver car give am tools, e go surprise everybody.",
    status: "👀 Watch",
  },
  {
    name: "Kimi Antonelli",
    team: "Mercedes",
    teamColor: "#27F4D2",
    nationality: "Italian",
    flag: "🇮🇹",
    number: 12,
    naijaRating: 7,
    categories: { pace: 8, racecraft: 7, consistency: 7, hype: 8, potential: 10 },
    verdict: "The chosen one wey Mercedes hand-picked. Baby driver but potential dey off the charts — watch closely.",
    status: "🆕 Rookie",
  },
  // ── FERRARI ─────────────────────────────────────────────────────
  {
    name: "Charles Leclerc",
    team: "Ferrari",
    teamColor: "#EF1A2D",
    nationality: "Monégasque",
    flag: "🇲🇨",
    number: 16,
    naijaRating: 8,
    categories: { pace: 9, racecraft: 8, consistency: 7, hype: 8, potential: 9 },
    verdict: "Fast like electricity but occasional blunder dey pain Naija fans. Biko sort your qualifying head.",
    status: "📈 Rising",
  },
  {
    name: "Lewis Hamilton",
    team: "Ferrari",
    teamColor: "#EF1A2D",
    nationality: "British",
    flag: "🇬🇧",
    number: 44,
    naijaRating: 9,
    categories: { pace: 9, racecraft: 10, consistency: 8, hype: 10, potential: 8 },
    verdict: "The GOAT debate don reach Maranello. Ferrari red on Lewis Hamilton is cinema — make we see the magic.",
    status: "🔥 Hot",
  },
  // ── RED BULL ────────────────────────────────────────────────────
  {
    name: "Max Verstappen",
    team: "Red Bull Racing",
    teamColor: "#3671C6",
    nationality: "Dutch",
    flag: "🇳🇱",
    number: 3,
    naijaRating: 9,
    categories: { pace: 10, racecraft: 10, consistency: 9, hype: 8, potential: 9 },
    verdict: "Four-time champion wey dey operate on a different level. E lost the title but underestimate am at your own risk.",
    status: "🔥 Hot",
  },
  {
    name: "Isack Hadjar",
    team: "Red Bull Racing",
    teamColor: "#3671C6",
    nationality: "French",
    flag: "🇫🇷",
    number: 6,
    naijaRating: 6,
    categories: { pace: 8, racecraft: 7, consistency: 7, hype: 6, potential: 9 },
    verdict: "Big shoes to fill at Red Bull. French-Algerian rookie with fire in his belly — the pressure go test am.",
    status: "🆕 Rookie",
  },
  // ── WILLIAMS ────────────────────────────────────────────────────
  {
    name: "Carlos Sainz",
    team: "Williams",
    teamColor: "#00A0DD",
    nationality: "Spanish",
    flag: "🇪🇸",
    number: 55,
    naijaRating: 7,
    categories: { pace: 8, racecraft: 8, consistency: 8, hype: 6, potential: 7 },
    verdict: "E go squeeze every drop from the Williams. This man never give up in his life — respect must be given.",
    status: "👀 Watch",
  },
  {
    name: "Alexander Albon",
    team: "Williams",
    teamColor: "#00A0DD",
    nationality: "Thai",
    flag: "🇹🇭",
    number: 23,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 8, consistency: 8, hype: 6, potential: 7 },
    verdict: "Mr. Points from nowhere. Him dey extract magic from midfield machinery — quiet but dependable.",
    status: "😐 Mid",
  },
  // ── ASTON MARTIN ────────────────────────────────────────────────
  {
    name: "Fernando Alonso",
    team: "Aston Martin",
    teamColor: "#00594F",
    nationality: "Spanish",
    flag: "🇪🇸",
    number: 14,
    naijaRating: 8,
    categories: { pace: 8, racecraft: 10, consistency: 7, hype: 9, potential: 7 },
    verdict: "Uncle Fernando still dey for 2026! 44 years old and racing sharp. Naija fans love veteran energy — we salute you.",
    status: "🔥 Hot",
  },
  {
    name: "Lance Stroll",
    team: "Aston Martin",
    teamColor: "#00594F",
    nationality: "Canadian",
    flag: "🇨🇦",
    number: 18,
    naijaRating: 5,
    categories: { pace: 7, racecraft: 6, consistency: 6, hype: 5, potential: 6 },
    verdict: "Daddy money move, but the boy get talent sha. Give am a good car and watch him surprise you on certain Saturdays.",
    status: "😐 Mid",
  },
  // ── ALPINE ──────────────────────────────────────────────────────
  {
    name: "Pierre Gasly",
    team: "Alpine",
    teamColor: "#2173B8",
    nationality: "French",
    flag: "🇫🇷",
    number: 10,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 8, consistency: 7, hype: 6, potential: 7 },
    verdict: "Gasly don prove e belongs at this level. Solid midfield warrior — Alpine dey lucky to have am.",
    status: "😐 Mid",
  },
  {
    name: "Franco Colapinto",
    team: "Alpine",
    teamColor: "#2173B8",
    nationality: "Argentine",
    flag: "🇦🇷",
    number: 43,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 7, consistency: 6, hype: 8, potential: 8 },
    verdict: "South American passion wey dey show for every lap. Naija fans vibe with his hunger — the boy no fear nothing.",
    status: "📈 Rising",
  },
  // ── HAAS ────────────────────────────────────────────────────────
  {
    name: "Esteban Ocon",
    team: "Haas",
    teamColor: "#B6BABD",
    nationality: "French",
    flag: "🇫🇷",
    number: 31,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 7, consistency: 7, hype: 5, potential: 6 },
    verdict: "Fresh start at Haas after Alpine drama. E need this reset — watch if the new environment wake am up.",
    status: "👀 Watch",
  },
  {
    name: "Oliver Bearman",
    team: "Haas",
    teamColor: "#B6BABD",
    nationality: "British",
    flag: "🇬🇧",
    number: 87,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 7, consistency: 6, hype: 7, potential: 9 },
    verdict: "The boy wey took Ferrari spot at short notice and delivered. Haas is his proving ground — make e shine.",
    status: "📈 Rising",
  },
  // ── AUDI ────────────────────────────────────────────────────────
  {
    name: "Nico Hülkenberg",
    team: "Audi",
    teamColor: "#C0002A",
    nationality: "German",
    flag: "🇩🇪",
    number: 27,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 8, consistency: 8, hype: 6, potential: 6 },
    verdict: "No podium in 200+ races but him no give up. The Hulk dey help build Audi from the ground up — respect.",
    status: "👀 Watch",
  },
  {
    name: "Gabriel Bortoleto",
    team: "Audi",
    teamColor: "#C0002A",
    nationality: "Brazilian",
    flag: "🇧🇷",
    number: 5,
    naijaRating: 6,
    categories: { pace: 8, racecraft: 7, consistency: 6, hype: 7, potential: 9 },
    verdict: "Brazilian flair wey F2 championship don back up. Naija fans like his spirit — make e carry the Senna legacy well.",
    status: "🆕 Rookie",
  },
  // ── RACING BULLS ────────────────────────────────────────────────
  {
    name: "Liam Lawson",
    team: "Racing Bulls",
    teamColor: "#6692FF",
    nationality: "New Zealander",
    flag: "🇳🇿",
    number: 30,
    naijaRating: 6,
    categories: { pace: 8, racecraft: 8, consistency: 6, hype: 6, potential: 8 },
    verdict: "Aggressive on track, no take nonsense. Red Bull system chewed and spat others but Lawson dey stand firm.",
    status: "👀 Watch",
  },
  {
    name: "Arvid Lindblad",
    team: "Racing Bulls",
    teamColor: "#6692FF",
    nationality: "British",
    flag: "🇬🇧",
    number: 41,
    naijaRating: 5,
    categories: { pace: 7, racecraft: 6, consistency: 5, hype: 5, potential: 9 },
    verdict: "17 years old and already in F1! Kid still dey learn but the talent dey raw. E go be special in few years.",
    status: "🆕 Rookie",
  },
  // ── CADILLAC ────────────────────────────────────────────────────
  {
    name: "Sergio Pérez",
    team: "Cadillac",
    teamColor: "#C8AA32",
    nationality: "Mexican",
    flag: "🇲🇽",
    number: 11,
    naijaRating: 6,
    categories: { pace: 7, racecraft: 8, consistency: 6, hype: 7, potential: 6 },
    verdict: "Checo back for Cadillac comeback story. The man wey Naija fans love to root for — make am prove he still get it.",
    status: "📈 Rising",
  },
  {
    name: "Valtteri Bottas",
    team: "Cadillac",
    teamColor: "#C8AA32",
    nationality: "Finnish",
    flag: "🇫🇮",
    number: 77,
    naijaRating: 5,
    categories: { pace: 7, racecraft: 7, consistency: 7, hype: 6, potential: 5 },
    verdict: "Finland quiet man dey still dey for 2026. Valtteri dey score points when nobody dey watch — underestimate at your peril.",
    status: "😐 Mid",
  },
];

const SORT_OPTIONS = [
  { key: "naijaRating", label: "🇳🇬 Naija Rating" },
  { key: "pace",        label: "⚡ Pace" },
  { key: "racecraft",   label: "🏎️ Racecraft" },
  { key: "consistency", label: "📊 Consistency" },
  { key: "hype",        label: "🔥 Hype" },
  { key: "potential",   label: "🚀 Potential" },
] as const;

type SortKey = typeof SORT_OPTIONS[number]["key"];

function RatingBar({ value, color = "#00d484" }: { value: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, height: 5, borderRadius: 3,
        background: "rgba(255,255,255,.08)", overflow: "hidden",
      }}>
        <div style={{
          width: `${value * 10}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 3, transition: "width .5s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 18, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const TEAM_GROUPS = [
  { team: "McLaren",            color: "#FF8000" },
  { team: "Ferrari",            color: "#EF1A2D" },
  { team: "Red Bull Racing",    color: "#3671C6" },
  { team: "Mercedes",           color: "#27F4D2" },
  { team: "Williams",           color: "#00A0DD" },
  { team: "Aston Martin",       color: "#00594F" },
  { team: "Alpine",             color: "#2173B8" },
  { team: "Haas",               color: "#B6BABD" },
  { team: "Audi",               color: "#C0002A" },
  { team: "Racing Bulls",       color: "#6692FF" },
  { team: "Cadillac",           color: "#C8AA32" },
];

export default function NaijaIndexPage() {
  const [sortKey, setSortKey] = useState<SortKey>("naijaRating");
  const [filterTeam, setFilterTeam] = useState<string>("All");

  const sorted = useMemo(() => {
    const base = filterTeam === "All"
      ? [...DRIVERS_2026]
      : DRIVERS_2026.filter(d => d.team === filterTeam);

    return base.sort((a, b) => {
      if (sortKey === "naijaRating") return b.naijaRating - a.naijaRating;
      return b.categories[sortKey as keyof typeof a.categories] - a.categories[sortKey as keyof typeof a.categories];
    });
  }, [sortKey, filterTeam]);

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes niFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ni-hero  { animation: niFadeUp .5s ease .05s both; }
        .ni-sub   { animation: niFadeUp .5s ease .18s both; }
        .ni-body  { animation: niFadeUp .5s ease .3s both; }
        .ni-card:hover {
          border-color: rgba(255,255,255,.14) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(0,0,0,.24);
        }
        .ni-card { transition: border-color .18s, transform .18s, box-shadow .18s; }
        .ni-sort-btn:hover { opacity: .85; }
        .ni-filter-btn:hover { opacity: .85; }
        @media (prefers-reduced-motion: reduce) {
          .ni-hero, .ni-sub, .ni-body { animation: none; }
          .ni-card { transition: none; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,7vw,80px) clamp(20px,5vw,80px) clamp(32px,5vw,56px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 0%,black 20%,transparent 75%)",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 0%,black 20%,transparent 75%)",
        }} />
        {/* Purple glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(156,80,245,.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <div className="ni-hero" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 18, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#9c50f5,#c084fc)" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "#9c50f5" }}>
              Rated by Naija fans · 2026 Season
            </span>
          </div>

          <h1 className="ni-hero" style={{ marginBottom: 20, margin: "0 0 20px", fontWeight: "inherit" }}>
            <span style={{
              display: "block",
              fontSize: "clamp(38px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .9,
              color: "var(--f1-text)",
            }}>
              Naija Driver
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(38px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .9,
              background: "linear-gradient(120deg,#9c50f5 0%,#c084fc 45%,#00d484 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Index 2026
            </span>
          </h1>

          <p className="ni-sub" style={{ fontSize: 14, color: "var(--f1-muted)", maxWidth: 520, lineHeight: 1.75 }}>
            All 22 F1 drivers — 11 teams — rated by pace, racecraft, consistency, hype factor and potential.
            Community verdicts. <span lang="pcm">Pidgin energy.</span> Updated through the season.
          </p>

          {/* Team quick-stats */}
          <div className="ni-sub" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 24 }}>
            {[
              { label: "Drivers", value: "22" },
              { label: "Teams",   value: "11" },
              { label: "Rookies", value: "4" },
              { label: "Champions", value: "2" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900, color: "var(--f1-text)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--f1-muted)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTROLS ─────────────────────────────────────────────── */}
      <div className="ni-body" style={{ padding: "28px clamp(20px,5vw,80px) 0" }}>

        {/* Team filter pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".12em", marginRight: 4 }}>
            Team:
          </span>
          {["All", ...TEAM_GROUPS.map(t => t.team)].map(team => {
            const tc = TEAM_GROUPS.find(t => t.team === team)?.color ?? "#00d484";
            const active = filterTeam === team;
            return (
              <button
                key={team}
                className="ni-filter-btn"
                onClick={() => setFilterTeam(team)}
                aria-pressed={active}
                style={{
                  padding: "5px 12px", minHeight: 34, borderRadius: 6,
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: active ? `${tc}22` : "var(--f1-card)",
                  border: `1px solid ${active ? tc + "66" : "rgba(255,255,255,.07)"}`,
                  color: active ? tc : "var(--f1-muted)",
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                {team === "All" ? "All Teams" : team}
              </button>
            );
          })}
        </div>

        {/* Sort controls */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 24,
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".12em", marginRight: 4 }}>
            Sort:
          </span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className="ni-sort-btn"
              onClick={() => setSortKey(opt.key)}
              aria-pressed={sortKey === opt.key}
              style={{
                padding: "6px 14px", minHeight: 38, borderRadius: 7,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: sortKey === opt.key ? "rgba(156,80,245,.2)" : "var(--f1-card)",
                border: `1px solid ${sortKey === opt.key ? "rgba(156,80,245,.45)" : "rgba(255,255,255,.08)"}`,
                color: sortKey === opt.key ? "#c084fc" : "var(--f1-muted)",
                transition: "all .15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DRIVER CARDS ─────────────────────────────────────────── */}
      <div style={{ padding: "0 clamp(20px,5vw,80px) 80px" }}>

        {/* Results count */}
        <p style={{ fontSize: 11, color: "var(--f1-muted)", marginBottom: 16 }}>
          {sorted.length} driver{sorted.length !== 1 ? "s" : ""}
          {filterTeam !== "All" ? ` · ${filterTeam}` : " · All Teams"}
          {" · sorted by "}
          {SORT_OPTIONS.find(o => o.key === sortKey)?.label.replace(/^[^\s]+\s/, "") ?? sortKey}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((driver, idx) => (
            <div
              key={driver.name}
              className="ni-card"
              style={{
                background: "var(--f1-card)",
                border: "1px solid rgba(255,255,255,.07)",
                borderLeft: `3px solid ${driver.teamColor}`,
                borderRadius: 14, overflow: "hidden",
              }}
            >
              {/* ── Card Header ── */}
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                justifyContent: "space-between", gap: 10,
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Rank bubble */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: driver.teamColor + "18",
                    border: `2px solid ${driver.teamColor}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 900, color: driver.teamColor,
                  }}>
                    {idx + 1}
                  </div>
                  {/* Name / team */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "var(--f1-text)" }}>{driver.name}</span>
                      <span style={{ fontSize: 16 }} aria-label={driver.nationality}>{driver.flag}</span>
                      {driver.status === "🆕 Rookie" && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4,
                          background: "rgba(0,212,132,.12)", color: "#00d484",
                          border: "1px solid rgba(0,212,132,.22)", textTransform: "uppercase", letterSpacing: ".08em",
                        }}>Rookie</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 2 }}>
                      <span style={{ color: driver.teamColor, fontWeight: 700 }}>#{driver.number}</span>
                      {" · "}
                      <span>{driver.team}</span>
                    </div>
                  </div>
                </div>

                {/* Status + score */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 5,
                    background: "rgba(255,255,255,.06)", color: "var(--f1-muted)",
                    whiteSpace: "nowrap",
                  }}>
                    {driver.status}
                  </span>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: 28, fontWeight: 900, lineHeight: 1,
                      background: "linear-gradient(135deg,#9c50f5,#c084fc)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      {driver.naijaRating}
                    </div>
                    <div style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: ".1em" }}>/10</div>
                  </div>
                </div>
              </div>

              {/* ── Ratings + Verdict ── */}
              <div style={{
                padding: "14px 18px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 16,
              }}>
                {/* Rating bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(["pace", "racecraft", "consistency", "hype", "potential"] as const).map(cat => (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          textTransform: "capitalize", letterSpacing: ".06em",
                          color: sortKey === cat ? driver.teamColor : "var(--f1-muted)",
                        }}>
                          {sortKey === cat ? "→ " : ""}{cat}
                        </span>
                      </div>
                      <RatingBar value={driver.categories[cat]} color={driver.teamColor} />
                    </div>
                  ))}
                </div>

                {/* Verdict quote */}
                <div style={{
                  background: "rgba(255,255,255,.025)",
                  border: "1px solid rgba(255,255,255,.05)",
                  borderRadius: 10, padding: "14px 16px",
                  display: "flex", alignItems: "center",
                }}>
                  <p style={{
                    fontSize: 13, color: "var(--f1-text)",
                    fontStyle: "italic", lineHeight: 1.65, margin: 0,
                  }}>
                    &ldquo;<span lang="pcm">{driver.verdict}</span>&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── DISCLAIMER ── */}
        <p style={{
          fontSize: 11, color: "#52525b", marginTop: 24,
          lineHeight: 1.7, textAlign: "center",
        }}>
          Ratings represent F1 Naija community opinions — not official statistics. Updated throughout the 2026 season.
        </p>

        {/* ── CTA ── */}
        <div style={{
          marginTop: 40,
          background: "linear-gradient(135deg,rgba(156,80,245,.08),rgba(0,212,132,.05))",
          border: "1px solid rgba(156,80,245,.2)",
          borderRadius: 16, padding: "clamp(24px,4vw,40px)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: ".16em",
            textTransform: "uppercase", color: "#9c50f5", marginBottom: 12,
          }}>
            Community Debate
          </div>
          <div style={{
            fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 900,
            color: "var(--f1-text)", marginBottom: 10,
          }}>
            You disagree? <span lang="pcm">Come argue am.</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.75, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Drop your own ratings and hot takes on X. We read everything — tag @f1_naija and make your voice count.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="https://x.com/f1_naija"
              target="_blank" rel="noopener noreferrer"
              aria-label="Share your ratings on X (formerly Twitter)"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 8,
                fontSize: 13, fontWeight: 800, minHeight: 44,
                background: "linear-gradient(135deg,#7c3aed,#9c50f5)",
                color: "#fff", textDecoration: "none",
                boxShadow: "0 4px 20px rgba(156,80,245,.3)",
              }}
            >
              𝕏 Share Your Ratings
            </a>
            <a
              href="https://wa.me/+2348000000000"
              target="_blank" rel="noopener noreferrer"
              aria-label="Join the F1 Naija WhatsApp community"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 8,
                fontSize: 13, fontWeight: 800, minHeight: 44,
                background: "rgba(37,211,102,.1)",
                border: "1px solid rgba(37,211,102,.25)",
                color: "#25d366", textDecoration: "none",
              }}
            >
              💬 Join Naija F1 Fans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
