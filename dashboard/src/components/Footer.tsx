import Link from "next/link";

const NAV_LINKS = [
  { href: "/",            label: "Home" },
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/schedule",    label: "Schedule" },
  { href: "/standings",   label: "Standings" },
  { href: "/community",   label: "Community" },
  { href: "/fantasy",     label: "Fantasy" },
  { href: "/partner",     label: "Partner" },
  { href: "/naija-index", label: "Naija Index" },
  { href: "/start-here",  label: "Start Here" },
  { href: "/about",       label: "About" },
  { href: "/help",        label: "Help" },
];

const TEAM_COLORS = [
  "#FF8000", "#EF1A2D", "#3671C6", "#27F4D2",
  "#00A0DD", "#00594F", "#2173B8", "#B6BABD",
  "#C0002A", "#6692FF", "#C8AA32",
];

export default function Footer() {
  return (
    <footer style={{ marginTop: 40 }}>
      {/* Gradient separator line */}
      <div style={{
        height: 1,
        background: "linear-gradient(90deg,transparent 0%,rgba(0,212,132,.35) 25%,rgba(245,167,36,.2) 75%,transparent 100%)",
        marginBottom: 32,
      }} />

      <div className="flex flex-col items-center gap-5 pb-8 text-center">

        {/* Brand wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-.025em" }}>
            <span style={{ color: "#00d484" }}>F1</span>
            <span style={{ color: "var(--f1-text)" }}> Naija</span>
          </span>
          <span style={{ color: "rgba(255,255,255,.15)" }}>·</span>
          <span style={{ fontSize: 11, color: "var(--f1-muted)", fontWeight: 600 }}>2026 Season</span>
        </div>

        {/* Nav links — wrapping flex with gap */}
        <div style={{
          display: "flex", flexWrap: "wrap",
          justifyContent: "center", gap: "6px 16px",
        }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-white transition-colors"
              style={{ fontSize: 12, color: "var(--f1-muted)", textDecoration: "none", fontWeight: 500 }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Social links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-zinc-500">
          <a href="https://x.com/f1_naija" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X (Twitter)
          </a>
          <span className="text-zinc-800">·</span>
          <a href="https://www.instagram.com/f1_naija/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <span className="text-zinc-800">·</span>
          <a href="https://www.threads.com/@f1_naija"   target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Threads</a>
          <span className="text-zinc-800">·</span>
          <a href="https://www.tiktok.com/@f1.naija"    target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
          <span className="text-zinc-800">·</span>
          <a href="https://www.facebook.com/f1naija/"   target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
        </div>

        {/* All-team color dots — decorative identity strip */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", opacity: .4 }}>
          {TEAM_COLORS.map(c => (
            <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
          ))}
        </div>

        {/* Legal */}
        <p style={{
          maxWidth: 480, fontSize: 11,
          lineHeight: 1.7, color: "#3f3f46",
        }}>
          Unofficial fan project — not affiliated with Formula One Licensing B.V., the FIA, or any F1 team.
          F1, FORMULA ONE and GRAND PRIX are registered trademarks of Formula One Licensing B.V.
        </p>
      </div>
    </footer>
  );
}
