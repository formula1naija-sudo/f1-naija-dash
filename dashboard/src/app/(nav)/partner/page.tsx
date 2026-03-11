"use client";

import Link from "next/link";

const STATS = [
  { value: "5K+",   label: "Instagram followers" },
  { value: "6.6K+", label: "X (Twitter) followers" },
  { value: "1M+",   label: "Monthly impressions" },
  { value: "200+",  label: "Fantasy league players" },
  { value: "25K+",  label: "Monthly website visits" },
  { value: "130+",  label: "Countries reached" },
];

const PACKAGES = [
  {
    tier: "Bronze",
    color: "#cd7f32",
    border: "rgba(205,127,50,.25)",
    bg: "rgba(205,127,50,.06)",
    price: "On request",
    features: [
      "Logo in website footer",
      "1× social media mention per month",
      "Logo on race-day posts",
    ],
  },
  {
    tier: "Silver",
    color: "#9ca3af",
    border: "rgba(156,163,175,.25)",
    bg: "rgba(156,163,175,.06)",
    price: "On request",
    features: [
      "Everything in Bronze",
      "Dedicated sponsor card on homepage",
      "4× social media posts per month",
      "Logo on live dashboard header",
      "Inclusion in weekly race previews",
    ],
  },
  {
    tier: "Gold",
    color: "#f5a724",
    border: "rgba(245,167,36,.3)",
    bg: "rgba(245,167,36,.06)",
    price: "On request",
    features: [
      "Everything in Silver",
      "Title sponsor of X Spaces race reactions",
      "Co-branded race content",
      "Inclusion in race-day WhatsApp blasts",
      "Live dashboard banner placement",
      "Custom campaign strategy",
    ],
    featured: true,
  },
];

const AUDIENCE = [
  { icon: "🇳🇬", label: "Primary audience",  value: "Nigerian F1 fans (Lagos, Abuja, PH)" },
  { icon: "🌍", label: "Diaspora reach",     value: "London, Houston, Dubai, Toronto" },
  { icon: "👤", label: "Core demographic",   value: "18–35, tech-savvy, sports-engaged" },
  { icon: "📅", label: "Peak engagement",    value: "Race weekends (Fri–Sun)" },
];

export default function PartnerPage() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes partnerFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pfy-1 { animation: partnerFadeUp .5s ease .05s both; }
        .pfy-2 { animation: partnerFadeUp .5s ease .15s both; }
        .pfy-3 { animation: partnerFadeUp .5s ease .25s both; }
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
        }}>PARTNER</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="pfy-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Partnerships &amp; advertising
            </span>
          </div>
          <div className="pfy-2" style={{ lineHeight: .92, marginBottom: 18 }}>
            <div style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              Reach Naija&apos;s
            </div>
            <div style={{
              fontSize: "clamp(40px,6vw,80px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#00d484 0%,#00f0a0 50%,#f5a724 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              F1 Community.
            </div>
          </div>
          <p className="pfy-3" style={{ fontSize: 14, color: "var(--f1-muted)", maxWidth: 540, lineHeight: 1.7, margin: "0 0 24px" }}>
            F1 Naija is the largest Nigerian Formula 1 platform — reaching over a million impressions monthly across Nigeria and the global Naija diaspora.
            Partner with us to put your brand in front of Africa&apos;s most passionate motorsport audience.
          </p>
          <a
            href="mailto:ads@f1naija.com"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 800,
              background: "#00d484", color: "#04060e", textDecoration: "none",
            }}
          >
            📩 Get in Touch — ads@f1naija.com
          </a>
        </div>
      </div>

      <div style={{ padding: "clamp(32px,5vw,60px) 0 80px" }}>

        {/* ── AUDIENCE ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Our audience
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AUDIENCE.map(a => (
              <div key={a.label} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12, padding: "14px 18px",
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>{a.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--f1-text)" }}>{a.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Platform reach
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

        {/* ── PACKAGES ── */}
        <section style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Partnership packages
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {PACKAGES.map(pkg => (
              <div key={pkg.tier} style={{
                background: pkg.featured ? pkg.bg : "var(--f1-card)",
                border: `1px solid ${pkg.border}`,
                borderRadius: 14, padding: "24px 22px",
                display: "flex", flexDirection: "column", gap: 16,
                position: "relative",
              }}>
                {pkg.featured && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                    background: pkg.color, color: "#04060e",
                    padding: "3px 8px", borderRadius: 4,
                  }}>
                    Most Popular
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: pkg.color, marginBottom: 4 }}>{pkg.tier}</div>
                  <div style={{ fontSize: 13, color: "var(--f1-muted)" }}>{pkg.price}</div>
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {pkg.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--f1-muted)" }}>
                      <span style={{ color: pkg.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:ads@f1naija.com"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                    background: `rgba(${pkg.color === "#f5a724" ? "245,167,36" : pkg.color === "#9ca3af" ? "156,163,175" : "205,127,50"},.15)`,
                    border: `1px solid ${pkg.border}`,
                    color: pkg.color, textDecoration: "none",
                    marginTop: "auto",
                  }}
                >
                  Get in Touch →
                </a>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#52525b", marginTop: 12, lineHeight: 1.6 }}>
            All packages are negotiable. We also offer custom campaigns, race-weekend activations, and one-off sponsored posts. Email us to discuss.
          </p>
        </section>

        {/* ── CTA ── */}
        <div style={{
          background: "rgba(0,212,132,.06)", border: "1px solid rgba(0,212,132,.18)",
          borderRadius: 14, padding: "clamp(24px,4vw,36px)", textAlign: "center",
        }}>
          <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: "var(--f1-text)", marginBottom: 10 }}>
            Ready to partner with F1 Naija?
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            Reach over a million F1-loving Nigerians. Drop us an email and we&apos;ll get back to you within 48 hours.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="mailto:ads@f1naija.com"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 700,
                background: "#00d484", color: "#04060e", textDecoration: "none",
              }}
            >
              📩 Email ads@f1naija.com
            </a>
            <Link href="/about" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "transparent", color: "var(--f1-text)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,.14)",
            }}>
              Learn More About Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
