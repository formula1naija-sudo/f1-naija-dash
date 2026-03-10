"use client";

import { useDataStore } from "@/stores/useDataStore";
import { getWindDirection } from "@/lib/getWindDirection";

/* ── helpers ── */
const fmt = (v: string | undefined, decimals = 0) =>
	v != null ? parseFloat(v).toFixed(decimals) : "--";

/* ── Wind arrow SVG (points in wind direction) ── */
function WindArrow({ deg }: { deg: number }) {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			style={{ transform: `rotate(${deg}deg)`, display: "block", flexShrink: 0 }}
		>
			<path d="M12 3 L15.5 18 L12 15.5 L8.5 18 Z" fill="#00d484" />
		</svg>
	);
}

/* ── Single stat row ── */
function StatRow({
	label,
	value,
	accent,
}: {
	label: string;
	value: string | number;
	accent?: string;
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "7px 0",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}
		>
			<span
				style={{
					fontSize: 12,
					fontWeight: 600,
					color: "var(--f1-muted)",
				}}
			>
				{label}
			</span>
			<span
				style={{
					fontSize: 14,
					fontWeight: 800,
					color: accent ?? "var(--f1-text)",
				}}
			>
				{value}
			</span>
		</div>
	);
}

/* ── Mini stat card ── */
function StatCard({
	label,
	value,
	unit,
}: {
	label: string;
	value: string | number;
	unit?: string;
}) {
	return (
		<div
			style={{
				padding: "10px 12px",
				borderRadius: 8,
				border: "1px solid var(--f1-border)",
				background: "var(--f1-card)",
			}}
		>
			<p
				style={{
					fontSize: 9,
					fontWeight: 700,
					letterSpacing: ".12em",
					textTransform: "uppercase",
					color: "var(--f1-muted)",
					marginBottom: 6,
					margin: "0 0 6px",
				}}
			>
				{label}
			</p>
			<div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
				<span
					style={{
						fontSize: 20,
						fontWeight: 900,
						lineHeight: 1,
						letterSpacing: "-.02em",
						color: "var(--f1-text)",
					}}
				>
					{value}
				</span>
				{unit && (
					<span
						style={{
							fontSize: 11,
							fontWeight: 600,
							color: "var(--f1-muted)",
						}}
					>
						{unit}
					</span>
				)}
			</div>
		</div>
	);
}

export default function WeatherConditions() {
	const weather = useDataStore((state) => state.state?.WeatherData);

	if (!weather) {
		return (
			<div
				style={{
					padding: "16px",
					display: "flex",
					flexDirection: "column",
					gap: 10,
				}}
			>
				{Array.from({ length: 9 }).map((_, i) => (
					<div
						key={i}
						style={{
							height: i === 0 ? 80 : 32,
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
	const pressure = fmt(weather.Pressure, 0);

	return (
		<div style={{ padding: "16px" }}>
			{/* ── Section header ── */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginBottom: 16,
				}}
			>
				<span style={{ fontSize: 14 }}>🌡</span>
				<span
					style={{
						fontSize: 10,
						fontWeight: 700,
						letterSpacing: ".14em",
						textTransform: "uppercase",
						color: "var(--f1-muted)",
					}}
				>
					Current Conditions
				</span>
			</div>

			{/* ── Big temperature display ── */}
			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					gap: 14,
					paddingBottom: 16,
					marginBottom: 4,
					borderBottom: "1px solid var(--f1-border-soft)",
				}}
			>
				{/* Track surface temp */}
				<div style={{ flexShrink: 0 }}>
					<div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
						<span
							style={{
								fontSize: 52,
								fontWeight: 900,
								lineHeight: 1,
								letterSpacing: "-.04em",
								color:
									trackTemp > 50
										? "#e8001f"
										: trackTemp > 35
											? "#f5a724"
											: "var(--f1-text)",
							}}
						>
							{trackTemp}
						</span>
						<span
							style={{
								fontSize: 18,
								fontWeight: 700,
								color: "var(--f1-muted)",
								marginBottom: 4,
							}}
						>
							°C
						</span>
					</div>
					<p
						style={{
							fontSize: 10,
							fontWeight: 500,
							color: "var(--f1-muted)",
							margin: "3px 0 0",
						}}
					>
						Track Surface
					</p>
				</div>

				{/* Divider */}
				<div
					style={{
						width: 1,
						height: 44,
						background: "var(--f1-border)",
						flexShrink: 0,
						marginBottom: 10,
					}}
				/>

				{/* Air temp */}
				<div style={{ flexShrink: 0 }}>
					<div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
						<span
							style={{
								fontSize: 36,
								fontWeight: 900,
								lineHeight: 1,
								letterSpacing: "-.04em",
								color: airTemp > 35 ? "#f5a724" : "var(--f1-text)",
							}}
						>
							{airTemp}
						</span>
						<span
							style={{
								fontSize: 14,
								fontWeight: 700,
								color: "var(--f1-muted)",
								marginBottom: 3,
							}}
						>
							°C
						</span>
					</div>
					<p
						style={{
							fontSize: 10,
							fontWeight: 500,
							color: "var(--f1-muted)",
							margin: "3px 0 0",
						}}
					>
						Air Temperature
					</p>
				</div>

				{/* Weather icon */}
				<span
					style={{
						fontSize: 28,
						marginLeft: "auto",
						marginBottom: 10,
						flexShrink: 0,
					}}
				>
					{isRaining ? "🌧" : "⛅"}
				</span>
			</div>

			{/* ── Stat rows ── */}
			<div style={{ marginBottom: 16 }}>
				<StatRow
					label="Humidity"
					value={`${humidity}%`}
					accent={parseFloat(humidity) > 80 ? "#5aadff" : "#818cf8"}
				/>
				<StatRow label="Pressure" value={`${pressure} hPa`} />
				<StatRow
					label="Rainfall"
					value={isRaining ? "Raining" : "None"}
					accent={isRaining ? "#5aadff" : "#00d484"}
				/>
			</div>

			{/* ── Wind section ── */}
			<div
				style={{
					paddingTop: 14,
					borderTop: "1px solid var(--f1-border-soft)",
					marginBottom: 16,
				}}
			>
				{/* Wind header */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 12,
					}}
				>
					<span style={{ fontSize: 13 }}>💨</span>
					<span
						style={{
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: ".14em",
							textTransform: "uppercase",
							color: "var(--f1-muted)",
						}}
					>
						Wind
					</span>
				</div>

				{/* Speed + direction */}
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						justifyContent: "space-between",
					}}
				>
					<div>
						<div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
							<span
								style={{
									fontSize: 40,
									fontWeight: 900,
									lineHeight: 1,
									letterSpacing: "-.04em",
									color: "var(--f1-text)",
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{windSpeed}
							</span>
							<span
								style={{
									fontSize: 13,
									fontWeight: 600,
									color: "var(--f1-muted)",
									marginBottom: 2,
								}}
							>
								m/s
							</span>
						</div>
						<p
							style={{
								fontSize: 10,
								fontWeight: 500,
								color: "var(--f1-muted)",
								margin: "3px 0 0",
							}}
						>
							Wind Speed
						</p>
					</div>

					{/* Arrow + direction label */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
						}}
					>
						<WindArrow deg={windDeg} />
						<span
							style={{
								fontSize: 13,
								fontWeight: 800,
								color: "var(--f1-text)",
								letterSpacing: ".04em",
							}}
						>
							{windDir}
						</span>
					</div>
				</div>
			</div>

			{/* ── Mini stat cards (2×2 grid) ── */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 8,
				}}
			>
				<StatCard label="Visibility" value="--" unit="km" />
				<StatCard label="UV Index" value="--" />
				<StatCard label="Dew Point" value="--" unit="°C" />
				<StatCard label="Gust" value="--" unit="m/s" />
			</div>
		</div>
	);
}
