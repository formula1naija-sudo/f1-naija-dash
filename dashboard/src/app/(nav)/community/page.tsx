"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type SocialStats = {
  twitter: number;
  instagram: number;
  threads: number;
  tiktok: number;
  facebook: number;
  fantasy: number;
  impressions: string;
  twitterLive: boolean;
};

function fmt(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/* ── Shared hero section label ─────────────────────────────── */
function EyebrowLabel({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 16, height: 1, background: "#00d484", flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
        {text}
      </span>
    </div>
  );
}

/* ── Section divider ───────────────────────────────────────── */
function SectionDivider() {
  return <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />;
}

/* ── Stat pill ─────────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 20px", borderRadius: 12,
      background: "var(--f1-card)",
      border: "1px solid rgba(255,255,255,.07)",
      minWidth: 100, flex: 1,
    }}>
      <span style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 900, letterSpacing: "-.03em", color: "#00d484" }}>
        {value}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--f1-muted)", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4, textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}

/* ── CTA button ────────────────────────────────────────────── */
function CTAButton({
  href,
  label,
  variant = "primary",
  disabled = false,
  onClick,
}: {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700,
    letterSpacing: ".04em", textDecoration: "none", cursor: disabled ? "not-allowed" : "pointer",
    transition: "opacity .15s, background .15s",
    opacity: disabled ? 0.45 : 1,
    minHeight: 44, WebkitTapHighlightColor: "transparent",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "#00d484", color: "#000" },
    ghost: { background: "transparent", color: "var(--f1-text)", border: "1px solid rgba(255,255,255,.15)" },
  };

  if (disabled) {
    return (
      <span style={{ ...base, ...styles[variant] }}>{label}</span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...base, ...styles[variant] }} onClick={onClick}>
      {label}
    </a>
  );
}

/* ── Social channel card ───────────────────────────────────── */
function SocialCard({
  icon, platform, handle, followers, href, live = false,
}: {
  icon: string; platform: string; handle: string; followers?: string; href: string; live?: boolean;
}) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px", borderRadius: 10,
        background: "var(--f1-card)",
        border: "1px solid rgba(255,255,255,.07)",
        textDecoration: "none", transition: "border-color .18s, transform .18s",
      }}
      onMouseEnter={e => {
        if (!window.matchMedia("(hover:hover)").matches) return;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,212,132,.3)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        if (!window.matchMedia("(hover:hover)").matches) return;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,.07)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)" }}>{platform}</div>
        <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 1 }}>{handle}</div>
      </div>
      {followers && (
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
            {live && (
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#00d484", boxShadow: "0 0 4px #00d484",
                display: "inline-block", flexShrink: 0,
              }} />
            )}
            <span style={{ fontSize: 14, fontWeight: 800, color: "#00d484" }}>{followers}</span>
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "var(--f1-muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>followers</div>
        </div>
      )}
    </a>
  );
}

/* ── Section card wrapper ──────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--f1-card)",
      border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 14,
      padding: "28px 24px",
    }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ── New to F1 data ────────────────────────────────────────────────
const F1_BASICS = [
  { icon: "🏎️", title: "What is Formula 1?", desc: "Formula 1 is the highest class of international single-seater auto racing. 10 teams (constructors) each field 2 drivers across a ~24-race season. The driver and team with the most points at the end wins the World Championship." },
  { icon: "📅", title: "The Race Weekend",    desc: "Each Grand Prix runs over a weekend: Practice sessions (FP1, FP2, FP3) on Friday and Saturday, Qualifying on Saturday to set the grid order, and the Race on Sunday. Some weekends have a Sprint race format — with less practice and an extra mini-race on Saturday." },
  { icon: "🏆", title: "Points System",       desc: "The top 10 finishers score points: 25–18–15–12–10–8–6–4–2–1. The driver with the most points at season end is World Drivers' Champion. Constructor points are the total of both drivers combined." },
  { icon: "🔴🟡🟢", title: "Tyre Strategy",  desc: "F1 uses three tyre compounds: Soft (red, fastest but wears quickly), Medium (yellow, balanced), and Hard (white, durable). Teams must use at least 2 compounds in a dry race. Pit stop strategy — when to change tyres — is often what decides the winner." },
  { icon: "🚩", title: "Flags & Safety Car",  desc: "Yellow flag = caution/slow down. Red flag = stop the race. Safety Car = all cars must follow slowly behind it, no overtaking. Virtual Safety Car (VSC) = same concept, but electronically enforced. Blue flag = you're about to be lapped, let faster car pass." },
  { icon: "⚡", title: "DRS",                 desc: "An overtaking aid: a flap on the rear wing opens to reduce drag when a car is within 1 second of the car ahead in designated 'DRS zones'. This gives the following car a speed boost to attempt a pass. DRS is disabled in wet conditions." },
];

const NAIJA_GUIDE = [
  { title: "When to watch (WAT)", desc: "Most European races start at 14:00–15:00 WAT. Asian/Australian races can be brutal — 06:00–07:00 WAT. American races (Miami, Austin, Las Vegas) are usually 22:00–23:00 WAT. Check the Schedule page for exact times.", link: { label: "View Race Schedule", href: "/schedule" } },
  { title: "How to watch in Nigeria", desc: "DStv subscribers can watch on SuperSport F1 (Channel 208). Canal+ subscribers have F1 on Canal+ Sport. Internationally, F1 TV Pro offers live streams globally.", link: null },
  { title: "Join the community", desc: "Don't watch alone! Join the F1 Naija community on X (Twitter), Instagram, and WhatsApp for live reactions, race day threads, and post-race debates.", link: null },
  { title: "Fantasy League", desc: "Play the official F1 Fantasy game and join our private F1 Naija league to compete with 200+ other Naija fans. It's free and very addictive.", link: { label: "Join Fantasy League", href: "https://fantasy.formula1.com/en/leagues/join/C1JYXEPWR10" } },
];

const GLOSSARY = [
  { term: "Apex",        def: "The inside point of a corner — the ideal racing line clips through here." },
  { term: "Undercut",    def: "Pitting early to get fresh tyres and come out ahead of a slower rival." },
  { term: "Overcut",     def: "Staying out longer to let the rival pit, then using faster pace to emerge ahead." },
  { term: "Quali",       def: "Qualifying — the Saturday session that determines the starting grid." },
  { term: "Parc Fermé",  def: "Once qualifying begins, teams can't make significant car changes before the race." },
  { term: "Bottoming",   def: "When the floor of the car scrapes the ground — causes sparks and can damage the car." },
  { term: "Marbles",     def: "Rubber debris that builds up off the racing line, making it slippery." },
  { term: "GOAT debate", def: "Hamilton vs Schumacher — 7 World Championships each. Naija fans have strong opinions." },
];

// ── Naija Driver Index data ────────────────────────────────────────
type Driver = {
  name: string; team: string; teamColor: string;
  nationality: string; flag: string; number: number;
  naijaRating: number;
  categories: { pace: number; racecraft: number; consistency: number; hype: number; potential: number };
  verdict: string;
  status: "🔥 Hot" | "📈 Rising" | "😐 Mid" | "📉 Struggling" | "👀 Watch" | "🆕 Rookie";
};

const DRIVERS_2026: Driver[] = [
  { name: "Lando Norris",      team: "McLaren",         teamColor: "#FF8000", nationality: "British",       flag: "🇬🇧", number: 1,  naijaRating: 9, categories: { pace:9,  racecraft:9,  consistency:9,  hype:10, potential:10 }, verdict: "2025 World Champion! Naija fans don adopt am as our guy. Him carry the #1 with swag — make e defend am well.", status: "🔥 Hot"      },
  { name: "Oscar Piastri",     team: "McLaren",         teamColor: "#FF8000", nationality: "Australian",    flag: "🇦🇺", number: 81, naijaRating: 8, categories: { pace:9,  racecraft:8,  consistency:9,  hype:7,  potential:10 }, verdict: "Quietly menacing. This boy dey score points like breathing — the next superstar dey rise.", status: "📈 Rising"   },
  { name: "George Russell",    team: "Mercedes",        teamColor: "#27F4D2", nationality: "British",       flag: "🇬🇧", number: 63, naijaRating: 7, categories: { pace:8,  racecraft:8,  consistency:9,  hype:6,  potential:8  }, verdict: "Underrated and understated. If that silver car give am tools, e go surprise everybody.", status: "👀 Watch"     },
  { name: "Kimi Antonelli",    team: "Mercedes",        teamColor: "#27F4D2", nationality: "Italian",       flag: "🇮🇹", number: 12, naijaRating: 7, categories: { pace:8,  racecraft:7,  consistency:7,  hype:8,  potential:10 }, verdict: "The chosen one wey Mercedes hand-picked. Baby driver but potential dey off the charts — watch closely.", status: "🆕 Rookie"   },
  { name: "Charles Leclerc",   team: "Ferrari",         teamColor: "#EF1A2D", nationality: "Monégasque",    flag: "🇲🇨", number: 16, naijaRating: 8, categories: { pace:9,  racecraft:8,  consistency:7,  hype:8,  potential:9  }, verdict: "Fast like electricity but occasional blunder dey pain Naija fans. Biko sort your qualifying head.", status: "📈 Rising"   },
  { name: "Lewis Hamilton",    team: "Ferrari",         teamColor: "#EF1A2D", nationality: "British",       flag: "🇬🇧", number: 44, naijaRating: 9, categories: { pace:9,  racecraft:10, consistency:8,  hype:10, potential:8  }, verdict: "The GOAT debate don reach Maranello. Ferrari red on Lewis Hamilton is cinema — make we see the magic.", status: "🔥 Hot"      },
  { name: "Max Verstappen",    team: "Red Bull Racing", teamColor: "#3671C6", nationality: "Dutch",         flag: "🇳🇱", number: 3,  naijaRating: 9, categories: { pace:10, racecraft:10, consistency:9,  hype:8,  potential:9  }, verdict: "Four-time champion wey dey operate on a different level. E lost the title but underestimate am at your own risk.", status: "🔥 Hot"      },
  { name: "Isack Hadjar",      team: "Red Bull Racing", teamColor: "#3671C6", nationality: "French",        flag: "🇫🇷", number: 6,  naijaRating: 6, categories: { pace:8,  racecraft:7,  consistency:7,  hype:6,  potential:9  }, verdict: "Big shoes to fill at Red Bull. French-Algerian rookie with fire in his belly — the pressure go test am.", status: "🆕 Rookie"   },
  { name: "Carlos Sainz",      team: "Williams",        teamColor: "#00A0DD", nationality: "Spanish",       flag: "🇪🇸", number: 55, naijaRating: 7, categories: { pace:8,  racecraft:8,  consistency:8,  hype:6,  potential:7  }, verdict: "E go squeeze every drop from the Williams. This man never give up in his life — respect must be given.", status: "👀 Watch"     },
  { name: "Alexander Albon",   team: "Williams",        teamColor: "#00A0DD", nationality: "Thai",          flag: "🇹🇭", number: 23, naijaRating: 6, categories: { pace:7,  racecraft:8,  consistency:8,  hype:6,  potential:7  }, verdict: "Mr. Points from nowhere. Him dey extract magic from midfield machinery — quiet but dependable.", status: "😐 Mid"       },
  { name: "Fernando Alonso",   team: "Aston Martin",    teamColor: "#00594F", nationality: "Spanish",       flag: "🇪🇸", number: 14, naijaRating: 8, categories: { pace:8,  racecraft:10, consistency:7,  hype:9,  potential:7  }, verdict: "Uncle Fernando still dey for 2026! 44 years old and racing sharp. Naija fans love veteran energy — we salute you.", status: "🔥 Hot"      },
  { name: "Lance Stroll",      team: "Aston Martin",    teamColor: "#00594F", nationality: "Canadian",      flag: "🇨🇦", number: 18, naijaRating: 5, categories: { pace:7,  racecraft:6,  consistency:6,  hype:5,  potential:6  }, verdict: "Daddy money move, but the boy get talent sha. Give am a good car and watch him surprise you on certain Saturdays.", status: "😐 Mid"       },
  { name: "Pierre Gasly",      team: "Alpine",          teamColor: "#2173B8", nationality: "French",        flag: "🇫🇷", number: 10, naijaRating: 6, categories: { pace:7,  racecraft:8,  consistency:7,  hype:6,  potential:7  }, verdict: "Gasly don prove e belongs at this level. Solid midfield warrior — Alpine dey lucky to have am.", status: "😐 Mid"       },
  { name: "Franco Colapinto",  team: "Alpine",          teamColor: "#2173B8", nationality: "Argentine",     flag: "🇦🇷", number: 43, naijaRating: 6, categories: { pace:7,  racecraft:7,  consistency:6,  hype:8,  potential:8  }, verdict: "South American passion wey dey show for every lap. Naija fans vibe with his hunger — the boy no fear nothing.", status: "📈 Rising"   },
  { name: "Esteban Ocon",      team: "Haas",            teamColor: "#B6BABD", nationality: "French",        flag: "🇫🇷", number: 31, naijaRating: 6, categories: { pace:7,  racecraft:7,  consistency:7,  hype:5,  potential:6  }, verdict: "Fresh start at Haas after Alpine drama. E need this reset — watch if the new environment wake am up.", status: "👀 Watch"     },
  { name: "Oliver Bearman",    team: "Haas",            teamColor: "#B6BABD", nationality: "British",       flag: "🇬🇧", number: 87, naijaRating: 6, categories: { pace:7,  racecraft:7,  consistency:6,  hype:7,  potential:9  }, verdict: "The boy wey took Ferrari spot at short notice and delivered. Haas is his proving ground — make e shine.", status: "📈 Rising"   },
  { name: "Nico Hülkenberg",   team: "Audi",            teamColor: "#C0002A", nationality: "German",        flag: "🇩🇪", number: 27, naijaRating: 6, categories: { pace:7,  racecraft:8,  consistency:8,  hype:6,  potential:6  }, verdict: "No podium in 200+ races but him no give up. The Hulk dey help build Audi from the ground up — respect.", status: "👀 Watch"     },
  { name: "Gabriel Bortoleto", team: "Audi",            teamColor: "#C0002A", nationality: "Brazilian",     flag: "🇧🇷", number: 5,  naijaRating: 6, categories: { pace:8,  racecraft:7,  consistency:6,  hype:7,  potential:9  }, verdict: "Brazilian flair wey F2 championship don back up. Naija fans like his spirit — make e carry the Senna legacy well.", status: "🆕 Rookie"   },
  { name: "Liam Lawson",       team: "Racing Bulls",    teamColor: "#6692FF", nationality: "New Zealander", flag: "🇳🇿", number: 30, naijaRating: 6, categories: { pace:8,  racecraft:8,  consistency:6,  hype:6,  potential:8  }, verdict: "Aggressive on track, no take nonsense. Red Bull system chewed and spat others but Lawson dey stand firm.", status: "👀 Watch"     },
  { name: "Arvid Lindblad",    team: "Racing Bulls",    teamColor: "#6692FF", nationality: "British",       flag: "🇬🇧", number: 41, naijaRating: 5, categories: { pace:7,  racecraft:6,  consistency:5,  hype:5,  potential:9  }, verdict: "17 years old and already in F1! Kid still dey learn but the talent dey raw. E go be special in few years.", status: "🆕 Rookie"   },
  { name: "Sergio Pérez",      team: "Cadillac",        teamColor: "#C8AA32", nationality: "Mexican",       flag: "🇲🇽", number: 11, naijaRating: 6, categories: { pace:7,  racecraft:8,  consistency:6,  hype:7,  potential:6  }, verdict: "Checo back for Cadillac comeback story. The man wey Naija fans love to root for — make am prove he still get it.", status: "📈 Rising"   },
  { name: "Valtteri Bottas",   team: "Cadillac",        teamColor: "#C8AA32", nationality: "Finnish",       flag: "🇫🇮", number: 77, naijaRating: 5, categories: { pace:7,  racecraft:7,  consistency:7,  hype:6,  potential:5  }, verdict: "Finland quiet man dey still dey for 2026. Valtteri dey score points when nobody dey watch — underestimate at your peril.", status: "😐 Mid"       },
];

const SORT_OPTIONS = [
  { key: "naijaRating", label: "🇳🇬 Naija Rating" },
  { key: "pace",        label: "⚡ Pace"           },
  { key: "racecraft",   label: "🏎️ Racecraft"      },
  { key: "consistency", label: "📊 Consistency"    },
  { key: "hype",        label: "🔥 Hype"           },
  { key: "potential",   label: "🚀 Potential"      },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["key"];

function RatingBar({ value, color = "#00d484" }: { value: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
        <div style={{ width: `${value * 10}%`, height: "100%", background: `linear-gradient(90deg,${color}99,${color})`, borderRadius: 3, transition: "width .5s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 18, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const TEAM_GROUPS = [
  { team: "McLaren",          color: "#FF8000" }, { team: "Ferrari",         color: "#EF1A2D" },
  { team: "Red Bull Racing",  color: "#3671C6" }, { team: "Mercedes",        color: "#27F4D2" },
  { team: "Williams",         color: "#00A0DD" }, { team: "Aston Martin",    color: "#00594F" },
  { team: "Alpine",           color: "#2173B8" }, { team: "Haas",            color: "#B6BABD" },
  { team: "Audi",             color: "#C0002A" }, { team: "Racing Bulls",    color: "#6692FF" },
  { team: "Cadillac",         color: "#C8AA32" },
];

// ══════════════════════════════════════════════════════════════════
// Hardcoded fallback counts — shown immediately while API loads (or if it fails).
// Update these when follower milestones are hit.
const FALLBACK_STATS: SocialStats = {
  twitter:     6_600,
  instagram:   5_300,
  threads:     3_000,
  tiktok:      0,
  facebook:    0,
  fantasy:     200,
  impressions: "1M+",
  twitterLive: false,
};

/* ── Push notification banner ──────────────────────────────── */
function PushNotificationBanner() {
  const [state, setState] = React.useState<"idle" | "asking" | "granted" | "denied" | "hidden">(() => {
    if (typeof window === "undefined") return "idle";
    if (localStorage.getItem("f1naija_notif_dismissed")) return "hidden";
    if (!("Notification" in window)) return "hidden";
    if (Notification.permission === "granted") return "hidden";
    return "idle";
  });

  if (state === "hidden") return null;

  async function request() {
    if (!("Notification" in window)) return;
    setState("asking");
    const perm = await Notification.requestPermission();
    setState(perm === "granted" ? "granted" : "denied");
    if (perm !== "default") {
      localStorage.setItem("f1naija_notif_dismissed", "1");
    }
  }

  function dismiss() {
    localStorage.setItem("f1naija_notif_dismissed", "1");
    setState("hidden");
  }

  return (
    <section aria-label="Stay informed" style={{ padding: "40px 0" }}>
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 16,
        padding: "20px 24px", borderRadius: 14,
        background: "rgba(0,212,132,.05)",
        border: "1px solid rgba(0,212,132,.18)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🔔</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--f1-text)", marginBottom: 4 }}>
              Race day alerts
            </div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", margin: 0, lineHeight: 1.5 }} lang="pcm">
              We go ping you when session starts — no wahala, you fit turn am off anytime.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {state === "idle" && (
            <button
              onClick={request}
              style={{
                padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(0,212,132,.18)", border: "1px solid rgba(0,212,132,.35)",
                color: "#00d484", cursor: "pointer", letterSpacing: ".03em",
                minHeight: 44, WebkitTapHighlightColor: "transparent",
              }}
            >
              Enable Alerts
            </button>
          )}
          {state === "asking" && (
            <span style={{ fontSize: 12, color: "#00d484" }}>Waiting…</span>
          )}
          {state === "granted" && (
            <span style={{ fontSize: 12, color: "#00d484" }}>✓ Race alerts on!</span>
          )}
          {state === "denied" && (
            <span style={{ fontSize: 12, color: "var(--f1-muted)" }}>Blocked in browser settings</span>
          )}
          {(state === "idle" || state === "denied") && (
            <button
              onClick={dismiss}
              aria-label="Dismiss notification prompt"
              style={{
                fontSize: 14, color: "var(--f1-muted)", cursor: "pointer",
                background: "none", border: "none", padding: "4px 8px", lineHeight: 1,
                minHeight: 44, minWidth: 44,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function CommunityPage() {
  const [stats, setStats] = useState<SocialStats>(FALLBACK_STATS);
  const [sortKey,    setSortKey]    = useState<SortKey>("naijaRating");
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

  useEffect(() => {
    fetch("/api/social-stats")
      .then(r => r.json())
      .then((data: SocialStats) => setStats(data))
      .catch(() => {/* keep fallback */});
  }, []);

  // Always show real numbers — fallback ensures no blank state
  const s = (n: number | undefined) => fmt(n ?? 0);

  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section aria-label="Community overview" style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(48px,7vw,80px) 0 clamp(36px,5vw,56px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        {/* grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
        }} />
        {/* glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 55% 55% at 15% 50%,rgba(0,212,132,.04) 0%,transparent 60%)",
        }} />
        {/* bg watermark */}
        <div style={{
          position: "absolute", bottom: -20, right: -10,
          fontSize: "clamp(80px,13vw,180px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.011)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none",
        }}>
          NAIJA
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <EyebrowLabel text="F1 Naija · The Community" />
          <h1 style={{ lineHeight: .92, margin: "0 0 20px", fontWeight: "inherit" }}>
            <span style={{ display: "block", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)" }}>
              The Naija
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em",
              background: "linear-gradient(120deg,#00d484 0%,#7affd4 50%,#00d484 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              F1 Community.
            </span>
          </h1>
          <p style={{
            fontSize: "clamp(14px,1.8vw,17px)", color: "var(--f1-muted)",
            lineHeight: 1.65, maxWidth: 560, margin: 0,
          }}>
            From Lagos to London, Houston to Dubai — F1 Naija is where Nigerian Formula 1 fans
            come together. Fantasy leagues, race-day threads, live watch parties, and the conversation
            that moves at race pace.
          </p>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section aria-label="Community stats" style={{ padding: "36px 0" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 10,
        }}>
          <StatPill value={s(stats?.twitter)}   label="X Followers" />
          <StatPill value={s(stats?.instagram)} label="Instagram Followers" />
          <StatPill value={s(stats?.threads)}   label="Threads Followers" />
          <StatPill value="200+"                label="Fantasy Players" />
          <StatPill value="1M+"                 label="Monthly Impressions" />
        </div>
      </section>

      <SectionDivider />

      {/* ── MAIN CONTENT GRID ─────────────────────────────────── */}
      <section aria-label="Fantasy league and watch parties" style={{ padding: "56px 0" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 16,
        }}>

          {/* Fantasy League */}
          <SectionCard>
            <EyebrowLabel text="Fantasy League" />
            <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, margin: "0 0 12px" }}>
              Join the F1 Naija<br />
              <span style={{ color: "#f5a724" }}>Fantasy League.</span>
            </h2>
            <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
              Compete against the sharpest F1 minds in the Naija community. Pick your drivers,
              manage your strategy, and climb the standings every race weekend.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CTAButton href="https://fantasy.formula1.com/en/leagues/join/C1JYXEPWR10" label="Join the League" variant="primary" />
            </div>
          </SectionCard>

          {/* Watch Parties */}
          <SectionCard>
            <EyebrowLabel text="Watch Parties" />
            <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, margin: "0 0 12px" }}>
              Race Day,<br />
              <span style={{ color: "#00d484" }}>Together.</span>
            </h2>
            <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
              Nothing beats watching lights out with the community. F1 Naija watch parties bring
              the grid to life — in Lagos and beyond. Follow us on Instagram to stay updated on
              the next event near you.
            </p>
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.06)",
              fontSize: 11, color: "var(--f1-muted)", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>📍</span>
              <span>No upcoming events listed right now — check back before race weekend.</span>
            </div>
            <CTAButton href="https://www.instagram.com/f1_naija/" label="Follow for Updates" variant="ghost" />
          </SectionCard>
        </div>
      </section>

      <SectionDivider />

      {/* ── JOIN THE CONVERSATION ──────────────────────────────── */}
      <section aria-label="Join the conversation" style={{ padding: "56px 0" }}>
        <div style={{ marginBottom: 36 }}>
          <EyebrowLabel text="Join the Conversation" />
          <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: 0 }}>
            Where the discussion<br />never stops.
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 14,
        }}>

          {/* WhatsApp */}
          <div style={{
            padding: "22px 20px", borderRadius: 12,
            background: "var(--f1-card)",
            border: "1px solid rgba(255,255,255,.07)",
            transition: "border-color .18s",
          }}
            onMouseEnter={e => { if (!window.matchMedia("(hover:hover)").matches) return; e.currentTarget.style.borderColor = "rgba(37,211,102,.3)"; }}
            onMouseLeave={e => { if (!window.matchMedia("(hover:hover)").matches) return; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>WhatsApp Community</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
              A dedicated space for race-day chaos, transfers, hot takes, and everything in between.
            </p>
            <CTAButton href="https://chat.whatsapp.com/F1Naija" label="💬 Join on WhatsApp" variant="ghost" />
          </div>

          {/* X Spaces */}
          <div style={{
            padding: "22px 20px", borderRadius: 12,
            background: "var(--f1-card)",
            border: "1px solid rgba(255,255,255,.07)",
            transition: "border-color .18s",
          }}
            onMouseEnter={e => { if (!window.matchMedia("(hover:hover)").matches) return; e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
            onMouseLeave={e => { if (!window.matchMedia("(hover:hover)").matches) return; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎙</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>X Spaces</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
              Live audio sessions on race weekends — qualifying breakdowns, post-race reactions,
              and driver debates with the community.
            </p>
            <CTAButton href="https://x.com/f1_naija" label="Follow @f1_naija" variant="ghost" />
          </div>

          {/* Race Day Threads */}
          <div style={{
            padding: "22px 20px", borderRadius: 12,
            background: "var(--f1-card)",
            border: "1px solid rgba(255,255,255,.07)",
            transition: "border-color .18s",
          }}
            onMouseEnter={e => { if (!window.matchMedia("(hover:hover)").matches) return; e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
            onMouseLeave={e => { if (!window.matchMedia("(hover:hover)").matches) return; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🏁</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Race Day Threads</div>
            <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
              Every race weekend, we run live-reaction threads on X and Threads. Follow the
              action lap by lap, share your take, and join thousands of Nigerian F1 fans in real time.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <CTAButton href="https://x.com/f1_naija" label="𝕏 Follow on X" variant="ghost" />
              <CTAButton href="https://www.threads.com/@f1_naija" label="Threads" variant="ghost" />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── NEW TO F1 ──────────────────────────────────────────── */}
      <section aria-label="New to F1 starter guide" style={{ padding: "56px 0" }}>
        <div style={{ marginBottom: 32 }}>
          <EyebrowLabel text="New to F1? Start Here" />
          <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: "0 0 10px" }}>
            Your F1 starter<br />
            <span style={{ color: "#00d484" }}>pack 🇳🇬</span>
          </h2>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
            Just getting into F1? Written by Naija fans, for Naija fans — everything you need to follow the sport.
          </p>
        </div>

        {/* F1 Basics */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 3, height: 14, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>F1 Basics</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
            {F1_BASICS.map(item => (
              <div key={item.title} style={{ background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--f1-text)", marginBottom: 7 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Naija Fan Guide */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 3, height: 14, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>The Naija Fan Guide</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {NAIJA_GUIDE.map(item => (
              <div key={item.title} style={{ background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--f1-text)", marginBottom: 6 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.7, margin: "0 0 10px" }}>{item.desc}</p>
                {item.link && (
                  <Link href={item.link.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#00d484", textDecoration: "none" }}>
                    {item.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Glossary */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 3, height: 14, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>F1 Jargon Decoder</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
            {GLOSSARY.map(g => (
              <div key={g.term} style={{ background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#00d484", marginBottom: 4 }}>{g.term}</div>
                <p style={{ fontSize: 11, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0 }}>{g.def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── NAIJA DRIVER INDEX ─────────────────────────────────── */}
      <section aria-label="Naija Driver Index 2026" style={{ padding: "56px 0" }}>
        <style>{`
          .ni-card { transition: border-color .18s, transform .18s, box-shadow .18s; }
          .ni-card:hover { border-color: rgba(255,255,255,.14) !important; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,0,0,.24); }
          .ni-sort-btn:hover, .ni-filter-btn:hover { opacity: .85; }
          @media (prefers-reduced-motion: reduce) { .ni-card { transition: none; } }
        `}</style>

        <div style={{ marginBottom: 28 }}>
          <EyebrowLabel text="Rated by Naija Fans · 2026 Season" />
          <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: "0 0 10px" }}>
            Naija Driver<br />
            <span style={{ background: "linear-gradient(120deg,#9c50f5 0%,#c084fc 45%,#00d484 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Index 2026</span>
          </h2>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
            All 22 F1 drivers rated by pace, racecraft, consistency, hype, and potential.{" "}
            <span lang="pcm">Community verdicts. Pidgin energy.</span>
          </p>
        </div>

        {/* Team filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".12em", marginRight: 4 }}>Team:</span>
          {["All", ...TEAM_GROUPS.map(t => t.team)].map(team => {
            const tc = TEAM_GROUPS.find(t => t.team === team)?.color ?? "#00d484";
            const active = filterTeam === team;
            return (
              <button key={team} className="ni-filter-btn" onClick={() => setFilterTeam(team)} aria-pressed={active} style={{
                padding: "5px 12px", minHeight: 44, borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                background: active ? `${tc}22` : "var(--f1-card)",
                border: `1px solid ${active ? tc + "66" : "rgba(255,255,255,.07)"}`,
                color: active ? tc : "var(--f1-muted)", transition: "all .15s",
              }}>{team === "All" ? "All Teams" : team}</button>
            );
          })}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".12em", marginRight: 4 }}>Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} className="ni-sort-btn" onClick={() => setSortKey(opt.key)} aria-pressed={sortKey === opt.key} style={{
              padding: "5px 12px", minHeight: 44, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: sortKey === opt.key ? "rgba(156,80,245,.2)" : "var(--f1-card)",
              border: `1px solid ${sortKey === opt.key ? "rgba(156,80,245,.45)" : "rgba(255,255,255,.08)"}`,
              color: sortKey === opt.key ? "#c084fc" : "var(--f1-muted)", transition: "all .15s",
            }}>{opt.label}</button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "var(--f1-muted)", marginBottom: 14 }}>
          {sorted.length} driver{sorted.length !== 1 ? "s" : ""}{filterTeam !== "All" ? ` · ${filterTeam}` : " · All Teams"}{" · sorted by "}{SORT_OPTIONS.find(o => o.key === sortKey)?.label.replace(/^[^\s]+\s/, "") ?? sortKey}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((driver, idx) => (
            <div key={driver.name} className="ni-card" style={{
              background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
              borderLeft: `3px solid ${driver.teamColor}`, borderRadius: 14, overflow: "hidden",
            }}>
              {/* Card header */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: driver.teamColor + "18", border: `2px solid ${driver.teamColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: driver.teamColor }}>{idx + 1}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: "var(--f1-text)" }}>{driver.name}</span>
                      <span style={{ fontSize: 15 }} aria-label={driver.nationality}>{driver.flag}</span>
                      {driver.status === "🆕 Rookie" && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(0,212,132,.12)", color: "#00d484", border: "1px solid rgba(0,212,132,.22)", textTransform: "uppercase", letterSpacing: ".08em" }}>Rookie</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 2 }}>
                      <span style={{ color: driver.teamColor, fontWeight: 700 }}>#{driver.number}</span>{" · "}<span>{driver.team}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 5, background: "rgba(255,255,255,.06)", color: "var(--f1-muted)", whiteSpace: "nowrap" }}>{driver.status}</span>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg,#9c50f5,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{driver.naijaRating}</div>
                    <div style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: ".1em" }}>/10</div>
                  </div>
                </div>
              </div>
              {/* Ratings + verdict */}
              <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(["pace","racecraft","consistency","hype","potential"] as const).map(cat => (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "capitalize", letterSpacing: ".06em", color: sortKey === cat ? driver.teamColor : "var(--f1-muted)" }}>{sortKey === cat ? "→ " : ""}{cat}</span>
                      </div>
                      <RatingBar value={driver.categories[cat]} color={driver.teamColor} />
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--f1-text)", fontStyle: "italic", lineHeight: 1.65, margin: 0 }}>&ldquo;<span lang="pcm">{driver.verdict}</span>&rdquo;</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#52525b", marginTop: 20, lineHeight: 1.7, textAlign: "center" }}>
          Ratings represent F1 Naija community opinions — not official statistics. Updated throughout the 2026 season.
        </p>
      </section>

      <SectionDivider />

      {/* ── ABOUT F1 NAIJA ─────────────────────────────────────── */}
      <section aria-label="About F1 Naija" style={{ padding: "56px 0" }}>
        <div style={{ marginBottom: 32 }}>
          <EyebrowLabel text="Built for the culture" />
          <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: "0 0 14px" }}>
            About F1 Naija.
          </h2>
          <p style={{ fontSize: 14, color: "var(--f1-muted)", lineHeight: 1.75, maxWidth: 560, margin: 0 }}>
            F1 Naija is Nigeria&apos;s leading Formula 1 media platform — combining a real-time live timing
            dashboard, race news, WAT-first scheduling, and the largest online community of Nigerian F1 fans.
            We reach over one million monthly impressions across a highly engaged audience of 16,000+
            followers spanning Nigeria, the UK, the US, and the wider diaspora.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { accent: "#f5a724", title: "Live timing & data",         desc: "A real-time F1 dashboard with lap times, gaps, tyre strategy, sector data, and DRS — powered by official F1 telemetry." },
            { accent: "#00d484", title: "WAT-first calendar & news",  desc: "Every session time in West Africa Time by default. Race news curated from top global F1 sources for a Nigerian audience." },
            { accent: "#9c50f5", title: "Community & social media",   desc: "Live X Spaces on race weekends, Lagos watch parties, fantasy league with 200+ players, and race-day threads across all platforms." },
          ].map(item => (
            <div key={item.title} style={{ background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "20px 22px", display: "flex", gap: 14 }}>
              <div style={{ width: 3, minHeight: 44, borderRadius: 2, background: item.accent, flexShrink: 0, marginTop: 4 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--f1-text)", marginBottom: 5 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a href="mailto:ads@f1naija.com" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "rgba(245,167,36,.15)", border: "1px solid rgba(245,167,36,.35)", color: "#f5a724", textDecoration: "none", minHeight: 44 }}>
            📩 ads@f1naija.com
          </a>
          <Link href="/partner" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "transparent", border: "1px solid rgba(255,255,255,.14)", color: "var(--f1-text)", textDecoration: "none", minHeight: 44 }}>
            🤝 Partner With Us →
          </Link>
        </div>
      </section>

      <SectionDivider />

      {/* ── RACE ALERTS ───────────────────────────────────────── */}
      <PushNotificationBanner />

      <SectionDivider />

      {/* ── ALL CHANNELS ──────────────────────────────────────── */}
      <section aria-label="Social channels" style={{ padding: "56px 0 72px" }}>
        <div style={{ marginBottom: 36 }}>
          <EyebrowLabel text="All Our Channels" />
          <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-.025em", lineHeight: .95, margin: 0 }}>
            Find us everywhere<br />
            <span style={{ color: "#00d484" }}>you watch.</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 10,
        }}>
          <SocialCard icon="𝕏"  platform="X / Twitter"  handle="@f1_naija"  followers={fmt(stats.twitter)}   href="https://x.com/f1_naija" live={stats.twitterLive} />
          <SocialCard icon="📸" platform="Instagram"     handle="@f1_naija"  followers={fmt(stats.instagram)} href="https://www.instagram.com/f1_naija/" />
          <SocialCard icon="🧵" platform="Threads"       handle="@f1_naija"  followers={fmt(stats.threads)}   href="https://www.threads.com/@f1_naija" />
          <SocialCard icon="📘" platform="Facebook"      handle="F1 Naija"                                                         href="https://www.facebook.com/f1naija/" />
          <SocialCard icon="🎵" platform="TikTok"        handle="@f1.naija"                                                        href="https://www.tiktok.com/@f1.naija" />
        </div>
      </section>

    </div>
  );
}
