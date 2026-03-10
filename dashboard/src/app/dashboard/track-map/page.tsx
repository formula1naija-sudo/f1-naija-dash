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
	const circuitName = useDataStore((state) => state.state?.SessionInfo?.Meeting?.Circuit?.ShortName ?? "Circuit");
	const lapCount = useDataStore((state) => state.state?.LapCount);

	const lapProgress = lapCount?.TotalLaps
		? Math.min((lapCount.CurrentLap / lapCount.TotalLaps) * 100, 100)
		: 0;

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
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "260px 1fr",
					gap: 8,
					flex: 1,
					minHeight: 0,
					padding: 8,
				}}
				className="flex-col-reverse md:grid"
			>
				{/* ── DRIVER SIDEBAR ── */}
				<div style={{
					border: "1px solid var(--f1-border)",
					borderRadius: 12,
					background: "rgba(255,255,255,0.02)",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}>
					{/* Panel header */}
					<div style={{
						display: "flex",
						alignItems: "center",
						gap: 7,
						padding: "9px 13px",
						borderBottom: "1px solid var(--f1-border)",
						background: "rgba(255,255,255,0.02)",
						flexShrink: 0,
					}}>
						<span style={{ fontSize: 13 }}>🏎️</span>
						<span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#71717a" }}>
							Positions
						</span>
						<span style={{
							marginLeft: "auto",
							fontSize: 9, fontWeight: 600,
							padding: "2px 6px", borderRadius: 4,
							color: "#00d484",
							background: "rgba(0,212,132,0.1)",
							border: "1px solid rgba(0,212,132,0.2)",
						}}>
							↻ Live
						</span>
					</div>

					{/* Column headers */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "100px 44px 60px 60px 68px",
							padding: "5px 10px 5px 14px",
							fontSize: 8,
							fontWeight: 500,
							color: "#3f3f46",
							letterSpacing: ".04em",
							borderBottom: "1px solid rgba(255,255,255,0.03)",
							flexShrink: 0,
						}}
					>
						<span>Driver</span>
						<span>DRS</span>
						<span>Info</span>
						<span>Gap</span>
						<span>Lap Time</span>
					</div>

					{/* Scrollable rows */}
					<div className="no-scrollbar flex-1 overflow-y-auto">
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
				</div>

				{/* ── MAP FRAME ── */}
				<div style={{
					border: "1px solid var(--f1-border)",
					borderRadius: 12,
					background: "#0a0a0a",
					position: "relative",
					overflow: "hidden",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "30rem",
				}}>
					{/* Circuit name label */}
					<span style={{
						position: "absolute", top: 14, left: 14,
						fontSize: 10, fontWeight: 600,
						color: "#3f3f46", letterSpacing: ".06em", textTransform: "uppercase",
					}}>
						{circuitName}
					</span>

					{/* LIVE TRACKING badge */}
					<span style={{
						position: "absolute", top: 14, right: 14,
						display: "flex", alignItems: "center", gap: 5,
						fontSize: 10, fontWeight: 600,
						color: "#00d484",
						background: "rgba(0,212,132,0.1)",
						border: "1px solid rgba(0,212,132,0.25)",
						padding: "4px 10px", borderRadius: 6,
					}}>
						<span style={{
							width: 5, height: 5, borderRadius: "50%",
							background: "#00d484",
							boxShadow: "0 0 5px #00d484",
							display: "inline-block",
						}} />
						LIVE TRACKING
					</span>

					{/* Map SVG */}
					<div className="h-full w-full">
						<Map />
					</div>

					{/* Lap progress bar + labels */}
					{lapCount && (
						<>
							<span style={{
								position: "absolute", bottom: 22, left: 14,
								fontSize: 9, color: "#52525b",
								letterSpacing: ".08em", textTransform: "uppercase",
							}}>
								Lap Progress
							</span>
							<span style={{
								position: "absolute", bottom: 22, right: 14,
								fontSize: 10, fontWeight: 700, color: "#f5a724",
							}}>
								Lap {lapCount.CurrentLap} / {lapCount.TotalLaps}
							</span>
							<div style={{
								position: "absolute", bottom: 14, left: 14, right: 14,
								height: 3,
								background: "rgba(255,255,255,0.04)",
								borderRadius: 99,
								overflow: "hidden",
							}}>
								<div style={{
									height: "100%",
									width: `${lapProgress}%`,
									background: "linear-gradient(90deg,#00d484,rgba(0,212,132,0.3))",
									borderRadius: 99,
									transition: "width 1s linear",
								}} />
							</div>
						</>
					)}
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
		case 1: return position > 15;
		case 2: return position > 10;
		default: return false;
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

	const rowBg = favoriteDriver
		? "rgba(0,212,132,0.05)"
		: hasFastest
		? "rgba(156,80,245,0.05)"
		: sessionPart != undefined && inDangerZone(position, sessionPart)
		? "rgba(232,0,31,0.05)"
		: "transparent";

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
			className={clsx("relative overflow-hidden select-none", {
				"opacity-50": timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped,
			})}
			style={{
				background: rowBg,
				borderBottom: "1px solid rgba(255,255,255,0.025)",
				padding: "5px 10px 5px 14px",
			}}
		>
			{/* Team colour accent bar */}
			<div
				className="absolute top-0 left-0 bottom-0"
				style={{ width: 3, background: accentColor, borderRadius: "12px 0 0 12px" }}
			/>

			<div
				className="grid items-center gap-1.5"
				style={{ gridTemplateColumns: "100px 44px 60px 60px 68px" }}
			>
				{/* Driver: pos · TLA · LastName */}
				<div className="flex min-w-0 items-center gap-1 overflow-hidden">
					<span style={{
						fontSize: 11, fontWeight: 800, lineHeight: 1,
						color: position <= 3 ? "#f5a724" : "#52525b",
						width: 16, flexShrink: 0, textAlign: "right",
					}}>
						{position}
					</span>
					<span style={{
						padding: "2px 5px", borderRadius: 4,
						fontSize: 9, fontWeight: 800, letterSpacing: ".04em",
						background: `${teamHex}28`, color: teamHex,
						flexShrink: 0,
					}}>
						{driver.Tla}
					</span>
					<span style={{
						fontSize: 9, fontWeight: 500, color: "#71717a",
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
			className="grid items-center gap-1.5 px-3 py-1.5"
			style={{
				gridTemplateColumns: "100px 44px 60px 60px 68px",
				borderBottom: "1px solid rgba(255,255,255,0.025)",
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
