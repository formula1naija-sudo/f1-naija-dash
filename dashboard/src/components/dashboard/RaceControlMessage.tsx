import { motion } from "motion/react";
import { utc } from "moment";

import type { Message } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";

import { toTrackTime } from "@/lib/toTrackTime";

type Props = {
	msg: Message;
	gmtOffset: string;
};

const getDriverNumber = (msg: Message) => {
	const match = msg.Message.match(/CAR (\d+)/);
	return match?.[1];
};

const flagAccent = (flag: string | undefined): { color: string; dot: string } => {
	const f = flag?.toUpperCase() ?? "";
	if (f === "GREEN" || f === "CLEAR") return { color: "#00d484", dot: "#00d484" };
	if (f === "YELLOW" || f === "DOUBLE YELLOW") return { color: "#fbbf24", dot: "#fbbf24" };
	if (f === "RED") return { color: "#ef4444", dot: "#ef4444" };
	if (f === "CHEQUERED") return { color: "#a1a1aa", dot: "#a1a1aa" };
	if (f === "SAFETY CAR") return { color: "#f5a724", dot: "#f5a724" };
	return { color: "rgba(255,255,255,0.15)", dot: "rgba(255,255,255,0.3)" };
};

export function RaceControlMessage({ msg, gmtOffset }: Props) {
	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(getDriverNumber(msg) ?? ""));

	const localTime = utc(msg.Utc).local().format("HH:mm:ss");
	const trackTime = utc(toTrackTime(msg.Utc, gmtOffset)).format("HH:mm");

	const { color, dot } = flagAccent(msg.Flag);

	return (
		<motion.li
			layout="position"
			animate={{ opacity: 1, y: 0 }}
			initial={{ opacity: 0, y: -6 }}
			style={{
				display: "flex",
				gap: 10,
				padding: "8px 10px",
				borderRadius: 6,
				borderBottom: "1px solid var(--f1-border-soft)",
				background: favoriteDriver ? "rgba(0,212,132,0.04)" : "transparent",
				listStyle: "none",
			}}
		>
			{/* Left accent dot */}
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 3, flexShrink: 0 }}>
				<div
					style={{
						width: 8, height: 8, borderRadius: "50%",
						background: dot,
						flexShrink: 0,
					}}
				/>
				<div style={{ width: 1, flex: 1, background: `${color}22`, minHeight: 8 }} />
			</div>

			{/* Content */}
			<div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
				{/* Meta */}
				<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
					{msg.Lap && (
						<span style={{ fontSize: 10, fontWeight: 600, color: "var(--f1-sub)" }}>
							Lap {msg.Lap}
						</span>
					)}
					{msg.Lap && <span style={{ fontSize: 10, color: "#3f3f46" }}>·</span>}
					<time style={{ fontSize: 10, color: "var(--f1-sub)" }} dateTime={localTime}>
						{localTime}
					</time>
					<span style={{ fontSize: 10, color: "#3f3f46" }}>·</span>
					<time style={{ fontSize: 10, color: "#3f3f46" }} dateTime={trackTime}>
						{trackTime}
					</time>
				</div>

				{/* Message */}
				<p
					style={{
						fontSize: 12,
						fontWeight: 700,
						lineHeight: 1.3,
						color: msg.Flag ? color : "var(--f1-text)",
						letterSpacing: ".01em",
						margin: 0,
					}}
				>
					{msg.Message}
				</p>
			</div>
		</motion.li>
	);
}
