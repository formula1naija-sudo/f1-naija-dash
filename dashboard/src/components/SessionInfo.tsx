"use client";

import { utc, duration } from "moment";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

import Flag from "@/components/Flag";
import WATClock from "@/components/WATClock";

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
	const sessionType = useDataStore((state) => state.state?.SessionInfo?.Type);

	// Task 24: session progress (lap-based for race, time-based for other sessions)
	const lapProgress = lapCount?.TotalLaps
		? Math.min((lapCount.CurrentLap / lapCount.TotalLaps) * 100, 100)
		: null;

	// Task 26: DRS zone active — derived from last relevant RaceControlMessages entry
	const drsEnabled = useDataStore((state) => {
		const msgs = state.state?.RaceControlMessages?.Messages ?? [];
		const drsMsgs = msgs.filter(m => m.Category === "Drs");
		if (drsMsgs.length === 0) return null; // no data yet
		return drsMsgs[drsMsgs.length - 1]?.Status === "ENABLED";
	});

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

	const isRace = sessionType === "Race";

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			{/* ── Main row: flag · session info · divider · timer · DRS badge ── */}
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

				{/* Task 26: DRS zone badge — only shown during a race when data is available */}
				{isRace && drsEnabled !== null && (
					<span
						style={{
							display: "inline-flex", alignItems: "center", gap: 4,
							padding: "3px 9px", borderRadius: 5,
							fontSize: 9, fontWeight: 800, letterSpacing: ".08em",
							border: "1px solid",
							borderColor: drsEnabled ? "rgba(0,212,132,0.45)" : "rgba(63,63,70,0.6)",
							background: drsEnabled ? "rgba(0,212,132,0.1)" : "transparent",
							color: drsEnabled ? "#00d484" : "#52525b",
							whiteSpace: "nowrap",
							flexShrink: 0,
						}}
						title={drsEnabled ? "DRS zone active" : "DRS zone closed"}
					>
						<span style={{
							width: 5, height: 5, borderRadius: "50%",
							background: drsEnabled ? "#00d484" : "#3f3f46",
							display: "inline-block", flexShrink: 0,
						}} />
						DRS {drsEnabled ? "OPEN" : "CLOSED"}
					</span>
				)}

				{/* Task 31: WAT clock — always visible so Nigerian fans know their local time */}
				<span style={{ marginLeft: "auto", flexShrink: 0 }}>
					<WATClock compact />
				</span>
			</div>

			{/* Task 24: Session progress bar (race only, when lap data available) */}
			{isRace && lapProgress !== null && (
				<div style={{
					height: 2, background: "rgba(255,255,255,0.06)",
					borderRadius: 1, overflow: "hidden",
					width: "100%", maxWidth: 320,
				}}>
					<div style={{
						height: "100%",
						width: `${lapProgress}%`,
						background: "linear-gradient(90deg,#f5a724,#00d484)",
						borderRadius: 1,
						transition: "width 1s ease",
					}} />
				</div>
			)}
		</div>
	);
}
