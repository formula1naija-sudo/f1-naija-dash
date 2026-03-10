"use client";

import Link from "next/link";

const STATS = [
  { value: "5,000+", label: "Instagram followers" },
  { value: "6,600+", label: "X (Twitter) followers" },
  { value: "1M+",    label: "Monthly impressions" },
  { value: "200+",   label: "Fantasy league players" },
];

const SOCIALS = [
  { href: "https://x.com/f1_naija",              icon: "𝕏",  label: "X (Twitter)", handle: "@f1_naija" },
  { href: "https://www.instagram.com/f1_naija/", icon: "📸", label: "Instagram",   handle: "@f1_naija" },
  { href: "https://www.threads.com/@f1_naija",   icon: "🧵", label: "Threads",     handle: "@f1_naija" },
  { href: "https://www.tiktok.com/@f1.naija",    icon: "🎵", label: "TikTok",      handle: "@f1.naija" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes aboutFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .about-1 { animation: aboutFadeUp .5s ease .05s both; }
        .about-2 { animation: aboutFadeUp .5s ease .15s both; }
        .about-3 { animation: aboutFadeUp .5s ease .25s both; }
        .about-4 { animation: aboutFadeUp .5s ease .35s both; }
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
        }}>NAIJA</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="about-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Built for the culture
            </span>
          </div>
          <div className="about-2" style={{ lineHeight: .92, marginBottom: 18 }}>
            <div style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              About
            </div>
            <div style={{
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#00d484 0%,#00f0a0 50%,#f5a724 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              F1 Naija.
            </div>
          </div>
          <p className="about-3" style={{ fontSize: 14, color: "var(--f1-muted)", maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
            Nigeria&apos;s #1 Formula 1 platform — live timing, race data, standings, and community, built for Naija fans everywhere.
          </p>
        </div>
      </div>

      <div style={{ padding: "clamp(32px,5vw,60px) 0 80px" }}>

        {/* ── STORY ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Our Story
            </span>
          </div>
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14, padding: "clamp(20px,4vw,36px)",
          }}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--f1-muted)", margin: "0 0 16px" }}>
              F1 Naija started with a simple question: <strong style={{ color: "var(--f1-text)" }}>why isn&apos;t there a Formula 1 platform made for us?</strong> Nigerian fans have always been passionate about the sport — watching races at odd WAT hours, running fantasy leagues in WhatsApp groups, debating strategy in comment sections. But nothing existed that spoke to our culture.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--f1-muted)", margin: 0 }}>
              So we built it. F1 Naija launched as a community and social media presence before growing into a full live-timing platform. Today it&apos;s home to thousands of Nigerian F1 fans across Lagos, London, Houston, Dubai, and everywhere in between.
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              By the numbers
            </span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 12,
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "20px 18px", textAlign: "center",
              }}>
                <div style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: "-.025em", color: "#00d484", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 6, lineHeight: 1.4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT WE DO ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              What we do
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {[
              { icon: "📡", title: "Live Timing Dashboard", desc: "Real-time telemetry, gaps, sector times, and tyre data — exactly as it happens on track." },
              { icon: "🏆", title: "Championship Standings", desc: "Driver and constructor standings updated the moment each race ends." },
              { icon: "📅", title: "Race Calendar", desc: "Every round of the 2026 season with session times in WAT, GMT, EST, and your local timezone." },
              { icon: "📰", title: "F1 News", desc: "Headlines from BBC Sport, Autosport, The Race, Planet F1, and more — in one feed." },
              { icon: "🇳🇬", title: "Community", desc: "Fantasy leagues, race-day watch parties, X Spaces live reactions, and WhatsApp communities." },
            ].map(item => (
              <div key={item.title} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--f1-text)", marginBottom: 6 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Get in touch
            </span>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12,
          }}>
            <a
              href="mailto:ads@f1naija.com"
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "18px 20px", textDecoration: "none",
                transition: "border-color .2s",
              }}
              onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
              onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>📩</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)", marginBottom: 3 }}>Partnerships &amp; Advertising</div>
                <div style={{ fontSize: 12, color: "#00d484" }}>ads@f1naija.com</div>
              </div>
            </a>
            {SOCIALS.map(s => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 12, padding: "18px 20px", textDecoration: "none",
                  transition: "border-color .2s",
                }}
                onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
                onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
              >
                <div style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: "var(--f1-muted)" }}>{s.handle}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 10, color: "#00d484" }}>↗</div>
              </a>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{
          background: "rgba(0,212,132,.06)", border: "1px solid rgba(0,212,132,.18)",
          borderRadius: 14, padding: "clamp(24px,4vw,36px)", textAlign: "center",
        }}>
          <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: "var(--f1-text)", marginBottom: 10 }}>
            Ready to experience F1 the Naija way?
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            Live timing, race data, and a community of thousands of Nigerian F1 fans — all in one place.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 700,
              background: "#00d484", color: "#04060e", textDecoration: "none",
            }}>
              🏁 Open Live Dashboard
            </Link>
            <Link href="/community" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 600,
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
