"use client";

import Link from "next/link";

const STATS = [
  { value: "6,600+",  label: "X (Twitter) followers" },
  { value: "5,300+",  label: "Instagram followers"   },
  { value: "3,000+",  label: "Threads followers"     },
  { value: "1M+",     label: "Monthly impressions"   },
  { value: "200+",    label: "Fantasy league players" },
  { value: "16,000+", label: "Total audience"        },
];

const AUDIENCE = [
  { flag: "🇳🇬", label: "Nigeria" },
  { flag: "🇬🇧", label: "United Kingdom" },
  { flag: "🇺🇸", label: "United States" },
  { flag: "🌍", label: "West African diaspora" },
];

const SOCIALS = [
  { href: "https://x.com/f1_naija",              icon: "𝕏",  label: "X (Twitter)", handle: "@f1_naija", stat: "6.6K" },
  { href: "https://www.instagram.com/f1_naija/", icon: "📸", label: "Instagram",   handle: "@f1_naija", stat: "5.3K" },
  { href: "https://www.threads.com/@f1_naija",   icon: "🧵", label: "Threads",     handle: "@f1_naija", stat: "3K"   },
  { href: "https://www.tiktok.com/@f1.naija",    icon: "🎵", label: "TikTok",      handle: "@f1.naija", stat: ""     },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>

      {/* ── PAGE HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,7vw,72px) 0 clamp(32px,5vw,52px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        {/* Grid backdrop */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Media &amp; Partnership Enquiries
            </span>
          </div>

          <h1 style={{ lineHeight: .92, margin: "0 0 18px", fontWeight: "inherit" }}>
            <span style={{ display: "block", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              About
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#00d484 0%,#00f0a0 50%,#f5a724 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              F1 Naija.
            </span>
          </h1>

          <p style={{ fontSize: 15, color: "var(--f1-muted)", maxWidth: 600, lineHeight: 1.75, margin: 0 }}>
            F1 Naija is Nigeria&apos;s leading Formula 1 media platform — a real-time live timing dashboard,
            WAT-first race scheduling, curated F1 news, and the largest community of Nigerian F1 fans online.
            We reach over <strong style={{ color: "var(--f1-text)" }}>one million monthly impressions</strong> across
            an audience of <strong style={{ color: "var(--f1-text)" }}>16,000+ followers</strong> spanning Nigeria,
            the UK, the US, and the wider diaspora.
          </p>
        </div>
      </div>

      <div style={{ padding: "clamp(32px,5vw,60px) 0 80px" }}>

        {/* ── REACH & AUDIENCE ── */}
        <section aria-label="Reach and audience" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Reach &amp; audience
            </span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: 10, marginBottom: 20,
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "18px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, letterSpacing: "-.025em", color: "#00d484", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--f1-muted)", marginTop: 5, lineHeight: 1.4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Audience breakdown */}
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 12, padding: "18px 20px",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 12 }}>
              Key markets
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {AUDIENCE.map(a => (
                <span key={a.label} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 20,
                  background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
                  fontSize: 12, fontWeight: 600, color: "var(--f1-text)",
                }}>
                  {a.flag} {a.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT WE DO — prose, no feature cards ── */}
        <section aria-label="What we do" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              What we do
            </span>
          </div>
          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14, padding: "clamp(20px,4vw,32px)",
          }}>
            <p style={{ fontSize: 14, color: "var(--f1-muted)", lineHeight: 1.85, margin: 0, maxWidth: 640 }}>
              We operate a <strong style={{ color: "var(--f1-text)" }}>free real-time live timing dashboard</strong> powered
              by official F1 telemetry — showing live positions, gaps, tyre strategy, sector data, and DRS for every
              session. Alongside that, we publish a <strong style={{ color: "var(--f1-text)" }}>WAT-first race calendar</strong>,
              a curated multi-source news feed, and a <strong style={{ color: "var(--f1-text)" }}>fantasy league</strong> with
              200+ active players. On race weekends we run live X Spaces and race-day threads; we also organise
              Lagos watch parties for grand prix events.
            </p>
          </div>
        </section>

        {/* ── PARTNERSHIPS ── */}
        <section aria-label="Partnerships and press" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Partnerships &amp; press
            </span>
          </div>
          <div style={{
            background: "rgba(245,167,36,.05)", border: "1px solid rgba(245,167,36,.18)",
            borderRadius: 14, padding: "clamp(20px,4vw,32px)",
          }}>
            <p style={{ fontSize: 14, color: "var(--f1-muted)", lineHeight: 1.75, margin: "0 0 20px", maxWidth: 540 }}>
              We work with brands, media organisations, and race venues looking to reach engaged Nigerian F1 fans.
              For sponsorship, content partnerships, advertising, or media enquiries, reach out directly.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <a
                href="mailto:ads@f1naija.com"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: "rgba(245,167,36,.15)", border: "1px solid rgba(245,167,36,.35)",
                  color: "#f5a724", textDecoration: "none", letterSpacing: ".03em",
                  minHeight: 44,
                }}
              >
                📩 ads@f1naija.com
              </a>
              <Link
                href="/partner"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "11px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                  color: "var(--f1-text)", textDecoration: "none",
                  minHeight: 44,
                }}
              >
                Partner with Us →
              </Link>
            </div>
          </div>
        </section>

        {/* ── CHANNELS ── */}
        <section aria-label="Social channels" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Find us
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
            {SOCIALS.map(s => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 12, padding: "16px 18px", textDecoration: "none",
                  transition: "border-color .2s",
                }}
                onMouseEnter={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(0,212,132,.3)"; }}
                onMouseLeave={e => { if (window.matchMedia("(hover:hover)").matches) e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
              >
                <div style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--f1-text)" }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: "var(--f1-muted)" }}>{s.handle}</div>
                </div>
                {s.stat && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#00d484", flexShrink: 0 }}>{s.stat}</div>
                )}
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
              minHeight: 44,
            }}>
              🏁 Open Live Dashboard
            </Link>
            <Link href="/community" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "transparent", color: "var(--f1-text)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,.14)",
              minHeight: 44,
            }}>
              Join the Community
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
