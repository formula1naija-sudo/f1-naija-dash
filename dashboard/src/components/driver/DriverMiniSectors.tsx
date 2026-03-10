import clsx from "clsx";

import type { TimingDataDriver, TimingStatsDriver } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	sectors: TimingDataDriver["Sectors"];
	bestSectors: TimingStatsDriver["BestSectors"] | undefined;
};

export default function DriverMiniSectors({ sectors = [], bestSectors }: Props) {
	const showMiniSectors = useSettingsStore((state) => state.showMiniSectors);
	const showBestSectors = useSettingsStore((state) => state.showBestSectors);

	if (!showMiniSectors) {
		return (
			<div style={{ display: "flex", gap: 8 }}>
				{sectors.map((sector, i) => (
					<SectorTime key={`sector.${i}`} sector={sector} bestSector={showBestSectors ? bestSectors?.[i] : undefined} />
				))}
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
			{/* Mini segment pills row — grouped by sector */}
			<div style={{ display: "flex", gap: 6 }}>
				{sectors.map((sector, i) => (
					<div key={`sector.${i}`} style={{ display: "flex", flexDirection: "row", gap: 2 }}>
						{sector.Segments.map((segment, j) => (
							<MiniSector status={segment.Status} key={`sector.mini.${i}.${j}`} />
						))}
					</div>
				))}
			</div>
		</div>
	);
}

function SectorTime({
	sector,
	bestSector,
}: {
	sector: TimingDataDriver["Sectors"][number];
	bestSector: TimingStatsDriver["BestSectors"][number] | undefined;
}) {
	const color = sector.OverallFastest
		? "#9c50f5"
		: sector.PersonalFastest
			? "#00d484"
			: sector.Value
				? "var(--f1-text)"
				: "#52525b";

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<span
				style={{
					fontSize: 11, fontWeight: 700, lineHeight: 1,
					fontVariantNumeric: "tabular-nums",
					color,
					whiteSpace: "nowrap",
				}}
			>
				{sector.Value || sector.PreviousValue || "—"}
			</span>
			{bestSector && (
				<span
					style={{
						fontSize: 9, fontWeight: 500, lineHeight: 1,
						fontVariantNumeric: "tabular-nums",
						color: bestSector.Position === 1 ? "#9c50f5" : "#52525b",
						whiteSpace: "nowrap",
					}}
				>
					{bestSector.Value || "—"}
				</span>
			)}
		</div>
	);
}

function MiniSector({ status }: { status: number }) {
	return (
		<div
			style={{ width: 10, height: 5, borderRadius: 2 }}
			className={clsx({
				"bg-naija-gold": status === 2048 || status === 2052,
				"bg-naija-green": status === 2049,
				"bg-naija-purple": status === 2051,
				"bg-blue-500": status === 2064,
				"bg-zinc-700": status === 0,
			})}
		/>
	);
}
