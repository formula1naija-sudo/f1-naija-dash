"use client";

import { useDataStore } from "@/stores/useDataStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";

const statusIcon: Record<number, string> = {
	1: "✓",
	2: "⚑",
	3: "⚑",
	4: "SC",
	5: "🔴",
	6: "VSC",
	7: "VSC",
};

export default function TrackInfo() {
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const track = useDataStore((state) => state.state?.TrackStatus);

	const statusCode = track?.Status ? parseInt(track.Status) : undefined;
	const currentTrackStatus = getTrackStatusMessage(statusCode);
	const icon = statusCode ? (statusIcon[statusCode] ?? "") : "";

	const colorMap: Record<number, { color: string; border: string; bg: string }> = {
		1: { color: "#00d484", border: "rgba(0,212,132,0.4)", bg: "rgba(0,212,132,0.1)" },
		2: { color: "#fbbf24", border: "rgba(251,191,36,0.4)", bg: "rgba(251,191,36,0.1)" },
		3: { color: "#fbbf24", border: "rgba(251,191,36,0.4)", bg: "rgba(251,191,36,0.1)" },
		4: { color: "#fbbf24", border: "rgba(251,191,36,0.4)", bg: "rgba(251,191,36,0.1)" },
		5: { color: "#ef4444", border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.1)" },
		6: { color: "#fbbf24", border: "rgba(251,191,36,0.4)", bg: "rgba(251,191,36,0.1)" },
		7: { color: "#fbbf24", border: "rgba(251,191,36,0.4)", bg: "rgba(251,191,36,0.1)" },
	};

	const palette = statusCode ? (colorMap[statusCode] ?? colorMap[1]) : colorMap[1];

	return (
		<div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
			{/* Lap counter */}
			{!!lapCount && (
				<p
					style={{
						fontSize: 22,
						fontWeight: 900,
						lineHeight: 1,
						fontVariantNumeric: "tabular-nums",
						color: "var(--f1-text)",
						whiteSpace: "nowrap",
						letterSpacing: "-.02em",
					}}
				>
					{lapCount.CurrentLap} <span style={{ color: "var(--f1-sub)", fontWeight: 500, fontSize: 16 }}>/ {lapCount.TotalLaps}</span>
				</p>
			)}

			{/* Track status badge */}
			{currentTrackStatus ? (
				<div
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 5,
						height: 28,
						padding: "0 10px",
						borderRadius: 6,
						border: `1px solid ${palette.border}`,
						background: palette.bg,
					}}
				>
					<span style={{ fontSize: 11, fontWeight: 800, color: palette.color }}>{icon}</span>
					<span
						style={{
							fontSize: 11,
							fontWeight: 700,
							color: palette.color,
							letterSpacing: ".04em",
							textTransform: "uppercase",
							whiteSpace: "nowrap",
						}}
					>
						{currentTrackStatus.message}
					</span>
				</div>
			) : (
				<div
					style={{
						height: 28, width: 110, borderRadius: 6,
						background: "rgba(255,255,255,0.04)",
						animation: "pulse 1.5s infinite",
					}}
				/>
			)}
		</div>
	);
}
