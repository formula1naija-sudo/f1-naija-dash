"use client";

import { useState } from "react";
import Link from "next/link";

const STATS = [
  { value: "5K+",   label: "Instagram followers" },
  { value: "6.6K+", label: "X (Twitter) followers" },
  { value: "1M+",   label: "Monthly impressions" },
  { value: "200+",  label: "Fantasy league players" },
  { value: "25K+",  label: "Monthly website visits" },
  { value: "130+",  label: "Countries reached" },
];

const AUDIENCE = [
  { icon: "🇳🇬", label: "Primary audience",  value: "Nigerian F1 fans (Lagos, Abuja, PH)" },
  { icon: "🌍", label: "Diaspora reach",     value: "London, Houston, Dubai, Toronto" },
  { icon: "👤", label: "Core demographic",   value: "18–35, tech-savvy, sports-engaged" },
  { icon: "📅", label: "Peak engagement",    value: "Race weekends (Fri–Sun)" },
];

const PAST_BRANDS = [
  { name: "DStv",        color: "#00AEEF", bg: "rgba(0,174,239,.08)",   border: "rgba(0,174,239,.2)",   desc: "Africa's leading pay-TV provider" },
  { name: "Heineken",    color: "#009E47", bg: "rgba(0,158,71,.08)",    border: "rgba(0,158,71,.2)",    desc: "Official F1 beer partner" },
  { name: "Partyvest",   color: "#7C3AED", bg: "rgba(124,58,237,.08)",  border: "rgba(124,58,237,.2)",  desc: "Nigerian fintech & lifestyle brand" },
  { name: "Glenfiddich", color: "#C8941A", bg: "rgba(200,148,26,.08)",  border: "rgba(200,148,26,.2)",  desc: "World's most awarded single malt" },
];

interface FormState {
  name: string;
  brand: string;
  email: string;
  message: string;
}

export default function PartnerPage() {
  const [form, setForm] = useState<FormState>({ name: "", brand: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Partnership Enquiry — ${form.brand || form.name}`);
    const body = encodeURIComponent(
      `Hi F1 Naija team,\n\nName: ${form.name}\nBrand: ${form.brand}\nEmail: ${form.email}\n\n${form.message}\n\nSent via f1-naija.vercel.app/partner`
    );
    window.open(`mailto:ads@f1naija.com?subject=${subject}&body=${body}`, "_blank");
    setSubmitted(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8, padding: "12px 14px",
    fontSize: 13, color: "var(--f1-text)",
    outline: "none", fontFamily: "inherit",
  };

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
        .partner-input:focus { border-color: rgba(0,212,132,.4) !important; }
        .partner-input::placeholder { color: #52525b; }
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
        <section aria-label="Our audience" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
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
        <section aria-label="Platform reach" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
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

        {/* ── BRANDS WE'VE WORKED WITH ── */}
        <section aria-label="Brands we've worked with" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Brands we&apos;ve worked with
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", marginBottom: 20, lineHeight: 1.6 }}>
            Trusted by leading brands reaching Nigeria&apos;s F1 fanbase.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 12 }}>
            {PAST_BRANDS.map(b => (
              <div key={b.name} style={{
                background: b.bg,
                border: `1px solid ${b.border}`,
                borderRadius: 12, padding: "22px 20px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: b.color, letterSpacing: "-.01em" }}>
                  {b.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.5 }}>
                  {b.desc}
                </div>
              </div>
            ))}
            {/* "and others" placeholder */}
            <div style={{
              background: "rgba(255,255,255,.03)",
              border: "1px dashed rgba(255,255,255,.1)",
              borderRadius: 12, padding: "22px 20px",
              display: "flex", flexDirection: "column", gap: 8,
              alignItems: "flex-start", justifyContent: "center",
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--f1-muted)", letterSpacing: "-.01em" }}>
                + others
              </div>
              <div style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.5 }}>
                More brands across FMCG, fintech, lifestyle & media
              </div>
            </div>
          </div>

        </section>

        {/* ── CONTACT FORM ── */}
        <section aria-label="Contact us" style={{ marginBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
              Get in touch
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--f1-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            Tell us about your brand and we&apos;ll get back to you within 48 hours.
          </p>

          <div style={{
            background: "var(--f1-card)", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14, padding: "clamp(24px,4vw,36px)",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--f1-text)", marginBottom: 8 }}>
                  Email client opened!
                </div>
                <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                  Your message has been pre-filled in your email client. Hit send and we&apos;ll get back to you within 48 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 7, padding: "10px 18px", fontSize: 12, fontWeight: 600,
                    color: "var(--f1-muted)", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Your name *
                    </label>
                    <input
                      className="partner-input"
                      required
                      type="text"
                      placeholder="Chidi Okeke"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Brand / company *
                    </label>
                    <input
                      className="partner-input"
                      required
                      type="text"
                      placeholder="Brand name"
                      value={form.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                    Email address *
                  </label>
                  <input
                    className="partner-input"
                    required
                    type="email"
                    placeholder="you@brand.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--f1-muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                    Tell us about your campaign
                  </label>
                  <textarea
                    className="partner-input"
                    rows={4}
                    placeholder="What are your goals? Which audiences do you want to reach? Any specific race weekends or activations in mind?"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px 28px", minHeight: 48, borderRadius: 8, fontSize: 14, fontWeight: 800,
                    background: "#00d484", color: "#04060e", border: "none",
                    cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start",
                  }}
                >
                  📩 Send Message
                </button>

                <p style={{ fontSize: 11, color: "#52525b", margin: 0, lineHeight: 1.6 }}>
                  This will open your email client with your message pre-filled. We respond within 48 hours.
                </p>
              </form>
            )}
          </div>
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
                padding: "12px 26px", minHeight: 44, borderRadius: 7, fontSize: 13, fontWeight: 700,
                background: "#00d484", color: "#04060e", textDecoration: "none",
              }}
            >
              📩 Email ads@f1naija.com
            </a>
            <Link href="/about" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", minHeight: 44, borderRadius: 7, fontSize: 13, fontWeight: 600,
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
