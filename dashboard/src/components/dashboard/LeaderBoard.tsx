import { AnimatePresence, LayoutGroup } from "motion/react";
import clsx from "clsx";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

import { sortPos } from "@/lib/sorting";

import Driver from "@/components/driver/Driver";

export default function LeaderBoard() {
	const drivers = useDataStore(({ state }) => state?.DriverList);
	const driversTiming = useDataStore(({ state }) => state?.TimingData);

	const showTableHeader = useSettingsStore((state) => state.tableHeaders);
	const carMetrics = useSettingsStore((state) => state.carMetrics);

	const colTemplate = carMetrics
		? "8rem 3rem 5rem 3rem 4.5rem 5.5rem auto 10.5rem"
		: "8rem 3rem 5rem 3rem 4.5rem 5.5rem auto";

	return (
		<div style={{
			border: "1px solid var(--f1-border)",
			borderRadius: 12,
			overflow: "hidden",
			background: "rgba(255,255,255,0.02)",
			display: "flex",
			flexDirection: "column",
			maxHeight: "42rem",
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
				<span style={{ fontSize: 13 }}>🏁</span>
				<span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#71717a" }}>
					Live Positions
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
			{showTableHeader && (
				<div
					className="grid items-center px-3 py-1.5"
					style={{
						gridTemplateColumns: colTemplate,
						fontSize: 9,
						fontWeight: 500,
						color: "#3f3f46",
						letterSpacing: ".04em",
						borderBottom: "1px solid rgba(255,255,255,0.03)",
						flexShrink: 0,
					}}
				>
					<span>Driver</span>
					<span>DRS</span>
					<span>Tyre</span>
					<span>±</span>
					<span>Gap</span>
					<span>Lap Time</span>
					<span>Sectors</span>
					{carMetrics && <span>Car Metrics</span>}
				</div>
			)}

			{/* Scrollable rows */}
			<div className="no-scrollbar flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent" }}>
				{(!drivers || !driversTiming) &&
					new Array(20).fill("").map((_, index) => <SkeletonDriver key={`driver.loading.${index}`} />)}

				<LayoutGroup key="drivers">
					{drivers && driversTiming && (
						<AnimatePresence>
							{Object.values(driversTiming.Lines)
								.sort(sortPos)
								.map((timingDriver, index) => (
									<Driver
										key={`leaderBoard.driver.${timingDriver.RacingNumber}`}
										position={index + 1}
										driver={drivers[timingDriver.RacingNumber]}
										timingDriver={timingDriver}
									/>
								))}
						</AnimatePresence>
					)}
				</LayoutGroup>
			</div>
		</div>
	);
}

const SkeletonDriver = () => {
	const carMetrics = useSettingsStore((state) => state.carMetrics);

	const animateClass = "h-8 animate-pulse rounded-md bg-zinc-800";

	return (
		<div
			className="grid items-center gap-2 px-3 py-1.5"
			style={{
				gridTemplateColumns: carMetrics
					? "8rem 3rem 5rem 3rem 4.5rem 5.5rem auto 10.5rem"
					: "8rem 3rem 5rem 3rem 4.5rem 5.5rem auto",
				borderBottom: "1px solid rgba(255,255,255,0.025)",
			}}
		>
			<div className={animateClass} style={{ width: "100%" }} />

			<div className={animateClass} style={{ width: "100%" }} />

			<div className="flex w-full gap-2">
				<div className={clsx(animateClass, "w-8")} />

				<div className="flex flex-1 flex-col gap-1">
					<div className={clsx(animateClass, "h-4!")} />
					<div className={clsx(animateClass, "h-3! w-2/3")} />
				</div>
			</div>

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

			<div className="flex w-full gap-1">
				{new Array(3).fill(null).map((_, index) => (
					<div className="flex w-full flex-col gap-1" key={`skeleton.sector.${index}`}>
						<div className={clsx(animateClass, "h-4!")} />
						<div className={clsx(animateClass, "h-3! w-2/3")} />
					</div>
				))}
			</div>

			{carMetrics && (
				<div className="flex w-full gap-2">
					<div className={clsx(animateClass, "w-8")} />

					<div className="flex flex-1 flex-col gap-1">
						<div className={clsx(animateClass, "h-1/2!")} />
						<div className={clsx(animateClass, "h-1/2!")} />
					</div>
				</div>
			)}
		</div>
	);
};
