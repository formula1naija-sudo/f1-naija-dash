"use client";

import clsx from "clsx";
import { motion } from "motion/react";

import type { Driver, TimingDataDriver } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

import DriverDRS from "./DriverDRS";
import DriverGap from "./DriverGap";
import DriverTire from "./DriverTire";
import DriverMiniSectors from "./DriverMiniSectors";
import DriverLapTime from "./DriverLapTime";
import DriverInfo from "./DriverInfo";
import DriverCarMetrics from "./DriverCarMetrics";

type Props = {
	position: number;
	driver: Driver;
	timingDriver: TimingDataDriver;
};

const hasDRS = (drs: number) => drs > 9;

const possibleDRS = (drs: number) => drs === 8;

const inDangerZone = (position: number, sessionPart: number) => {
	switch (sessionPart) {
		case 1:
			return position > 15;
		case 2:
			return position > 10;
		case 3:
		default:
			return false;
	}
};

export default function Driver({ driver, timingDriver, position }: Props) {
	const sessionPart = useDataStore((state) => state.state?.TimingData?.SessionPart);
	const timingStatsDriver = useDataStore((state) => state.state?.TimingStats?.Lines[driver.RacingNumber]);
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const carData = useDataStore((state) => (state?.carsData ? state.carsData[driver.RacingNumber].Channels : undefined));

	const hasFastest = timingStatsDriver?.PersonalBestLapTime.Position == 1;

	const carMetrics = useSettingsStore((state) => state.carMetrics);

	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));

	const teamHex = driver.TeamColour ? `#${driver.TeamColour}` : "#444";

	// Row background — matches mockup .g-row / .p-row / .r-row
	const rowBg = favoriteDriver
		? "rgba(0,212,132,0.05)"
		: hasFastest
		? "rgba(156,80,245,0.05)"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "rgba(232,0,31,0.05)"
		: "transparent";

	// Left accent bar colour
	const accentColor = favoriteDriver
		? "#00d484"
		: hasFastest
		? "#9c50f5"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "#e8001f"
		: teamHex;

	return (
		<motion.div
			layout="position"
			className={clsx("relative select-none overflow-hidden", {
				"opacity-50": timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped,
			})}
			style={{
				background: rowBg,
				borderBottom: "1px solid rgba(255,255,255,0.025)",
				padding: "6px 13px 6px 17px",
			}}
		>
			{/* Team colour / state left accent bar */}
			<div
				className="absolute top-0 left-0 bottom-0"
				style={{ width: 3, background: accentColor, borderRadius: "12px 0 0 12px" }}
			/>

			<div
				className="grid items-center gap-2"
				style={{
					gridTemplateColumns: carMetrics
						? "8rem 3rem 5rem 3rem 4.5rem 5.5rem auto 10.5rem"
						: "8rem 3rem 5rem 3rem 4.5rem 5.5rem auto",
				}}
			>
				{/* Driver: pos · TLA badge · LastName */}
				<div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
					<span style={{
						fontSize: 12, fontWeight: 800, lineHeight: 1,
						color: position <= 3 ? "#f5a724" : "var(--f1-muted)",
						width: 18, flexShrink: 0, textAlign: "right",
					}}>
						{position}
					</span>
					<span style={{
						padding: "2px 5px", borderRadius: 4,
						fontSize: 10, fontWeight: 800, letterSpacing: ".04em",
						background: `${teamHex}28`, color: teamHex,
						flexShrink: 0,
					}}>
						{driver.Tla}
					</span>
					<span style={{
						fontSize: 11, fontWeight: 500, color: "var(--f1-sub)",
						overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
					}}>
						{driver.LastName}
					</span>
				</div>
				<DriverDRS
					on={carData ? hasDRS(carData[45]) : false}
					possible={carData ? possibleDRS(carData[45]) : false}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>
				<DriverTire stints={appTimingDriver?.Stints} />
				<DriverInfo timingDriver={timingDriver} gridPos={appTimingDriver ? parseInt(appTimingDriver.GridPos) : 0} />
				<DriverGap timingDriver={timingDriver} sessionPart={sessionPart} />
				<DriverLapTime last={timingDriver.LastLapTime} best={timingDriver.BestLapTime} hasFastest={hasFastest} />
				<DriverMiniSectors sectors={timingDriver.Sectors} bestSectors={timingStatsDriver?.BestSectors} />

				{carMetrics && carData && <DriverCarMetrics carData={carData} />}
			</div>
		</motion.div>
	);
}
