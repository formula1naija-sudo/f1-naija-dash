import { Suspense } from "react";

import NextRound from "@/components/schedule/NextRound";
import Schedule from "@/components/schedule/Schedule";
import ScheduleTZPicker from "@/components/schedule/ScheduleTZPicker";

export default async function SchedulePage() {
  return (
    <div style={{ background: "var(--f1-bg-page)", color: "var(--f1-text)", minHeight: "100vh" }}>
      <style>{`
        @keyframes schFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sch-fade-1 { animation: schFadeUp .5s ease .1s both; }
        .sch-fade-2 { animation: schFadeUp .5s ease .25s both; }
        .sch-fade-3 { animation: schFadeUp .5s ease .4s both; }
      `}</style>

      {/* ── PAGE HERO ─────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,7vw,72px) 0 clamp(32px,5vw,52px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        {/* bg grid */}
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
          background: "radial-gradient(ellipse 60% 50% at 15% 50%,rgba(0,135,81,.045) 0%,transparent 60%)",
        }} />
        {/* watermark */}
        <div style={{
          position: "absolute", bottom: -30, right: -10,
          fontSize: "clamp(80px,13vw,180px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.011)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none",
        }}>RACES</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="sch-fade-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#008751" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              2026 Season · Full Calendar
            </span>
          </div>

          <h1 className="sch-fade-2" style={{ lineHeight: .9, margin: 0, fontWeight: "inherit" }}>
            <span style={{ display: "block", fontSize: "clamp(40px,6vw,84px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: .92 }}>
              Race
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(40px,6vw,84px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#008751 0%,#00d484 50%,#00f0a0 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Schedule.
            </span>
          </h1>

          <p className="sch-fade-3" style={{ fontSize: 12, color: "var(--f1-muted)", margin: "18px 0 0" }}>
            All sessions. All timezones. Straight to the point.
          </p>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div style={{ padding: "32px 0 80px" }}>

        {/* Up Next */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: "#00d484" }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>Up Next</h2>
            <span style={{ fontSize: 11, color: "var(--f1-muted)", marginLeft: 4 }}>· All times are local</span>
          </div>
          <Suspense fallback={<NextRoundLoading />}>
            <NextRound />
          </Suspense>
        </div>

        {/* Full Schedule */}
        <div>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: "#f5a724" }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>Full Schedule</h2>
            </div>
            <ScheduleTZPicker />
          </div>
          <Suspense fallback={<FullScheduleLoading />}>
            <Schedule />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Loading skeletons
const RoundLoading = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ height: 20, width: 120, borderRadius: 6, background: "rgba(255,255,255,.06)" }} />
    <div style={{ height: 200, borderRadius: 12, background: "rgba(255,255,255,.04)" }} />
  </div>
);

const NextRoundLoading = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ height: 20, width: 120, borderRadius: 6, background: "rgba(255,255,255,.06)" }} />
      <div style={{ height: 100, borderRadius: 12, background: "rgba(255,255,255,.04)" }} />
      <div style={{ height: 20, width: 100, borderRadius: 6, background: "rgba(255,255,255,.06)" }} />
      <div style={{ height: 100, borderRadius: 12, background: "rgba(255,255,255,.04)" }} />
    </div>
    <RoundLoading />
  </div>
);

const FullScheduleLoading = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
    {Array.from({ length: 6 }).map((_, i) => <RoundLoading key={i} />)}
  </div>
);
