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

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
			<Flag countryCode={session?.Meeting.Country.Code} />

			<div style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
				{session ? (
					<p
						style={{
							fontSize: 11,
							fontWeight: 600,
							lineHeight: 1,
							color: "var(--f1-sub)",
							letterSpacing: ".03em",
							textTransform: "uppercase",
							whiteSpace: "nowrap",
						}}
					>
						{session.Meeting.Name}: {session.Name ?? "Unknown"}
						{timingData?.SessionPart ? ` ${sessionPartPrefix(session.Name)}${timingData.SessionPart}` : ""}
					</p>
				) : (
					<div
						style={{
							height: 12, width: 200, borderRadius: 4,
							background: "rgba(255,255,255,0.05)",
							animation: "pulse 1.5s infinite",
						}}
					/>
				)}

				{timeRemaining !== undefined ? (
					<p
						style={{
							fontSize: 26,
							fontWeight: 900,
							lineHeight: 1,
							color: "var(--f1-text)",
							fontVariantNumeric: "tabular-nums",
							letterSpacing: "-.02em",
						}}
					>
						{timeRemaining}
					</p>
				) : (
					<div
						style={{
							marginTop: 2, height: 26, width: 140, borderRadius: 4,
							background: "rgba(255,255,255,0.05)",
							animation: "pulse 1.5s infinite",
						}}
					/>
				)}
			</div>
		</div>
	);
}
