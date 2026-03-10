"use client";

import { useDataStore } from "@/stores/useDataStore";
import { getWindDirection } from "@/lib/getWindDirection";

/* ── tiny helpers ── */
const fmt = (v: string | undefined, decimals = 0) =>
	v != null ? parseFloat(v).toFixed(decimals) : "--";

function StatRow({
	label,
	value,
	unit,
	accent,
}: {
	label: string;
	value: string | number;
	unit?: string;
	accent?: string;
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "8px 0",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}
		>
			<span
				style={{
					fontSize: 10,
					fontWeight: 700,
					letterSpacing: ".12em",
					textTransform: "uppercase",
					color: "var(--f1-muted)",
				}}
			>
				{label}
			</span>
			<span
				style={{
					display: "flex",
					alignItems: "baseline",
					gap: 3,
				}}
			>
				<span
					style={{
						fontSize: 15,
						fontWeight: 800,
						letterSpacing: "-.02em",
						color: accent ?? "var(--f1-text)",
					}}
				>
					{value}
				</span>
				{unit && (
					<span
						style={{
							fontSize: 10,
							fontWeight: 600,
							color: "var(--f1-muted)",
						}}
					>
						{unit}
					</span>
				)}
			</span>
		</div>
	);
}

/* Wind direction arrow SVG */
function WindArrow({ deg }: { deg: number }) {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			style={{
				transform: `rotate(${deg}deg)`,
				display: "inline-block",
				marginLeft: 4,
				verticalAlign: "middle",
			}}
		>
			<path
				d="M7 1 L10 10 L7 8.5 L4 10 Z"
				fill="#00d484"
			/>
		</svg>
	);
}

export default function WeatherConditions() {
	const weather = useDataStore((state) => state.state?.WeatherData);

	if (!weather) {
		return (
			<div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						style={{
							height: 36,
							borderRadius: 6,
							background: "var(--f1-card)",
							animation: "pulse 1.5s ease-in-out infinite",
						}}
					/>
				))}
			</div>
		);
	}

	const trackTemp = Math.round(parseFloat(weather.TrackTemp));
	const airTemp = Math.round(parseFloat(weather.AirTemp));
	const humidity = parseFloat(weather.Humidity).toFixed(1);
	const windSpeed = parseFloat(weather.WindSpeed).toFixed(1);
	const windDeg = parseInt(weather.WindDirection);
	const windDir = getWindDirection(windDeg);
	const isRaining = weather.Rainfall === "1";
	const pressure = fmt(weather.Pressure, 1);

	return (
		<div style={{ padding: "0 0 8px" }}>
			{/* Section label */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginBottom: 12,
				}}
			>
				<div
					style={{
						width: 16,
						height: 1,
						background: "#00d484",
						flexShrink: 0,
					}}
				/>
				<span
					style={{
						fontSize: 10,
						fontWeight: 700,
						letterSpacing: ".16em",
						textTransform: "uppercase",
						color: "#00d484",
					}}
				>
					Current Conditions
				</span>
			</div>

			{/* Rain status badge */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 10px",
					borderRadius: 8,
					marginBottom: 8,
					background: isRaining
						? "rgba(0,120,255,0.08)"
						: "rgba(0,212,132,0.07)",
					border: `1px solid ${isRaining ? "rgba(0,120,255,0.2)" : "rgba(0,212,132,0.2)"}`,
				}}
			>
				<span
					style={{
						fontSize: 10,
						fontWeight: 700,
						letterSpacing: ".12em",
						textTransform: "uppercase",
						color: "var(--f1-muted)",
					}}
				>
					Conditions
				</span>
				<span
					style={{
						fontSize: 12,
						fontWeight: 800,
						color: isRaining ? "#5aadff" : "#00d484",
					}}
				>
					{isRaining ? "🌧 Raining" : "☀️ Dry"}
				</span>
			</div>

			{/* Stat rows */}
			<div>
				<StatRow
					label="Track Temp"
					value={trackTemp}
					unit="°C"
					accent={trackTemp > 50 ? "#f5a724" : trackTemp > 35 ? "#e8001f" : "var(--f1-text)"}
				/>
				<StatRow
					label="Air Temp"
					value={airTemp}
					unit="°C"
					accent={airTemp > 35 ? "#f5a724" : "var(--f1-text)"}
				/>
				<StatRow
					label="Humidity"
					value={humidity}
					unit="%"
					accent={parseFloat(humidity) > 80 ? "#5aadff" : "var(--f1-text)"}
				/>
				<StatRow
					label="Pressure"
					value={pressure}
					unit="mbar"
				/>

				{/* Wind row — custom layout */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "8px 0",
					}}
				>
					<span
						style={{
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: ".12em",
							textTransform: "uppercase",
							color: "var(--f1-muted)",
						}}
					>
						Wind
					</span>
					<span
						style={{
							display: "flex",
							alignItems: "center",
							gap: 2,
						}}
					>
						<span
							style={{
								fontSize: 15,
								fontWeight: 800,
								letterSpacing: "-.02em",
								color: "var(--f1-text)",
							}}
						>
							{windSpeed}
						</span>
						<span
							style={{
								fontSize: 10,
								fontWeight: 600,
								color: "var(--f1-muted)",
								marginRight: 4,
							}}
						>
							m/s
						</span>
						<span
							style={{
								fontSize: 11,
								fontWeight: 700,
								color: "#00d484",
								background: "rgba(0,212,132,0.12)",
								padding: "2px 6px",
								borderRadius: 4,
								letterSpacing: ".04em",
							}}
						>
							{windDir}
						</span>
						<WindArrow deg={windDeg} />
					</span>
				</div>
			</div>

			{/* Footer note */}
			<div
				style={{
					marginTop: 12,
					paddingTop: 10,
					borderTop: "1px solid var(--f1-border-soft)",
					fontSize: 9,
					fontWeight: 600,
					letterSpacing: ".08em",
					textTransform: "uppercase",
					color: "var(--f1-muted)",
					opacity: 0.6,
					textAlign: "center",
				}}
			>
				Live · Updated every lap
			</div>
		</div>
	);
}
