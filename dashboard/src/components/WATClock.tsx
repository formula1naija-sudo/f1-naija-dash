"use client";

import { useEffect, useState } from "react";

const WAT_FORMATTER = new Intl.DateTimeFormat("en-NG", {
	timeZone: "Africa/Lagos",
	hour:   "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hour12: false,
});

const WAT_DATE_FORMATTER = new Intl.DateTimeFormat("en-NG", {
	timeZone: "Africa/Lagos",
	weekday: "short",
	day:     "numeric",
	month:   "short",
});

type Props = {
	/** Show the date line beneath the clock */
	showDate?: boolean;
	/** Compact single-line layout */
	compact?: boolean;
};

export default function WATClock({ showDate = false, compact = false }: Props) {
	const [time, setTime] = useState<string>("");
	const [date, setDate] = useState<string>("");

	useEffect(() => {
		const tick = () => {
			const now = new Date();
			setTime(WAT_FORMATTER.format(now));
			if (showDate) setDate(WAT_DATE_FORMATTER.format(now));
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [showDate]);

	if (!time) return null;

	if (compact) {
		return (
			<span style={{
				display: "inline-flex", alignItems: "center", gap: 5,
				fontSize: 10, fontWeight: 700, color: "var(--f1-muted)",
				fontVariantNumeric: "tabular-nums",
			}}>
				<span style={{
					fontSize: 8, fontWeight: 700, letterSpacing: ".1em",
					color: "#008751", textTransform: "uppercase",
				}}>WAT</span>
				<span>{time}</span>
			</span>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
				{/* Nigeria flag colours accent */}
				<div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
					<div style={{ width: 3, height: 16, borderRadius: 1, background: "#008751" }} />
					<div style={{ width: 3, height: 16, borderRadius: 1, background: "#ffffff22" }} />
					<div style={{ width: 3, height: 16, borderRadius: 1, background: "#008751" }} />
				</div>
				<div>
					<span style={{
						display: "block",
						fontSize: 22, fontWeight: 900, lineHeight: 1,
						fontVariantNumeric: "tabular-nums",
						letterSpacing: "-.02em",
						color: "var(--f1-text)",
					}}>{time}</span>
					<span style={{
						fontSize: 9, fontWeight: 700, letterSpacing: ".12em",
						color: "#008751", textTransform: "uppercase",
					}}>West Africa Time</span>
				</div>
			</div>
			{showDate && date && (
				<p style={{ fontSize: 10, color: "var(--f1-muted)", marginLeft: 17 }}>{date}</p>
			)}
		</div>
	);
}
