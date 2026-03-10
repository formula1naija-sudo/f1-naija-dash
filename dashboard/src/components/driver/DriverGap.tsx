import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	sessionPart: number | undefined;
};

export default function DriverGap({ timingDriver, sessionPart }: Props) {
	const gapToLeader =
		timingDriver.GapToLeader ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0].TimeDiffToFastest : undefined) ??
		timingDriver.TimeDiffToFastest ??
		"";

	const gapToFront =
		timingDriver.IntervalToPositionAhead?.Value ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0].TimeDifftoPositionAhead : undefined) ??
		timingDriver.TimeDiffToPositionAhead ??
		"";

	const catching = timingDriver.IntervalToPositionAhead?.Catching;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{/* Gap to car ahead — primary */}
			<p
				style={{
					fontSize: 11,
					fontWeight: 700,
					lineHeight: 1,
					fontVariantNumeric: "tabular-nums",
					color: catching ? "#00d484" : gapToFront ? "var(--f1-text)" : "#52525b",
					margin: 0,
					whiteSpace: "nowrap",
				}}
			>
				{gapToFront || "—"}
			</p>

			{/* Gap to leader — sub */}
			<p
				style={{
					fontSize: 9,
					fontWeight: 500,
					lineHeight: 1,
					fontVariantNumeric: "tabular-nums",
					color: "#52525b",
					margin: 0,
					whiteSpace: "nowrap",
				}}
			>
				{gapToLeader || "—"}
			</p>
		</div>
	);
}
