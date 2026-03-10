"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";

import Map from "@/components/dashboard/Map";
import DriverTag from "@/components/driver/DriverTag";
import DriverDRS from "@/components/driver/DriverDRS";
import DriverInfo from "@/components/driver/DriverInfo";
import DriverGap from "@/components/driver/DriverGap";
import DriverLapTime from "@/components/driver/DriverLapTime";

import { sortPos } from "@/lib/sorting";

import { useDataStore } from "@/stores/useDataStore";
import type { Driver, TimingDataDriver } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";

export default function TrackMap() {
	const drivers = useDataStore((state) => state.state?.DriverList);
	const driversTiming = useDataStore((state) => state.state?.TimingData);

	return (
		<div className="flex h-full flex-col">
			{/* ── PAGE HERO ── */}
			<div style={{
				position: "relative", overflow: "hidden", flexShrink: 0,
				padding: "clamp(24px,4vw,40px) 16px clamp(20px,3vw,32px)",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}>
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(var(--f1-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--f1-grid-line) 1px,transparent 1px)",
					backgroundSize: "64px 64px",
					WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
					maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
				}} />
				<div style={{ position: "relative", zIndex: 1 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
						<div style={{ width: 16, height: 1, background: "#00d484", flexShrink: 0 }} />
						<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
							Driver Tracker
						</span>
					</div>
					<div style={{ lineHeight: 0.92 }}>
						<span style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)" }}>Track </span>
						<span style={{
							fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em",
							background: "linear-gradient(120deg,#00d484 0%,#7affd4 50%,#00d484 100%)",
							WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
						}}>Map.</span>
					</div>
				</div>
			</div>

			{/* ── MAP + DRIVER LIST ── */}
			<div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
				<div className="flex w-full flex-col gap-0.5 overflow-y-auto border-zinc-800 md:h-full md:w-fit md:rounded-lg md:border md:p-2">
					{(!drivers || !driversTiming) &&
						new Array(20).fill("").map((_, index) => <SkeletonDriver key={`driver.loading.${index}`} />)}

					{drivers && driversTiming && (
						<AnimatePresence>
							{Object.values(driversTiming.Lines)
								.sort(sortPos)
								.map((timingDriver, index) => (
									<TrackMapDriver
										key={`trackmap.driver.${timingDriver.RacingNumber}`}
										position={index + 1}
										driver={drivers[timingDriver.RacingNumber]}
										timingDriver={timingDriver}
									/>
								))}
						</AnimatePresence>
					)}
				</div>

				<div className="md:flex-1">
					<Map />
				</div>
			</div>
		</div>
	);
}

type TrackMapDriverProps = {
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

const TrackMapDriver = ({ position, driver, timingDriver }: TrackMapDriverProps) => {
	const sessionPart = useDataStore((state) => state.state?.TimingData?.SessionPart);
	const timingStatsDriver = useDataStore((state) => state.state?.TimingStats?.Lines[driver.RacingNumber]);
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const hasFastest = timingStatsDriver?.PersonalBestLapTime.Position == 1;

	const carData = useDataStore((state) => (state?.carsData ? state.carsData[driver.RacingNumber].Channels : undefined));

	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));

	return (
		<motion.div
			layout="position"
			className={clsx("flex flex-col gap-1 rounded-lg p-1.5 select-none", {
				"opacity-50": timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped,
				"bg-sky-800/30": favoriteDriver,
				"bg-violet-800/30": hasFastest,
				"bg-red-800/30": sessionPart != undefined && inDangerZone(position, sessionPart),
			})}
		>
			<div
				className="grid items-center gap-2"
				style={{
					gridTemplateColumns: "5.5rem 3.5rem 4rem 5rem 5rem",
				}}
			>
				<DriverTag className="min-w-full!" short={driver.Tla} teamColor={driver.TeamColour} position={position} />
				<DriverDRS
					on={carData ? hasDRS(carData[45]) : false}
					possible={carData ? possibleDRS(carData[45]) : false}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>
				<DriverInfo timingDriver={timingDriver} gridPos={appTimingDriver ? parseInt(appTimingDriver.GridPos) : 0} />
				<DriverGap timingDriver={timingDriver} sessionPart={sessionPart} />
				<DriverLapTime last={timingDriver.LastLapTime} best={timingDriver.BestLapTime} hasFastest={hasFastest} />
			</div>
		</motion.div>
	);
};

const SkeletonDriver = () => {
	const animateClass = "h-8 animate-pulse rounded-md bg-zinc-800";

	return (
		<div
			className="grid place-items-center items-center gap-1 p-1"
			style={{
				gridTemplateColumns: "5.5rem 4rem 5.5rem 5rem 5rem",
			}}
		>
			<div className={animateClass} style={{ width: "100%" }} />

			<div className={animateClass} style={{ width: "90%" }} />

			{new Array(2).fill(null).map((_, index) => (
				<div className="flex w-full flex-col gap-1" key={`skeleton.${index}`}>
					<div className={clsx(animateClass, "h-4!")} />
					<div className={clsx(animateClass, "h-3! w-2/3")} />
				</div>
			))}

			<div className="flex w-full flex-col gap-1">
				<div className={clsx(animateClass, "h-3! w-4/5")} />
				<div className={clsx(animateClass, "h-4!")} />
			</div>
		</div>
	);
};
