import type { Driver, TimingData } from "@/types/state.type";

type Props = {
	driver: Driver;
	driverViolations: number;
	maxViolations: number;
	driversTiming: TimingData | undefined;
};

export default function DriverViolations({ driver, driverViolations, maxViolations }: Props) {
	const pct = maxViolations > 0 ? (driverViolations / maxViolations) * 100 : 0;
	const teamColor = driver.TeamColour ? `#${driver.TeamColour}` : "#52525b";

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "7px 10px",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}
		>
			{/* TLA badge */}
			<div
				style={{
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "3px 7px",
					borderRadius: 5,
					background: teamColor,
					flexShrink: 0,
					minWidth: 38,
				}}
			>
				<span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: ".04em" }}>
					{driver.Tla}
				</span>
			</div>

			{/* Bar */}
			<div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
				<div
					style={{
						height: "100%", borderRadius: 3, width: `${pct}%`,
						background: "linear-gradient(90deg,#e8001f,rgba(232,0,31,0.5))",
						transition: "width 0.5s ease",
					}}
				/>
			</div>

			{/* Count */}
			<span style={{ fontSize: 12, fontWeight: 800, color: "#e8001f", minWidth: 14, textAlign: "right", flexShrink: 0 }}>
				{driverViolations}
			</span>
		</div>
	);
}
