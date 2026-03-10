import { useRef, useState } from "react";
import { motion } from "motion/react";
import { utc } from "moment";

import type { Driver, RadioCapture } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";

import { toTrackTime } from "@/lib/toTrackTime";

import PlayControls from "@/components/ui/PlayControls";

type Props = {
	driver: Driver;
	capture: RadioCapture;
	basePath: string;
	gmtOffset: string;
};

// Decorative waveform bars — static pattern, animates opacity when playing
const WAVEFORM = [4, 8, 14, 10, 18, 12, 6, 16, 10, 8, 14, 7, 12, 16, 9, 11, 7, 15, 10, 13];

export default function RadioMessage({ driver, capture, basePath, gmtOffset }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const [playing, setPlaying] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);

	const loadMeta = () => {
		if (!audioRef.current) return;
		setDuration(audioRef.current.duration);
	};

	const onEnded = () => {
		setPlaying(false);
		setProgress(0);
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const updateProgress = () => {
		if (!audioRef.current) return;
		setProgress(audioRef.current.currentTime);
	};

	const togglePlayback = () => {
		setPlaying((old) => {
			if (!audioRef.current) return old;
			if (!old) {
				audioRef.current.play();
				intervalRef.current = setInterval(updateProgress, 100);
			} else {
				audioRef.current.pause();
				if (intervalRef.current) clearInterval(intervalRef.current);
				setTimeout(() => {
					setProgress(0);
					audioRef.current?.fastSeek(0);
				}, 10000);
			}
			return !old;
		});
	};

	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));

	const trackTime = utc(toTrackTime(capture.Utc, gmtOffset)).format("HH:mm");
	const teamColor = driver?.TeamColour ? `#${driver.TeamColour}` : "#52525b";

	// Format duration as MM:SS
	const durationFormatted = duration > 0
		? `${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(Math.floor(duration % 60)).padStart(2, "0")}`
		: trackTime;

	// Progress fraction 0→1
	const pct = duration > 0 ? progress / duration : 0;

	return (
		<motion.li
			animate={{ opacity: 1, y: 0 }}
			initial={{ opacity: 0, y: -4 }}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "8px 10px",
				borderBottom: "1px solid var(--f1-border-soft)",
				borderRadius: 6,
				background: favoriteDriver ? "rgba(0,212,132,0.04)" : "transparent",
				listStyle: "none",
			}}
		>
			{/* TLA Badge */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "3px 6px",
					borderRadius: 5,
					background: teamColor,
					flexShrink: 0,
				}}
			>
				<span
					style={{
						fontFamily: "monospace",
						fontSize: 10,
						fontWeight: 900,
						color: "#fff",
						letterSpacing: ".04em",
					}}
				>
					{driver?.Tla ?? "???"}
				</span>
			</div>

			{/* Driver name + team + lap */}
			<div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
				<span style={{ fontSize: 12, fontWeight: 700, color: "var(--f1-text)", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
					{driver?.LastName ?? driver?.BroadcastName ?? "Unknown"}
				</span>
				<span style={{ fontSize: 10, color: "var(--f1-sub)", lineHeight: 1, whiteSpace: "nowrap" }}>
					{driver?.TeamName ?? "—"}{capture.Path ? "" : ""}
				</span>
			</div>

			{/* Waveform */}
			<div style={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
				{WAVEFORM.map((h, i) => {
					const filled = playing && duration > 0 && (i / WAVEFORM.length) <= pct;
					return (
						<div
							key={i}
							style={{
								width: 2,
								height: h,
								borderRadius: 1,
								background: filled ? teamColor : "rgba(255,255,255,0.15)",
								transition: "background 0.1s",
							}}
						/>
					);
				})}
			</div>

			{/* Play button */}
			<div
				style={{
					width: 30, height: 30,
					borderRadius: "50%",
					border: `1.5px solid ${playing ? teamColor : "rgba(255,255,255,0.15)"}`,
					background: playing ? `${teamColor}18` : "transparent",
					display: "flex", alignItems: "center", justifyContent: "center",
					cursor: "pointer",
					flexShrink: 0,
					transition: "all 0.15s",
					overflow: "hidden",
				}}
			>
				<PlayControls
					playing={playing}
					onClick={togglePlayback}
					className="!h-[18px] !w-[18px]"
				/>
			</div>

			{/* Duration / time */}
			<span
				style={{
					fontSize: 10,
					fontWeight: 600,
					color: "var(--f1-sub)",
					whiteSpace: "nowrap",
					minWidth: 32,
					textAlign: "right",
					flexShrink: 0,
				}}
			>
				{durationFormatted}
			</span>

			<audio
				preload="none"
				src={`${basePath}${capture.Path}`}
				ref={audioRef}
				onEnded={onEnded}
				onLoadedMetadata={loadMeta}
			/>
		</motion.li>
	);
}
