import Image from "next/image";
import DriverDRS from "@/components/driver/DriverDRS";
import DriverTire from "@/components/driver/DriverTire";
import DriverPedals from "@/components/driver/DriverPedals";
import TemperatureComplication from "@/components/complications/Temperature";
import HumidityComplication from "@/components/complications/Humidity";
import WindSpeedComplication from "@/components/complications/WindSpeed";
import RainComplication from "@/components/complications/Rain";

import unknownTireIcon from "public/tires/unknown.svg";
import mediumTireIcon from "public/tires/medium.svg";
import interTireIcon from "public/tires/intermediate.svg";
import hardTireIcon from "public/tires/hard.svg";
import softTireIcon from "public/tires/soft.svg";
import wetTireIcon from "public/tires/wet.svg";

const SECTIONS = [
  { id: "colors",    label: "Colours" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "drs",       label: "DRS & PIT" },
  { id: "tires",     label: "Tyres" },
  { id: "delay",     label: "Delay Control" },
  { id: "pedals",    label: "Pedals" },
  { id: "weather",   label: "Weather" },
];

export default function HelpPage() {
  return (
    <div style={{ background: "#04060e", color: "#edf2ff", minHeight: "100vh" }}>
      <style>{`
        @keyframes helpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .help-fade { animation: helpFadeUp .5s ease both; }
        .help-fade-1 { animation-delay: .05s; }
        .help-fade-2 { animation-delay: .15s; }
        .help-fade-3 { animation-delay: .25s; }
        .help-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          transition: border-color .2s;
        }
        .help-card:hover { border-color: rgba(0,212,132,.18); }
        .help-section-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #00d484;
          margin-bottom: 12px;
        }
        .help-section-tag::before {
          content: '';
          display: block;
          width: 14px;
          height: 1px;
          background: #00d484;
        }
        .help-h2 {
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 900;
          letter-spacing: -.03em;
          color: #edf2ff;
          margin-bottom: 10px;
          line-height: 1;
        }
        .help-p {
          font-size: 13px;
          line-height: 1.75;
          color: #5a6888;
          max-width: 600px;
        }
        .help-note {
          background: rgba(245,167,36,.06);
          border: 1px solid rgba(245,167,36,.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 12px;
          color: #b38a40;
          line-height: 1.6;
        }
        .help-note::before {
          content: '⚠ ';
          color: #f5a724;
          font-weight: 700;
        }
        .color-chip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,.02);
          border: 1px solid rgba(255,255,255,.06);
        }
        .color-dot {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .toc-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #3a4560;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: all .18s;
          -webkit-tap-highlight-color: transparent;
        }
        .toc-link:hover {
          color: #00d484;
          border-color: rgba(0,212,132,.2);
          background: rgba(0,212,132,.04);
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(48px,8vw,80px) 0 clamp(36px,6vw,56px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 20% 40%,rgba(0,212,132,.04) 0%,transparent 60%)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, right: -10,
          fontSize: "clamp(90px,14vw,200px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.012)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none",
        }}>HELP</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="help-fade help-fade-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#00d484", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              F1 Naija · Dashboard Guide
            </span>
          </div>
          <div className="help-fade help-fade-2" style={{ lineHeight: .88, marginBottom: 18 }}>
            <div style={{ fontSize: "clamp(42px,7vw,88px)", fontWeight: 900, letterSpacing: "-.04em", color: "#edf2ff", lineHeight: .92 }}>
              How it
            </div>
            <div style={{
              fontSize: "clamp(42px,7vw,88px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#00d484 0%,#00f0a0 40%,#f5a724 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Works.</div>
          </div>
          <p className="help-fade help-fade-3 help-p">
            Everything you need to know about reading the live F1 Naija dashboard —
            colours, indicators, tyre compounds, delay control, and more.
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "40px 0 80px" }}>

        {/* Quick-nav */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 48,
          padding: "16px", borderRadius: 14,
          background: "rgba(255,255,255,.02)",
          border: "1px solid rgba(255,255,255,.06)",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#3a4560", alignSelf: "center", paddingRight: 8 }}>Jump to</span>
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="toc-link">{s.label}</a>
          ))}
        </div>

        {/* ── COLOURS ── */}
        <section id="colors" style={{ marginBottom: 56 }}>
          <div className="help-section-tag">Colours</div>
          <h2 className="help-h2">Colour Coding</h2>
          <p className="help-p" style={{ marginBottom: 24 }}>
            Colour is the core language of the dashboard — every lap time, sector, and mini-sector
            is coloured to tell you instantly how a driver is performing relative to their own best
            and the overall best.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 8 }}>
            {[
              { color: "#ffffff",  label: "White",  desc: "Last lap time — no special status" },
              { color: "#f5a724",  label: "Gold",   desc: "Slower than personal best (mini-sectors only)" },
              { color: "#00d484",  label: "Green",  desc: "New personal best lap or sector" },
              { color: "#9c50f5",  label: "Purple", desc: "Fastest overall in the session" },
              { color: "#3b82f6",  label: "Blue",   desc: "Driver is in or exiting the pit lane" },
            ].map(({ color, label, desc }) => (
              <div key={label} className="color-chip">
                <div className="color-dot" style={{ background: color, boxShadow: `0 0 12px ${color}44` }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#edf2ff", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#5a6888", lineHeight: 1.4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="help-note" style={{ marginTop: 16 }}>
            Yellow (gold) only appears on mini-sectors — using it on full lap times would make
            the UI look cluttered, as many drivers would be yellow simultaneously.
          </div>
        </section>

        {/* ── LEADERBOARD ── */}
        <section id="leaderboard" style={{ marginBottom: 56 }}>
          <div className="help-section-tag">Leaderboard</div>
          <h2 className="help-h2">Driver Row Backgrounds</h2>
          <p className="help-p" style={{ marginBottom: 24 }}>
            Depending on a driver&apos;s status and where the session stands, their row on the leaderboard
            may be highlighted with a coloured background.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 8 }}>
            {[
              { bg: "rgba(156,80,245,.10)", border: "rgba(156,80,245,.25)", label: "Purple tint", desc: "Driver has the fastest overall lap time in this session" },
              { bg: "rgba(0,212,132,.06)",  border: "rgba(0,212,132,.2)",   label: "Green tint",  desc: "This is your selected favourite driver" },
              { bg: "rgba(232,0,31,.10)",   border: "rgba(232,0,31,.25)",   label: "Red tint",    desc: "Driver is in the danger zone during qualifying" },
              { bg: "rgba(255,255,255,.04)", border: "rgba(255,255,255,.12)", label: "Dimmed / transparent", desc: "Driver has crashed out or retired from the session" },
            ].map(({ bg, border, label, desc }) => (
              <div key={label} style={{
                padding: "14px 16px", borderRadius: 10,
                background: bg, border: `1px solid ${border}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#edf2ff", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#5a6888", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DRS & PIT ── */}
        <section id="drs" style={{ marginBottom: 56 }}>
          <div className="help-section-tag">DRS & PIT</div>
          <h2 className="help-h2">DRS & Pit Indicator</h2>
          <p className="help-p" style={{ marginBottom: 8 }}>
            Every driver row shows a small DRS / PIT pill. It tells you at a glance whether a driver
            has no DRS, is eligible, has it active, or is in the pit lane.
          </p>
          <p className="help-p" style={{ marginBottom: 24 }}>
            Use it to quickly spot overtake attempts or pit-stop strategies unfolding in real time.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { props: { on: false, possible: false, inPit: false, pitOut: false }, label: "Off", desc: "No DRS — default state" },
              { props: { on: false, possible: true,  inPit: false, pitOut: false }, label: "Possible", desc: "Within 1 second of the car ahead; eligible for DRS in the next zone" },
              { props: { on: true,  possible: false, inPit: false, pitOut: false }, label: "Active", desc: "DRS is open and the driver is getting the straight-line speed boost" },
              { props: { on: false, possible: false, inPit: true,  pitOut: false }, label: "PIT", desc: "In the pit lane or leaving — may drop positions" },
            ].map(({ props, label, desc }) => (
              <div key={label} className="help-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, flexShrink: 0 }}>
                  <DriverDRS on={props.on} possible={props.possible} inPit={props.inPit} pitOut={props.pitOut} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#edf2ff", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#5a6888", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TYRES ── */}
        <section id="tires" style={{ marginBottom: 56 }}>
          <div className="help-section-tag">Tyres</div>
          <h2 className="help-h2">Tyre Compounds</h2>
          <p className="help-p" style={{ marginBottom: 16 }}>
            Each driver&apos;s current tyre compound and age (in laps) is shown on their row.
            In the example below the driver is on a 12-lap-old Soft set and has pitted once.
          </p>

          <div className="help-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
            <DriverTire
              stints={[
                { TotalLaps: 12, Compound: "SOFT" },
                { TotalLaps: 12, Compound: "SOFT", New: "TRUE" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8 }}>
            {[
              { icon: softTireIcon,   label: "Soft" },
              { icon: mediumTireIcon, label: "Medium" },
              { icon: hardTireIcon,   label: "Hard" },
              { icon: interTireIcon,  label: "Intermediate" },
              { icon: wetTireIcon,    label: "Wet" },
              { icon: unknownTireIcon,label: "Unknown" },
            ].map(({ icon, label }) => (
              <div key={label} className="help-card" style={{ padding: "14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Image src={icon} alt={label} style={{ width: 36, height: 36 }} />
                <span style={{ fontSize: 11, color: "#5a6888", fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="help-note" style={{ marginTop: 16 }}>
            The tyre type may show as &quot;Unknown&quot; at the very start of a session or when
            the data feed hasn&apos;t been updated yet.
          </div>
        </section>

        {/* ── DELAY ── */}
        <section id="delay" style={{ marginBottom: 56 }}>
          <div className="help-section-tag">Delay Control</div>
          <h2 className="help-h2">Sync With Your Stream</h2>
          <p className="help-p" style={{ marginBottom: 12 }}>
            The dashboard updates several seconds ahead of most TV or streaming broadcasts.
            Delay Control lets you add an artificial delay so the dashboard stays in sync
            with what you&apos;re watching.
          </p>
          <p className="help-p" style={{ marginBottom: 20 }}>
            Setting a 30-second delay means the dashboard holds all updates for 30 seconds
            before showing them — keeping spoilers away until you see them on screen.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8, marginBottom: 16 }}>
            {[
              { icon: "🏁", label: "Start of a new lap", sub: "Race" },
              { icon: "⏱", label: "Session clock",       sub: "Practice & Qualifying" },
              { icon: "⚡", label: "Mini-sector flashes", sub: "When available" },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="help-card" style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#edf2ff", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#5a6888" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="help-note">
            The maximum delay you can set equals the time you&apos;ve already spent on the
            dashboard page. A 30-second delay on a 20-second visit means you wait 10 more
            seconds before updates resume. This will improve in a future update.
          </div>
        </section>

        {/* ── PEDALS ── */}
        <section id="pedals" style={{ marginBottom: 56 }}>
          <div className="help-section-tag">Driver Telemetry</div>
          <h2 className="help-h2">Pedal & RPM Bars</h2>
          <p className="help-p" style={{ marginBottom: 24 }}>
            Three compact bars show each driver&apos;s throttle input, braking, and engine RPM in real time.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { cls: "bg-red-500",     val: 1, max: 3, label: "Brake",    desc: "On / off — whether the driver is braking" },
              { cls: "bg-emerald-500", val: 3, max: 4, label: "Throttle", desc: "0–100% — how hard the driver is pressing the accelerator" },
              { cls: "bg-blue-500",    val: 2, max: 3, label: "RPM",      desc: "0–15,000 — engine revs per minute" },
            ].map(({ cls, val, max, label, desc }) => (
              <div key={label} className="help-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, flexShrink: 0 }}>
                  <DriverPedals className={cls} value={val} maxValue={max} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#edf2ff", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#5a6888", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WEATHER ── */}
        <section id="weather" style={{ marginBottom: 40 }}>
          <div className="help-section-tag">Weather</div>
          <h2 className="help-h2">Track Conditions</h2>
          <p className="help-p" style={{ marginBottom: 24 }}>
            The weather panel shows live conditions at the circuit. Use it to predict
            strategy calls like tyre switches or safety car periods in wet weather.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { component: <TemperatureComplication value={39} label="TRC" />, desc: "Track surface temperature in °C" },
              { component: <TemperatureComplication value={26} label="AIR" />, desc: "Ambient air temperature in °C" },
              { component: <HumidityComplication value={36} />,                desc: "Relative humidity percentage" },
              { component: <RainComplication rain={true} />,                   desc: "Raining now — wet conditions active" },
              { component: <WindSpeedComplication speed={2.9} directionDeg={250} />, desc: "Wind speed in m/s and compass direction" },
            ].map(({ component, desc }, i) => (
              <div key={i} className="help-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flexShrink: 0 }}>{component}</div>
                <div style={{ fontSize: 12, color: "#5a6888" }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.06)",
          paddingTop: 28,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 16, height: 1, background: "#f5a724", flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: "#3a4560" }}>
            Still confused? Reach out to us at{" "}
            <a href="mailto:hello@f1naija.com" style={{ color: "#f5a724", textDecoration: "none" }}>hello@f1naija.com</a>
            {" "}or DM{" "}
            <a href="https://x.com/f1_naija" target="_blank" rel="noopener noreferrer" style={{ color: "#f5a724", textDecoration: "none" }}>@f1_naija</a>
            {" "}on X.
          </p>
        </div>
      </div>
    </div>
  );
}
