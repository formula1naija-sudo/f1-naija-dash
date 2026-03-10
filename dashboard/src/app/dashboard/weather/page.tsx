import { WeatherMap } from "@/app/dashboard/weather/map";
import WeatherConditions from "@/app/dashboard/weather/WeatherConditions";

export default function WeatherPage() {
	return (
		<div className="flex h-full flex-col">
			{/* ── PAGE HERO ── */}
			<div style={{
				position: "relative", overflow: "hidden", flexShrink: 0,
				padding: "clamp(24px,4vw,40px) 16px clamp(20px,3vw,32px)",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}>
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(var(--f1-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--f1-grid-line) 1px,transparent 1px)",
					backgroundSize: "64px 64px",
					WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
					maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
				}} />
				<div style={{ position: "relative", zIndex: 1 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
						<div style={{ width: 16, height: 1, background: "#00d484", flexShrink: 0 }} />
						<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
							Circuit Conditions
						</span>
					</div>
					<div style={{ lineHeight: 0.92 }}>
						<span style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)" }}>Circuit </span>
						<span style={{
							fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em",
							background: "linear-gradient(120deg,#00d484 0%,#7affd4 50%,#00d484 100%)",
							WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
						}}>Weather.</span>
					</div>
				</div>
			</div>

			{/* ── MAP + CONDITIONS PANEL ── */}
			<div className="flex min-h-0 flex-1 flex-col md:flex-row">

				{/* Conditions sidebar */}
				<div style={{
					flexShrink: 0,
					width: "100%",
					borderBottom: "1px solid var(--f1-border-soft)",
				}} className="md:border-b-0 md:border-r md:w-56 md:overflow-y-auto">
					<div style={{ padding: "14px 14px 0" }}>
						<WeatherConditions />
					</div>
				</div>

				{/* Map */}
				<div className="relative min-h-0 flex-1" style={{ minHeight: 280 }}>
					<WeatherMap />
				</div>
			</div>
		</div>
	);
}
