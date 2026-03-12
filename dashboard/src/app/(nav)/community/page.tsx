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

          {/* Fantasy League → link to dedicated page */}
          <SectionCard>
            <EyebrowLabel text="Fantasy League" />
            <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, margin: "0 0 12px" }}>
              Join the F1 Naija<br />
              <span style={{ color: "#f5a724" }}>Fantasy League.</span>
            </h2>
            <p style={{ fontSize: 13, color: "var(--f1-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
              200+ players and counting. Pick your drivers, manage your strategy, and climb the
              standings every race weekend — free to play.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CTAButton href="/fantasy" label="View Fantasy Page →" variant="primary" />
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
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
              color: "var(--f1-muted)", letterSpacing: ".04em",
            }}>
              Coming Soon
            </span>
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
            <CTAButton href="https://x.com/f1_naija" label="𝕏 Follow on X" variant="ghost" />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── NEW TO F1 — link card to /start-here ───────────────── */}
      <section aria-label="New to F1 starter guide" style={{ padding: "40px 0" }}>
        <Link href="/start-here" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
            flexWrap: "wrap",
            background: "var(--f1-card)",
            border: "1px solid rgba(0,212,132,.2)",
            borderLeft: "3px solid #00d484",
            borderRadius: 14, padding: "24px 26px",
            transition: "border-color .18s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,212,132,.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,212,132,.2)"; }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#00d484", marginBottom: 8 }}>New to F1?</div>
              <div style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 900, color: "var(--f1-text)", lineHeight: 1.15, marginBottom: 8 }}>
                Your F1 Starter Pack 🇳🇬
              </div>
              <p style={{ fontSize: 12, color: "var(--f1-muted)", lineHeight: 1.65, margin: 0, maxWidth: 480 }}>
                F1 basics, the Naija fan guide, watch times, and a full F1 jargon decoder — written by Naija fans, for Naija fans.
              </p>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00d484", whiteSpace: "nowrap", flexShrink: 0 }}>
              Start Here →
            </div>
          </div>
        </Link>
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
