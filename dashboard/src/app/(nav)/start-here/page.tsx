"use client";

import Link from "next/link";

const F1_BASICS = [
  {
    icon: "🏎️",
    title: "What is Formula 1?",
    desc: "Formula 1 is the highest class of international single-seater auto racing. 10 teams (constructors) each field 2 drivers across a ~24-race season. The driver and team with the most points at the end wins the World Championship.",
  },
  {
    icon: "📅",
    title: "The Race Weekend",
    desc: "Each Grand Prix runs over a weekend: Practice sessions (FP1, FP2, FP3) on Friday and Saturday, Qualifying on Saturday to set the grid order, and the Race on Sunday. Some weekends have a Sprint race format — with less practice and an extra mini-race on Saturday.",
  },
  {
    icon: "🏆",
    title: "Points System",
    desc: "The top 10 finishers score points: 25–18–15–12–10–8–6–4–2–1. The driver with the most points at season end is World Drivers' Champion. Constructor points are the total of both drivers combined.",
  },
  {
    icon: "🔴🟡🟢",
    title: "Tyre Strategy",
    desc: "F1 uses three tyre compounds: Soft (red, fastest but wears quickly), Medium (yellow, balanced), and Hard (white, durable). Teams must use at least 2 compounds in a dry race. Pit stop strategy — when to change tyres — is often what decides the winner.",
  },
  {
    icon: "🚩",
    title: "Flags & Safety Car",
    desc: "Yellow flag = caution/slow down. Red flag = stop the race. Safety Car = all cars must follow slowly behind it, no overtaking. Virtual Safety Car (VSC) = same concept, but electronically enforced. Blue flag = you're about to be lapped, let faster car pass.",
  },
  {
    icon: "⚡",
    title: "DRS (Drag Reduction System)",
    desc: "An overtaking aid: a flap on the rear wing opens to reduce drag when a car is within 1 second of the car ahead in designated 'DRS zones'. This gives the following car a speed boost to attempt a pass. DRS is disabled in wet conditions.",
  },
];

const NAIJA_GUIDE = [
  {
    title: "When to watch (WAT)",
    desc: "Most European races start at 14:00–15:00 WAT. Asian/Australian races can be brutal — 06:00–07:00 WAT. American races (Miami, Austin, Las Vegas) are usually 22:00–23:00 WAT. Check the Schedule page for exact times.",
    link: { label: "View Race Schedule", href: "/schedule" },
  },
  {
    title: "How to watch in Nigeria",
    desc: "DStv subscribers can watch on SuperSport F1 (Channel 208). Canal+ subscribers have F1 on Canal+ Sport. Internationally, F1 TV Pro offers live streams globally.",
    link: null,
  },
  {
    title: "Join the community",
    desc: "Don't watch alone! Join the F1 Naija community on X (Twitter), Instagram, and WhatsApp for live reactions, race day threads, and post-race debates.",
    link: { label: "Join the Community", href: "/community" },
  },
  {
    title: "Fantasy League",
    desc: "Play the official F1 Fantasy game and join our private F1 Naija league to compete with 200+ other Naija fans. It's free and very addictive.",
    link: { label: "Join Fantasy League", href: "/fantasy" },
  },
];

const GLOSSARY = [
  { term: "Apex",          def: "The inside point of a corner — the ideal racing line clips through here." },
  { term: "Undercut",      def: "Pitting early to get fresh tyres and come out ahead of a slower rival." },
  { term: "Overcut",       def: "Staying out longer to let the rival pit, then using faster pace to emerge ahead." },
  { term: "Quali",         def: "Qualifying — the Saturday session that determines the starting grid." },
  { term: "Parc Fermé",    def: "Once qualifying begins, teams can't make significant car changes before the race." },
  { term: "Bottoming",     def: "When the floor of the car scrapes the ground — causes sparks and can damage the car." },
  { term: "Marbles",       def: "Rubber debris that builds up off the racing line, making it slippery." },
  { term: "GOAT debate",   def: "Hamilton vs Schumacher — 7 World Championships each. Naija fans have strong opinions." },
];

export default function StartHerePage() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes startFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sfy-1 { animation: startFadeUp .5s ease .05s both; }
        .sfy-2 { animation: startFadeUp .5s ease .15s both; }
        .sfy-3 { animation: startFadeUp .5s ease .25s both; }
      `}</style>

      {/* ── PAGE HERO ── */}
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
        <div style={{
          position: "absolute", bottom: -20, right: -10,
          fontSize: "clamp(80px,13vw,180px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.011)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none",
        }}>START HERE</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="sfy-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              New to F1 Naija? Welcome!
            </span>
          </div>
          <div className="sfy-2" style={{ lineHeight: .92, marginBottom: 18 }}>
            <div style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              Your F1 starter
            </div>
            <div style={{
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#00d484 0%,#00f0a0 50%,#f5a724 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              pack 🇳🇬
            </div>
          </div>
          <p className="sfy-3" style={{ fontSize: 14, color: "var(--f1-muted)", maxWidth: 520, lineHeight: 1.7 }}>
            Just getting into F1? Or watching for years but want to understand the strategy better? This is your guide — written by Naija fans, for Naija fans.
          </p>
        </div>
      </div>

      <div style={{ padding: "clamp(32px,5vw,60px) 0 80px" }}>

        {/* ── F1 BASICS ── */}
        <section aria-label="F1 basics" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              F1 basics
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {F1_BASICS.map(item => (
              <div key={item.title} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "20px 22px",
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--f1-text)", marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── NAIJA FAN GUIDE ── */}
        <section aria-label="The Naija fan guide" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              The Naija fan guide
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {NAIJA_GUIDE.map(item => (
              <div key={item.title} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "20px 22px",
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--f1-text)", marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, margin: "0 0 12px" }}>{item.desc}</p>
                {item.link && (
                  <Link href={item.link.href} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 700, color: "#00d484", textDecoration: "none",
                  }}>
                    {item.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── GLOSSARY ── */}
        <section aria-label="F1 jargon decoder" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              F1 jargon decoder
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
            {GLOSSARY.map(g => (
              <div key={g.term} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#00d484", marginBottom: 4 }}>{g.term}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0 }}>{g.def}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{
          background: "rgba(0,212,132,.06)", border: "1px solid rgba(0,212,132,.18)",
          borderRadius: 14, padding: "clamp(24px,4vw,36px)", textAlign: "center",
        }}>
          <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: "var(--f1-text)", marginBottom: 10 }}>
            Ready to watch the race live?
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            Head to the live dashboard on race day to follow along with real-time timing, gaps, and tyre data. E go be!
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", minHeight: 44, borderRadius: 7, fontSize: 13, fontWeight: 700,
              background: "#00d484", color: "#04060e", textDecoration: "none",
            }}>
              🏁 Open Live Dashboard
            </Link>
            <Link href="/schedule" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", minHeight: 44, borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "transparent", color: "var(--f1-text)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,.14)",
            }}>
              View Race Schedule
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
