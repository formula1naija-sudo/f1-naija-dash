"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CITIES = [
  "🇳🇬 LAGOS", "🇬🇧 LONDON", "🇺🇸 HOUSTON", "🇨🇦 TORONTO",
  "🇦🇪 DUBAI",  "🇳🇬 ABUJA",  "🇿🇦 JOHANNESBURG", "🇳🇬 PORT HARCOURT",
  "🇳🇱 AMSTERDAM", "🇩🇪 BERLIN",
];

const MARQUEE_CITIES = [
  { flag: "🇳🇬", name: "Lagos" },
  { flag: "🇬🇧", name: "London" },
  { flag: "🇺🇸", name: "Houston" },
  { flag: "🇨🇦", name: "Toronto" },
  { flag: "🇦🇪", name: "Dubai" },
  { flag: "🇿🇦", name: "Johannesburg" },
  { flag: "🇦🇺", name: "Melbourne" },
  { flag: "🇳🇱", name: "Amsterdam" },
  { flag: "🇩🇪", name: "Berlin" },
  { flag: "🇳🇬", name: "Abuja" },
  { flag: "🇺🇸", name: "New York" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇳🇬", name: "Port Harcourt" },
  { flag: "🇮🇪", name: "Dublin" },
];

const MOCK_DRIVERS = [
  { pos: 1, fn: "Max",     ln: "VERSTAPPEN", color: "#3671c6", baseGap: null,  sectors: ["p","g","g"] as const },
  { pos: 2, fn: "Lando",   ln: "NORRIS",     color: "#ff8000", baseGap: 8.432, sectors: ["g","g","p"] as const },
  { pos: 3, fn: "Charles", ln: "LECLERC",    color: "#e8001f", baseGap: 14.61, sectors: ["g","g","y"] as const },
  { pos: 4, fn: "Lewis",   ln: "HAMILTON",   color: "#e8001f", baseGap: 22.09, sectors: ["p","p","g"] as const },
  { pos: 5, fn: "Carlos",  ln: "SAINZ",      color: "#64c4ff", baseGap: 29.44, sectors: ["y","g","g"] as const },
];

const SECTOR_COLORS: Record<string, string> = {
  p: "#9c50f5",
  g: "#00d484",
  y: "#f5a724",
};

export default function HomeHero() {
  const [cityIdx, setCityIdx]     = useState(0);
  const [cityVisible, setCityVisible] = useState(true);
  const [gaps, setGaps]           = useState(MOCK_DRIVERS.map(d => d.baseGap));
  const [mounted, setMounted]     = useState(false);
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // city cycler
    const cityTimer = setInterval(() => {
      setCityVisible(false);
      setTimeout(() => {
        setCityIdx(i => (i + 1) % CITIES.length);
        setCityVisible(true);
      }, 220);
    }, 2600);

    // gap jitter
    const gapTimer = setInterval(() => {
      setGaps(prev =>
        prev.map(g =>
          g === null ? null : parseFloat((g + (Math.random() - 0.5) * 0.12).toFixed(3))
        )
      );
    }, 2200);

    // local time (WAT = UTC+1)
    const timeTimer = setInterval(() => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Africa/Lagos",
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => {
      clearInterval(cityTimer);
      clearInterval(gapTimer);
      clearInterval(timeTimer);
    };
  }, []);

  return (
    <>
      <style>{`
        @property --glow-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes rotateBorder {
          to { --glow-angle: 360deg; }
        }
        @keyframes heroTitleUp {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroCityIn {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes heroLivePulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: .4; transform: scale(.6); }
        }
        @keyframes heroMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .hero-title-1 {
          animation: heroTitleUp .55s cubic-bezier(.16,1,.3,1) .7s both;
        }
        .hero-title-2 {
          animation: heroTitleUp .55s cubic-bezier(.16,1,.3,1) .85s both;
        }
        .hero-fade-1 { animation: heroFadeUp .5s ease 1.05s both; }
        .hero-fade-2 { animation: heroFadeUp .5s ease 1.2s  both; }
        .hero-fade-3 { animation: heroFadeUp .5s ease 1.35s both; }
        .hero-card-in { animation: heroFadeUp .8s ease .9s both; }
        .hero-city-in { animation: heroCityIn .35s cubic-bezier(.16,1,.3,1) both; }
        .hero-live-dot { animation: heroLivePulse 1.2s ease-in-out infinite; }
        .hero-glow-wrap {
          padding: 2px;
          border-radius: 16px;
          background: conic-gradient(
            from var(--glow-angle),
            #00d484 0%, #00f0a0 15%, #f5a724 35%,
            rgba(255,255,255,.04) 55%, #00d484 75%, #f5a724 90%, #00d484 100%
          );
          animation: rotateBorder 5s linear infinite;
          box-shadow: 0 0 60px rgba(0,212,132,.1), 0 0 120px rgba(0,212,132,.05);
        }
        .hero-marquee-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: heroMarquee 32s linear infinite;
        }
      `}</style>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section
        style={{
          background: "#04060e",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "grid",
        }}
        className="lg:grid-cols-2"
      >
        {/* bg grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 30% 50%,black 20%,transparent 70%)",
          maskImage: "radial-gradient(ellipse 70% 70% at 30% 50%,black 20%,transparent 70%)",
        }} />
        {/* green glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 70% at 10% 55%,rgba(0,212,132,.055) 0%,transparent 60%)",
        }} />
        {/* NAIJA watermark */}
        <div style={{
          position: "absolute", bottom: -20, right: -10,
          fontSize: "clamp(120px,17vw,230px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.013)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none",
        }}>NAIJA</div>

        {/* LEFT ─ copy */}
        <div
          className="relative z-10 flex flex-col justify-center px-6 py-20 lg:px-12"
        >
          <div className="hero-fade-1 mb-7 flex items-center gap-2">
            <div style={{ width: 20, height: 1, background: "#00d484", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Formula 1 · Season 2026
            </span>
          </div>

          {/* TITLE */}
          <div style={{ lineHeight: .9, marginBottom: 28 }}>
            <div style={{ overflow: "hidden", display: "block" }}>
              <div className="hero-title-1" style={{
                fontSize: "clamp(64px,7.5vw,112px)", fontWeight: 900,
                letterSpacing: "-.035em", lineHeight: .92, color: "#edf2ff",
              }}>F1</div>
            </div>
            <div style={{ overflow: "hidden", display: "block" }}>
              <div className="hero-title-2" style={{
                fontSize: "clamp(64px,7.5vw,112px)", fontWeight: 900,
                letterSpacing: "-.035em", lineHeight: .92,
                background: "linear-gradient(120deg,#00d484 0%,#00f0a0 40%,#f5a724 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>NAIJA</div>
            </div>
          </div>

          <p className="hero-fade-2" style={{
            fontSize: 15, lineHeight: 1.7, color: "#5a6888",
            maxWidth: 400, marginBottom: 32,
          }}>
            The home of Formula 1 for{" "}
            <strong style={{ color: "#edf2ff", fontWeight: 600 }}>Naija fans everywhere</strong>{" "}
            — Lagos to London, Houston to Dubai.
          </p>

          {/* CTAs */}
          <div className="hero-fade-2" style={{ display: "flex", gap: 12, marginBottom: 44, flexWrap: "wrap" }}>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 700,
                background: "#00d484", color: "#04060e", textDecoration: "none", letterSpacing: ".03em",
              }}
            >
              🏁 Open Dashboard
            </Link>
            <Link
              href="/schedule"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                background: "transparent", color: "#edf2ff", textDecoration: "none",
                border: "1px solid rgba(255,255,255,.14)", letterSpacing: ".03em",
              }}
            >
              View Schedule
            </Link>
          </div>

          {/* City cycler */}
          <div className="hero-fade-3 flex items-center gap-3">
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#5a6888", whiteSpace: "nowrap" }}>
              Watching from
            </span>
            <div style={{ overflow: "hidden", height: 26, display: "flex", alignItems: "center" }}>
              {cityVisible && (
                <div
                  key={cityIdx}
                  className="hero-city-in"
                  style={{ fontSize: 17, fontWeight: 800, letterSpacing: ".04em", color: "#edf2ff" }}
                >
                  {CITIES[cityIdx]}
                </div>
              )}
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(0,212,132,.3),transparent)" }} />
          </div>
        </div>

        {/* RIGHT ─ logo */}
        <div className="hero-card-in relative z-10 flex items-center justify-center px-6 py-10 lg:py-20 lg:pr-8">
          {/* ambient glow behind logo */}
          <div style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(0,212,132,.12) 0%,transparent 70%)",
            pointerEvents: "none",
          }} />
          <img
            src="/tag-logo.png"
            alt="F1 Naija"
            style={{
              width: "min(380px, 80vw)",
              height: "min(380px, 80vw)",
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 0 60px rgba(0,212,132,0.25))",
            }}
          />
        </div>
      </section>

      {/* #── MARQUEE ────────────────────────────────────── */}
      <div style={{
        background: "#0d1424",
        borderTop: "1px solid rgba(255,255,255,.05)",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        overflow: "hidden", height: 38, display: "flex", alignItems: "center",
      }}>
        <div className="hero-marquee-track">
          {[...MARQUEE_CITIES, ...MARQUEE_CITIES].map((c, i) => (
            <div key={i} style={{
              padding: "0 22px", fontSize: 10, fontWeight: 700,
              letterSpacing: ".1em", textTransform: "uppercase", color: "#5a6888",
              display: "flex", alignItems: "center", gap: 6,
              borderRight: "1px solid rgba(255,255,255,.06)",
            }}>
              <span style={{ fontSize: 13 }}>{c.flag}</span>
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
