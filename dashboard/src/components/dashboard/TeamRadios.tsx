import { AnimatePresence } from "motion/react";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";

import { sortUtc } from "@/lib/sorting";

import RadioMessage from "@/components/dashboard/RadioMessage";

export default function TeamRadios() {
	const drivers = useDataStore((state) => state.state?.DriverList);
	const teamRadios = useDataStore((state) => state.state?.TeamRadio);
	const sessionPath = useDataStore((state) => state.state?.SessionInfo?.Path);

	const gmtOffset = useDataStore((state) => state.state?.SessionInfo?.GmtOffset);

	const basePath = `https://livetiming.formula1.com/static/${sessionPath}`;

	// TODO add notice that we only show 20

	return (
		<ul className="flex flex-col">
			{!teamRadios && new Array(6).fill("").map((_, index) => <SkeletonMessage key={`radio.loading.${index}`} />)}

			{teamRadios && gmtOffset && drivers && teamRadios.Captures && (
				<AnimatePresence>
					{teamRadios.Captures.sort(sortUtc)
						.slice(0, 20)
						.map((teamRadio, i) => (
							<RadioMessage
								key={`radio.${i}`}
								driver={drivers[teamRadio.RacingNumber]}
								capture={teamRadio}
								basePath={basePath}
								gmtOffset={gmtOffset}
							/>
						))}
				</AnimatePresence>
			)}
		</ul>
	);
}

const SkeletonMessage = () => {
	const pulse = "animate-pulse rounded bg-zinc-800/60";

	return (
		<li
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "8px 10px",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}
		>
			{/* TLA badge placeholder */}
			<div className={clsx(pulse)} style={{ width: 38, height: 22, borderRadius: 5, flexShrink: 0 }} />
			{/* Name + team */}
			<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
				<div className={clsx(pulse)} style={{ height: 10, width: "55%" }} />
				<div className={clsx(pulse)} style={{ height: 8, width: "35%" }} />
			</div>
			{/* Waveform placeholder */}
			<div className={clsx(pulse)} style={{ width: 52, height: 16 }} />
			{/* Play button placeholder */}
			<div className={clsx(pulse)} style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0 }} />
			{/* Duration placeholder */}
			<div className={clsx(pulse)} style={{ width: 28, height: 10 }} />
		</li>
	);
};
