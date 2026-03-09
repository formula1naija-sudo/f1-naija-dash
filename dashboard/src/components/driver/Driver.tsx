"use client";

import clsx from "clsx";
import { motion } from "motion/react";

import type { Driver, TimingDataDriver } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

import DriverTag from "./DriverTag";
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

	const cardBg = favoriteDriver
		? "rgba(0,212,132,0.08)"
		: hasFastest
		? "rgba(156,80,245,0.08)"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "rgba(232,0,31,0.08)"
		: "rgba(255,255,255,0.018)";

	const cardBorder = favoriteDriver
		? "rgba(0,212,132,0.25)"
		: hasFastest
		? "rgba(156,80,245,0.25)"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "rgba(232,0,31,0.25)"
		: "rgba(255,255,255,0.06)";

	return (
		<motion.div
			layout="position"
			className={clsx("relative flex flex-col gap-1 rounded-xl select-none overflow-hidden", {
				"opacity-50": timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped,
			})}
			style={{
				background: cardBg,
				border: `1px solid ${cardBorder}`,
				padding: "6px 6px 6px 14px",
			}}
		>
			{/* Team colour left accent bar */}
			<div
				className="absolute top-0 left-0 bottom-0"
				style={{ width: 3, background: teamHex, borderRadius: "12px 0 0 12px" }}
			/>

			<div
				className="grid items-center gap-2"
				style={{
					gridTemplateColumns: carMetrics
						? "5.5rem 3.5rem 5.5rem 4rem 5rem 5.5rem auto 10.5rem"
						: "5.5rem 3.5rem 5.5rem 4rem 5rem 5.5rem auto",
				}}
			>
				<DriverTag className="min-w-full!" short={driver.Tla} teamColor={driver.TeamColour} position={position} />
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
