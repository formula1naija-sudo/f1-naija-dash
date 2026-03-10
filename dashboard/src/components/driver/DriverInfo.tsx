import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
	const positionChange = gridPos && gridPos - parseInt(timingDriver.Position);
	const gain = positionChange !== undefined && positionChange !== null && positionChange > 0;
	const loss = positionChange !== undefined && positionChange !== null && positionChange < 0;

	let arrow = "—";
	let color = "#52525b";

	if (positionChange !== undefined && positionChange !== null && positionChange !== 0) {
		if (gain) {
			arrow = `↑${positionChange}`;
			color = "#00d484";
		} else if (loss) {
			arrow = `↓${Math.abs(positionChange)}`;
			color = "#e8001f";
		}
	}

	return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
			<span
				style={{
					fontSize: 11,
					fontWeight: 800,
					lineHeight: 1,
					color,
					fontVariantNumeric: "tabular-nums",
					letterSpacing: "-.01em",
				}}
			>
				{arrow}
			</span>
		</div>
	);
}
