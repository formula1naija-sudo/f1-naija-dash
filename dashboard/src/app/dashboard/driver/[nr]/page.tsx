"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

import DriverTire from "@/components/driver/DriverTire";
import DriverHistoryTires from "@/components/driver/DriverHistoryTires";
import DriverLapTime from "@/components/driver/DriverLapTime";
import DriverGap from "@/components/driver/DriverGap";
import DriverDRS from "@/components/driver/DriverDRS";
import DriverMiniSectors from "@/components/driver/DriverMiniSectors";
import DriverCarMetrics from "@/components/driver/DriverCarMetrics";

const hasDRS  = (drs: number) => drs > 9;
const hasPoss = (drs: number) => drs === 8;

export default function DriverPage() {
	const { nr } = useParams<{ nr: string }>();

	// ── data ────────────────────────────────────────────────────────
	const driver          = useDataStore((s) => s.state?.DriverList?.[nr]);
	const timingDriver    = useDataStore((s) => s.state?.TimingData?.Lines?.[nr]);
	const appTimingDriver = useDataStore((s) => s.state?.TimingAppData?.Lines?.[nr]);
	const carData         = useDataStore((s) => s.carsData?.[nr]?.Channels);
	const sessionPart     = useDataStore((s) => s.state?.TimingData?.SessionPart);
	const timingStats     = useDataStore((s) => s.state?.TimingStats?.Lines?.[nr]);
	const carMetrics      = useSettingsStore((s) => s.carMetrics);

	// ── derived ─────────────────────────────────────────────────────
	const teamHex    = driver?.TeamColour ? `#${driver.TeamColour}` : "#3f3f46";
	const hasFastest = timingStats?.PersonalBestLapTime?.Position === 1;
	const drsOn      = carData ? hasDRS(carData[45])  : false;
	const drsPoss    = carData ? hasPoss(carData[45]) : false;
	const inPit      = timingDriver?.InPit  ?? false;
	const pitOut     = timingDriver?.PitOut ?? false;

	// ── not-found guard ─────────────────────────────────────────────
	if (driver === null) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3">
				<p style={{ fontSize: 18, fontWeight: 700, color: "var(--f1-text)" }}>Driver not found</p>
				<p style={{ fontSize: 13, color: "var(--f1-muted)" }}>Racing number #{nr} is not in the current driver list.</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-auto">

			{/* ── PAGE HERO ── */}
			<div style={{
				position: "relative", overflow: "hidden", flexShrink: 0,
				padding: "clamp(20px,3.5vw,36px) 16px clamp(16px,2.5vw,28px)",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}>
				{/* grid texture */}
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(var(--f1-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--f1-grid-line) 1px,transparent 1px)",
					backgroundSize: "64px 64px",
					WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
					maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
				}} />
				{/* team colour left accent */}
				<div style={{
					position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
					background: teamHex,
				}} />

				<div style={{ position: "relative", zIndex: 1, paddingLeft: 8 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
						<div style={{ width: 16, height: 1, background: teamHex, flexShrink: 0 }} />
						<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: teamHex }}>
							Driver Profile
						</span>
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						{/* Headshot */}
						{driver?.HeadshotUrl ? (
							<div style={{
								width: 56, height: 56, borderRadius: "50%",
								overflow: "hidden", flexShrink: 0,
								border: `2px solid ${teamHex}`,
								background: "rgba(255,255,255,0.04)",
							}}>
								<Image
									src={driver.HeadshotUrl}
									alt={`${driver.FirstName} ${driver.LastName}`}
									width={56} height={56}
									style={{ objectFit: "cover", width: "100%", height: "100%" }}
									unoptimized
								/>
							</div>
						) : (
							<div style={{
								width: 56, height: 56, borderRadius: "50%",
								background: `${teamHex}22`,
								border: `2px solid ${teamHex}`,
								display: "flex", alignItems: "center", justifyContent: "center",
								fontSize: 18, fontWeight: 900, color: teamHex, flexShrink: 0,
							}}>
								{nr}
							</div>
						)}

						{/* Name + team */}
						<div>
							{driver ? (
								<>
									<div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
										<span style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: 1 }}>
											{driver.FirstName}{" "}
										</span>
										<span style={{
											fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1,
											color: teamHex,
										}}>
											{driver.LastName}
										</span>
									</div>
									<p style={{ fontSize: 11, fontWeight: 600, color: "var(--f1-muted)", marginTop: 3 }}>
										{driver.TeamName} · #{nr}
									</p>
								</>
							) : (
								<>
									<div style={{ height: 36, width: 200, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
									<div style={{ height: 14, width: 120, borderRadius: 4, background: "rgba(255,255,255,0.04)", marginTop: 6, animation: "pulse 1.5s infinite" }} />
								</>
							)}
						</div>

						{/* Racing number badge */}
						<div style={{
							marginLeft: "auto",
							fontSize: "clamp(28px,5vw,48px)", fontWeight: 900,
							color: `${teamHex}33`,
							letterSpacing: "-.04em",
							lineHeight: 1,
							userSelect: "none",
						}}>
							{nr}
						</div>
					</div>
				</div>
			</div>

			{/* ── BODY ── */}
			{!timingDriver ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2">
					<div style={{ fontSize: 32 }}>📡</div>
					<p style={{ fontSize: 14, fontWeight: 700, color: "var(--f1-text)" }}>Waiting for live data…</p>
					<p style={{ fontSize: 12, color: "var(--f1-muted)" }}>Driver telemetry will appear once a session starts.</p>
				</div>
			) : (
				<div className="grid flex-1 grid-cols-1 gap-0 divide-y divide-zinc-800 overflow-auto lg:grid-cols-2 lg:divide-x lg:divide-y-0">

					{/* ── LEFT: Live stats ── */}
					<div style={{ padding: "16px" }}>

						{/* Section label */}
						<SectionLabel color="#00d484" label="Live Stats" />

						{/* Position + DRS row */}
						<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
							{/* Position bubble */}
							<div style={{
								width: 44, height: 44, borderRadius: "50%",
								border: `2px solid ${teamHex}`,
								display: "flex", alignItems: "center", justifyContent: "center",
								fontSize: 18, fontWeight: 900, color: teamHex, flexShrink: 0,
							}}>
								{timingDriver.Position || "—"}
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
								<p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
									Position
								</p>
								<DriverDRS
									on={drsOn}
									possible={drsPoss}
									inPit={inPit as boolean}
									pitOut={pitOut as boolean}
								/>
							</div>
						</div>

						{/* Lap time */}
						<StatRow label="Lap Time">
							<DriverLapTime
								last={timingDriver.LastLapTime}
								best={timingDriver.BestLapTime}
								hasFastest={hasFastest}
							/>
						</StatRow>

						{/* Gap */}
						<StatRow label="Gap">
							<DriverGap timingDriver={timingDriver} sessionPart={sessionPart} />
						</StatRow>

						{/* Sectors */}
						<StatRow label="Sectors">
							<DriverMiniSectors
								sectors={timingDriver.Sectors}
								bestSectors={timingStats?.BestSectors}
							/>
						</StatRow>

						{/* Car metrics */}
						{carMetrics && carData && (
							<StatRow label="Car Metrics">
								<DriverCarMetrics carData={carData} />
							</StatRow>
						)}
					</div>

					{/* ── RIGHT: Tyre strategy ── */}
					<div style={{ padding: "16px" }}>

						<SectionLabel color="#f5a724" label="Tyre Strategy" />

						{/* Current tyre */}
						<StatRow label="Current Tyre">
							<DriverTire stints={appTimingDriver?.Stints} />
						</StatRow>

						{/* Tyre history */}
						<div style={{ marginBottom: 12 }}>
							<p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 8 }}>
								Stint History
							</p>
							<DriverHistoryTires stints={appTimingDriver?.Stints} />
						</div>

						{/* Stint breakdown */}
						{appTimingDriver?.Stints && appTimingDriver.Stints.length > 0 && (
							<div style={{ marginTop: 8 }}>
								<p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--f1-muted)", marginBottom: 8 }}>
									Stints
								</p>
								<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
									{appTimingDriver.Stints.map((stint, i) => {
										const compound = stint.Compound?.toLowerCase() ?? "";
										const compoundColors: Record<string, string> = {
											soft: "#ef4444", medium: "#f5a724", hard: "#a1a1aa",
											intermediate: "#22c55e", wet: "#60a5fa",
										};
										const color = compoundColors[compound] ?? "#71717a";
										return (
											<div key={`stint.${i}`} style={{
												display: "flex", alignItems: "center", gap: 8,
												padding: "5px 8px", borderRadius: 6,
												background: "rgba(255,255,255,0.025)",
												border: "1px solid rgba(255,255,255,0.04)",
											}}>
												<span style={{ fontSize: 9, fontWeight: 700, color: "var(--f1-muted)" }}>
													#{i + 1}
												</span>
												<span style={{
													width: 18, height: 18, borderRadius: "50%",
													display: "inline-flex", alignItems: "center", justifyContent: "center",
													fontSize: 8, fontWeight: 900,
													background: `${color}22`,
													border: `1px solid ${color}88`,
													color,
												}}>
													{compound ? compound[0].toUpperCase() : "?"}
												</span>
												<span style={{ fontSize: 10, fontWeight: 600, color: "var(--f1-text)" }}>
													{stint.Compound ?? "Unknown"}
												</span>
												{stint.New === "TRUE" && (
													<span style={{
														fontSize: 8, fontWeight: 700, color: "#00d484",
														background: "rgba(0,212,132,0.1)",
														border: "1px solid rgba(0,212,132,0.3)",
														padding: "1px 4px", borderRadius: 3,
													}}>NEW</span>
												)}
												<span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: "var(--f1-muted)" }}>
													{stint.TotalLaps ?? 0}L
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>

				</div>
			)}
		</div>
	);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ color, label }: { color: string; label: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
			<div style={{ width: 3, height: 16, background: color, borderRadius: 2, flexShrink: 0 }} />
			<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
				{label}
			</h2>
		</div>
	);
}

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{
			display: "flex", alignItems: "center", justifyContent: "space-between",
			padding: "8px 0",
			borderBottom: "1px solid rgba(255,255,255,0.04)",
			marginBottom: 4,
		}}>
			<p style={{ fontSize: 10, fontWeight: 600, color: "var(--f1-muted)", letterSpacing: ".04em" }}>
				{label}
			</p>
			{children}
		</div>
	);
}
