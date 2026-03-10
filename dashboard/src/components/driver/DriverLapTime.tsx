import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	last: TimingDataDriver["LastLapTime"];
	best: TimingDataDriver["BestLapTime"];
	hasFastest: boolean;
};

export default function DriverLapTime({ last, best, hasFastest }: Props) {
	const bestColor = hasFastest ? "#9c50f5" : "#52525b";

	const lastColor = last.OverallFastest
		? "#9c50f5"
		: last.PersonalFastest
			? "#00d484"
			: last.Value
				? "var(--f1-text)"
				: "#52525b";

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{/* Last lap — primary */}
			<p
				style={{
					fontSize: 11,
					fontWeight: 700,
					lineHeight: 1,
					fontVariantNumeric: "tabular-nums",
					color: lastColor,
					margin: 0,
					whiteSpace: "nowrap",
				}}
			>
				{last.Value || "—:——.———"}
				{last.OverallFastest && <span style={{ marginLeft: 3, fontSize: 9 }}>⚡</span>}
			</p>

			{/* Best lap — sub */}
			<p
				style={{
					fontSize: 9,
					fontWeight: 500,
					lineHeight: 1,
					fontVariantNumeric: "tabular-nums",
					color: bestColor,
					margin: 0,
					whiteSpace: "nowrap",
				}}
			>
				{best.Value || "—:——.———"}
			</p>
		</div>
	);
}
