"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";

import Map from "@/components/dashboard/Map";
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

	const teamHex = driver.TeamColour ? `#${driver.TeamColour}` : "#444";

	const cardBg = favoriteDriver
		? "rgba(0,212,132,0.05)"
		: hasFastest
		? "rgba(156,80,245,0.05)"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "rgba(232,0,31,0.05)"
		: "transparent";

	const cardBorder = favoriteDriver
		? "rgba(0,212,132,0.15)"
		: hasFastest
		? "rgba(156,80,245,0.15)"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "rgba(232,0,31,0.15)"
		: "rgba(255,255,255,0.04)";

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
					gridTemplateColumns: "8rem 3.5rem 4rem 5rem 5rem",
				}}
			>
				{/* Driver row: pos · TLA badge · LastName */}
				<div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
					<span style={{
						fontSize: 12, fontWeight: 800, lineHeight: 1,
						color: position <= 3 ? "#f5a724" : "#52525b",
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
				gridTemplateColumns: "8rem 4rem 5.5rem 5rem 5rem",
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
