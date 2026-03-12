"use client";

import Link from "next/link";

const LEAGUE_CODE = "C1JYXEPWR10";
const LEAGUE_URL  = `https://fantasy.formula1.com/en/leagues/join/${LEAGUE_CODE}`;

const PRIZES = [
  { pos: "🥇", label: "1st Place — 2026 Season", prize: "F1 Naija merchandise pack + shoutout across all socials" },
  { pos: "🥈", label: "2nd Place — 2026 Season", prize: "F1 Naija digital bundle + social shoutout" },
  { pos: "🥉", label: "3rd Place — 2026 Season", prize: "Exclusive F1 Naija badge + social shoutout" },
];

const HOW_TO_PLAY = [
  { step: "01", title: "Create your F1 Fantasy team", desc: "Head to the official F1 Fantasy platform and pick your 5 drivers + 2 constructors within the $100M budget." },
  { step: "02", title: "Join the F1 Naija League", desc: `Use our private league code "${LEAGUE_CODE}" to join the F1 Naija community league and compete against other Naija fans.` },
  { step: "03", title: "Pick your chips wisely", desc: "Use your Mega Driver, No Negative, Extra DRS, and Wildcard chips at the right time to maximise your score." },
  { step: "04", title: "Track the leaderboard", desc: "Check back here each race weekend to see where you stand. Top of the F1 Naija board by season end wins the prize." },
];

const FAQS = [
  {
    q: "Is it free to play?",
    a: "Yes — the official F1 Fantasy game is completely free to join. You just need an F1 account (also free).",
  },
  {
    q: "When does the season start?",
    a: "The fantasy season runs alongside the F1 calendar, starting from the first race of the year. You can join at any time, but earlier is better!",
  },
  {
    q: "Can I change my team?",
    a: "Yes. You get one free transfer per race week. Additional transfers cost -10 points each. Use your Wildcard chip for unlimited changes in a single week.",
  },
  {
    q: "How are points scored?",
    a: "Drivers earn points for qualifying positions, race positions, fastest lap, positions gained/lost, and more. Constructors earn points based on both their drivers' results.",
  },
  {
    q: "Do I need a premium subscription?",
    a: "No. Standard F1 Fantasy is completely free. F1 TV Pro is separate and not required to play fantasy.",
  },
];

export default function FantasyPage() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes fantasyFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ffy-1 { animation: fantasyFadeUp .5s ease .05s both; }
        .ffy-2 { animation: fantasyFadeUp .5s ease .15s both; }
        .ffy-3 { animation: fantasyFadeUp .5s ease .25s both; }
      `}</style>

      {/* ── PAGE HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,7vw,72px) 0 clamp(32px,5vw,52px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        {/* Grid background */}
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
        }}>FANTASY</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="ffy-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#f5a724" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#f5a724" }}>
              2026 Season · 200+ players and counting
            </span>
          </div>
          <div className="ffy-2" style={{ lineHeight: .92, marginBottom: 18 }}>
            <div style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              F1 Naija
            </div>
            <div style={{
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#f5a724 0%,#ffda6a 50%,#00d484 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Fantasy League.
            </div>
          </div>
          <p className="ffy-3" style={{ fontSize: 14, color: "var(--f1-muted)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 24px" }}>
            Pick your drivers, build your team, and go against the best Naija F1 fans in our private Fantasy league. Free to play, big bragging rights.
          </p>
          <a
            href={LEAGUE_URL}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 800,
              background: "linear-gradient(135deg,#f5a724,#e8001f)",
              color: "#fff", textDecoration: "none", letterSpacing: ".02em",
            }}
          >
            🏆 Join the League — Code: {LEAGUE_CODE}
          </a>
        </div>
      </div>

      <div style={{ padding: "clamp(32px,5vw,60px) 0 80px" }}>

        {/* ── HOW TO PLAY ── */}
        <section aria-label="How to play" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              How to play
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {HOW_TO_PLAY.map(item => (
              <div key={item.step} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "20px 22px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 900, color: "#f5a724",
                  letterSpacing: ".1em", fontFamily: "monospace",
                }}>STEP {item.step}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--f1-text)" }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRIZES ── */}
        <section aria-label="End-of-season prizes" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              End-of-season prizes
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PRIZES.map(p => (
              <div key={p.pos} style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "16px 20px",
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{p.pos}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--f1-text)", marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "var(--f1-muted)" }}>{p.prize}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#52525b", marginTop: 10, lineHeight: 1.6 }}>
            * 2026 season prizes subject to change. Winners announced after the Abu Dhabi Grand Prix (final round).
          </p>
        </section>

        {/* ── FAQS ── */}
        <section aria-label="Frequently asked questions" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              FAQ
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map(faq => (
              <div key={faq.q} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--f1-text)", marginBottom: 8 }}>{faq.q}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{
          background: "rgba(245,167,36,.06)", border: "1px solid rgba(245,167,36,.18)",
          borderRadius: 14, padding: "clamp(24px,4vw,36px)", textAlign: "center",
        }}>
          <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: "var(--f1-text)", marginBottom: 10 }}>
            Ready to join the league?
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            Use league code <strong style={{ color: "#f5a724", fontFamily: "monospace" }}>{LEAGUE_CODE}</strong> on the official F1 Fantasy platform to join the F1 Naija private league.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href={LEAGUE_URL}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "12px 26px", minHeight: 44, borderRadius: 7, fontSize: 13, fontWeight: 700,
                background: "#f5a724", color: "#04060e", textDecoration: "none",
              }}
            >
              🏆 Join on F1 Fantasy
            </a>
            <Link href="/community" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", minHeight: 44, borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "transparent", color: "var(--f1-text)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,.14)",
            }}>
              Join the Community
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
