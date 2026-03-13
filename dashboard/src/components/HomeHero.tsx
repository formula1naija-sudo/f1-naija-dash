"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

const CITIES = [
  "🇳🇬 LAGOS", "🇬🇧 LONDON", "🇺🇸 HOUSTON", "🇨🇦 TORONTO", "🇦🇪 DUBAI",
  "🇳🇬 ABUJA", "🇿🇦 JOHANNESBURG", "🇳🇬 PORT HARCOURT", "🇳🇱 AMSTERDAM", "🇩🇪 BERLIN",
];

export default function HomeHero() {
  const [cityIdx, setCityIdx]     = useState(0);
  const [cityVisible, setCityVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCityVisible(false);
      setTimeout(() => { setCityIdx(i => (i + 1) % CITIES.length); setCityVisible(true); }, 220);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes heroTitleUp { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes heroFadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroCityIn  { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .hero-title-1 { animation: heroTitleUp .55s cubic-bezier(.16,1,.3,1) .70s both; }
        .hero-title-2 { animation: heroTitleUp .55s cubic-bezier(.16,1,.3,1) .85s both; }
        .hero-fade-1  { animation: heroFadeUp  .5s ease 1.05s both; }
        .hero-fade-2  { animation: heroFadeUp  .5s ease 1.20s both; }
        .hero-fade-3  { animation: heroFadeUp  .5s ease 1.35s both; }
        .hero-city-in { animation: heroCityIn  .35s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      <section style={{
        background: "#04060e", position: "relative", overflow: "hidden",
        padding: "clamp(28px,6vw,96px) 0 clamp(36px,7vw,108px)",
      }}>
        {/* bg grid */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 30% 50%,black 20%,transparent 70%)",
          maskImage: "radial-gradient(ellipse 70% 70% at 30% 50%,black 20%,transparent 70%)",
        }} />
        {/* glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 70% at 10% 55%,rgba(0,212,132,.055) 0%,transparent 60%)",
        }} />
        {/* watermark */}
        <div style={{ position: "absolute", bottom: -20, right: -10,
          fontSize: "clamp(120px,17vw,230px)", fontWeight: 900, letterSpacing: "-.02em",
          color: "rgba(255,255,255,.013)", lineHeight: 1, pointerEvents: "none", userSelect: "none",
        }}>NAIJA</div>

        {/* ── Content ────────────────────────────────── */}
        <div className="relative z-10 flex flex-col px-6 lg:px-12" style={{ maxWidth: 640 }}>

          {/* eyebrow */}
          <div className="hero-fade-1 mb-4 flex items-center gap-2">
            <div style={{ width: 20, height: 1, background: "#00d484", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Formula 1 · Season 2026
            </span>
          </div>

          {/* logo */}
          <div className="hero-fade-1 mb-4">
            <Image
              src="/tag-logo.png" alt="F1 Naija"
              width={260} height={260}
              style={{ objectFit: "contain", width: "min(200px, 48vw)", height: "auto", filter: "drop-shadow(0 0 20px rgba(0,212,132,0.35))" }}
              priority
            />
          </div>

          {/* title */}
          <div style={{ lineHeight: .9, marginBottom: 20 }}>
            <div style={{ overflow: "hidden", display: "block" }}>
              <div className="hero-title-1" style={{
                fontSize: "clamp(56px,7.5vw,112px)", fontWeight: 900,
                letterSpacing: "-.035em", lineHeight: .92, color: "var(--f1-text)",
              }}>F1</div>
            </div>
            <div style={{ overflow: "hidden", display: "block" }}>
              <div className="hero-title-2" style={{
                fontSize: "clamp(56px,7.5vw,112px)", fontWeight: 900,
                letterSpacing: "-.035em", lineHeight: .92,
                background: "linear-gradient(120deg,#00d484 0%,#00f0a0 40%,#f5a724 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>NAIJA</div>
            </div>
          </div>

          {/* tagline */}
          <p className="hero-fade-2" style={{ fontSize: 15, lineHeight: 1.7, color: "var(--f1-muted)", maxWidth: 420, marginBottom: 24 }}>
            Nigeria&apos;s #1 Formula 1 platform. Live timing, race data, and community — built for{" "}
            <strong style={{ color: "var(--f1-text)", fontWeight: 600 }}>Naija fans everywhere.</strong>
          </p>

          {/* CTAs */}
          <div className="hero-fade-2" style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 700,
              background: "#00d484", color: "#04060e", textDecoration: "none", letterSpacing: ".03em",
            }}>🏁 Open Live Dashboard</Link>
            <Link href="/community" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "transparent", color: "var(--f1-text)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,.14)", letterSpacing: ".03em",
            }}>Join the Community</Link>
          </div>

          {/* city ticker */}
          <div className="hero-fade-3 flex items-center gap-3">
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--f1-muted)", whiteSpace: "nowrap" }}>
              Watching from
            </span>
            <div style={{ overflow: "hidden", height: 26, display: "flex", alignItems: "center" }}>
              {cityVisible && (
                <div key={cityIdx} className="hero-city-in" style={{ fontSize: 17, fontWeight: 800, letterSpacing: ".04em", color: "var(--f1-text)" }}>
                  {CITIES[cityIdx]}
                </div>
              )}
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(0,212,132,.3),transparent)" }} />
          </div>
        </div>
      </section>
    </>
  );
}
