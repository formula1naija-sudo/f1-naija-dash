"use client";

import { utc, duration } from "moment";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

import Flag from "@/components/Flag";

const sessionPartPrefix = (name: string) => {
	switch (name) {
		case "Sprint Qualifying":
			return "SQ";
		case "Qualifying":
			return "Q";
		default:
			return "";
	}
};

export default function SessionInfo() {
	const clock = useDataStore((state) => state.state?.ExtrapolatedClock);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const timingData = useDataStore((state) => state.state?.TimingData);
	const lapCount = useDataStore((state) => state.state?.LapCount);

	const delay = useSettingsStore((state) => state.delay);

	const timeRemaining =
		!!clock && !!clock.Remaining
			? clock.Extrapolating
				? utc(
						duration(clock.Remaining)
							.subtract(utc().diff(utc(clock.Utc)))
							.asMilliseconds() + (delay ? delay * 1000 : 0),
					).format("HH:mm:ss")
				: clock.Remaining
			: undefined;

	const sessionName = session
		? `${session.Name ?? "Unknown"}${timingData?.SessionPart ? ` ${sessionPartPrefix(session.Name)}${timingData.SessionPart}` : ""}`
		: null;

	const lapSub = lapCount
		? `Lap ${lapCount.CurrentLap} of ${lapCount.TotalLaps}`
		: null;

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
			{/* Flag */}
			<Flag countryCode={session?.Meeting.Country.Code} />

			{/* Left: meeting name + session · lap */}
			<div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
				{session ? (
					<p
						style={{
							fontSize: 14,
							fontWeight: 700,
							lineHeight: 1,
							color: "var(--f1-text)",
							whiteSpace: "nowrap",
						}}
					>
						{session.Meeting.Name}
					</p>
				) : (
					<div style={{ height: 14, width: 180, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
				)}

				{sessionName ? (
					<p style={{ fontSize: 11, fontWeight: 400, lineHeight: 1, color: "var(--f1-sub)", whiteSpace: "nowrap" }}>
						{sessionName}
						{lapSub && <span style={{ color: "var(--f1-sub)" }}> · {lapSub}</span>}
					</p>
				) : (
					<div style={{ height: 10, width: 130, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
				)}
			</div>

			{/* Divider */}
			<div style={{ width: 1, height: 32, background: "var(--f1-border)", flexShrink: 0 }} />

			{/* Right: timer in gold */}
			{timeRemaining !== undefined ? (
				<p
					style={{
						fontSize: 26,
						fontWeight: 900,
						lineHeight: 1,
						color: "#f5a724",
						fontVariantNumeric: "tabular-nums",
						letterSpacing: "-.02em",
						whiteSpace: "nowrap",
					}}
				>
					{timeRemaining}
				</p>
			) : (
				<div style={{ height: 26, width: 130, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
			)}
		</div>
	);
}
