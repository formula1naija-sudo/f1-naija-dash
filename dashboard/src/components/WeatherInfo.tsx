"use client";

import { useDataStore } from "@/stores/useDataStore";
import { getWindDirection } from "@/lib/getWindDirection";

/* ── Pill — matches mockup .wpill style ── */
function WPill({
	value,
	label,
	color,
	children,
}: {
	value?: string | number;
	label?: string;
	color?: string;
	children?: React.ReactNode;
}) {
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			padding: "3px 9px",
			borderRadius: 7,
			border: "1px solid var(--f1-border)",
			gap: 1,
			flexShrink: 0,
		}}>
			{children ?? (
				<>
					<span style={{
						fontSize: 13,
						fontWeight: 700,
						lineHeight: 1.2,
						color: color ?? "var(--f1-text)",
					}}>
						{value}
					</span>
					{label && (
						<span style={{
							fontSize: 8,
							color: "var(--f1-muted)",
							fontWeight: 500,
							letterSpacing: ".08em",
							lineHeight: 1,
						}}>
							{label}
						</span>
					)}
				</>
			)}
		</div>
	);
}

function Loading() {
	return (
		<div style={{
			width: 42,
			height: 34,
			borderRadius: 7,
			background: "rgba(255,255,255,0.04)",
			border: "1px solid var(--f1-border)",
		}} />
	);
}

export default function WeatherInfo() {
	const weather = useDataStore((state) => state.state?.WeatherData);

	if (!weather) {
		return (
			<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
				<Loading /><Loading /><Loading /><Loading /><Loading />
			</div>
		);
	}

	const trackTemp = Math.round(parseFloat(weather.TrackTemp));
	const airTemp   = Math.round(parseFloat(weather.AirTemp));
	const humidity  = parseFloat(weather.Humidity).toFixed(1);
	const windSpeed = parseFloat(weather.WindSpeed).toFixed(1);
	const windDir   = getWindDirection(parseInt(weather.WindDirection));
	const isRaining = weather.Rainfall === "1";

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
			{/* Track temp — gold */}
			<WPill value={trackTemp} label="TRC °C" color="#f5a724" />

			{/* Air temp — blue */}
			<WPill value={airTemp} label="AIR °C" color="#60a5fa" />

			{/* Humidity — purple */}
			<WPill value={humidity} label="HUM %" color="#818cf8" />

			{/* Rain status */}
			<WPill>
				<span style={{ fontSize: 14, lineHeight: 1 }}>
					{isRaining ? "🌧" : "☁️"}
				</span>
			</WPill>

			{/* Wind */}
			<WPill>
				<span style={{ fontSize: 11, fontWeight: 700, color: "var(--f1-text)", lineHeight: 1.2 }}>
					{windSpeed}
				</span>
				<span style={{ fontSize: 8, color: "var(--f1-muted)", fontWeight: 500, letterSpacing: ".08em", lineHeight: 1 }}>
					{windDir} m/s
				</span>
			</WPill>
		</div>
	);
}
