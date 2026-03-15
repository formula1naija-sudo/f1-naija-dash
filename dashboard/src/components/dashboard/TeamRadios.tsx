import { AnimatePresence } from "motion/react";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";

import { sortUtc } from "@/lib/sorting";

import RadioMessage from "@/components/dashboard/RadioMessage";

export default function TeamRadios() {
	// storeState === null means the SSE hasn't delivered the initial snapshot yet.
	// Once it arrives, storeState is non-null even if TeamRadio is absent (no live session).
	const storeState   = useDataStore((state) => state.state);
	const drivers      = useDataStore((state) => state.state?.DriverList);
	const teamRadios   = useDataStore((state) => state.state?.TeamRadio);
	const sessionPath  = useDataStore((state) => state.state?.SessionInfo?.Path);
	const gmtOffset    = useDataStore((state) => state.state?.SessionInfo?.GmtOffset);

	const basePath = `https://livetiming.formula1.com/static/${sessionPath}`;

	const isLoading   = storeState === null;
	const hasCaptures = !!(teamRadios?.Captures?.length);

	return (
		<ul className="flex flex-col">
			{/* 1 — SSE not yet connected */}
			{isLoading && new Array(6).fill("").map((_, index) => <SkeletonMessage key={`radio.loading.${index}`} />)}

			{/* 2 — Connected but no radio data (between sessions / off-season) */}
			{!isLoading && !hasCaptures && (
				<li style={{ padding: "32px 16px", textAlign: "center", listStyle: "none" }}>
					<p style={{ fontSize: 24, marginBottom: 8 }}>🎙️</p>
					<p style={{ fontSize: 13, fontWeight: 600, color: "var(--f1-text)", marginBottom: 4 }}>
						No team radio yet
					</p>
					<p style={{ fontSize: 11, color: "var(--f1-sub)", lineHeight: 1.5 }}>
						Radio messages appear here during a live session.
					</p>
				</li>
			)}

			{/* 3 — Has captures → show messages (up to 20) */}
			{!isLoading && hasCaptures && gmtOffset && drivers && (
				<AnimatePresence>
					{/* Spread into a new array — .sort() mutates in place and would
					    silently reorder the Captures array inside the Zustand store. */}
					{[...teamRadios!.Captures].sort(sortUtc)
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
