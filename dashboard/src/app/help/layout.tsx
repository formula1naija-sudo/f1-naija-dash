import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = { title: "Help · F1 Naija", description: "Dashboard guide — how to read colours, tyres, DRS, delay and more." };

export default function HelpLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "var(--f1-bg-page)", minHeight: "100vh" }}>
      {/* Slim top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(16px,4vw,48px)",
        height: 48,
        background: "rgba(9,9,11,.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, color: "#00d484",
          textDecoration: "none", letterSpacing: ".02em",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="#00d484" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          F1 Naija
        </Link>
        <Link href="/dashboard" style={{
          fontSize: 11, fontWeight: 700, color: "var(--f1-muted)",
          textDecoration: "none", letterSpacing: ".04em",
          padding: "6px 12px", borderRadius: 6,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
        }}>
          Open Dashboard ↗
        </Link>
      </div>

      {/* Page content with horizontal padding */}
      <div style={{ padding: "0 clamp(16px,4vw,48px)" }}>
        {children}
      </div>
    </div>
  );
}
