"use client";

import LeaderBoard from "@/components/dashboard/LeaderBoard";
import RaceControl from "@/components/dashboard/RaceControl";
import TeamRadios from "@/components/dashboard/TeamRadios";
import TrackViolations from "@/components/dashboard/TrackViolations";
import Map from "@/components/dashboard/Map";
import Footer from "@/components/Footer";
import { useDataStore } from "@/stores/useDataStore";

function MapFrame() {
	const circuitName = useDataStore((state) => state.state?.SessionInfo?.Meeting?.Circuit?.ShortName ?? "Circuit");
	const lapCount = useDataStore((state) => state.state?.LapCount);

	const lapProgress = lapCount?.TotalLaps
		? Math.min((lapCount.CurrentLap / lapCount.TotalLaps) * 100, 100)
		: 0;

	return (
		<div style={{
			border: "1px solid var(--f1-border)",
			borderRadius: 12,
			background: "#0a0a0a",
			position: "relative",
			overflow: "hidden",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			flex: 1,
		}}>
			{/* Circuit name label */}
			<span style={{
				position: "absolute", top: 14, left: 14,
				fontSize: 10, fontWeight: 600,
				color: "#3f3f46", letterSpacing: ".06em", textTransform: "uppercase",
				zIndex: 10,
			}}>
				{circuitName}
			</span>

			{/* LIVE TRACKING badge */}
			<span style={{
				position: "absolute", top: 14, right: 14,
				display: "flex", alignItems: "center", gap: 5,
				fontSize: 10, fontWeight: 600,
				color: "#00d484",
				background: "rgba(0,212,132,0.1)",
				border: "1px solid rgba(0,212,132,0.25)",
				padding: "4px 10px", borderRadius: 6,
				zIndex: 10,
			}}>
				<span style={{
					width: 5, height: 5, borderRadius: "50%",
					background: "#00d484",
					boxShadow: "0 0 5px #00d484",
					display: "inline-block",
				}} />
				LIVE TRACKING
			</span>

			<div className="h-full w-full">
				<Map />
			</div>

			{lapCount && (
				<>
					<span style={{
						position: "absolute", bottom: 22, left: 14,
						fontSize: 9, color: "#52525b",
						letterSpacing: ".08em", textTransform: "uppercase",
						zIndex: 10,
					}}>
						Lap Progress
					</span>
					<span style={{
						position: "absolute", bottom: 22, right: 14,
						fontSize: 10, fontWeight: 700, color: "#f5a724",
						zIndex: 10,
					}}>
						Lap {lapCount.CurrentLap} / {lapCount.TotalLaps}
					</span>
					<div style={{
						position: "absolute", bottom: 14, left: 14, right: 14,
						height: 3,
						background: "rgba(255,255,255,0.04)",
						borderRadius: 99,
						overflow: "hidden",
						zIndex: 10,
					}}>
						<div style={{
							height: "100%",
							width: `${lapProgress}%`,
							background: "linear-gradient(90deg,#00d484,rgba(0,212,132,0.3))",
							borderRadius: 99,
							transition: "width 1s linear",
						}} />
					</div>
				</>
			)}
		</div>
	);
}

export default function Page() {
	return (
		<div className="flex w-full flex-col">
			{/* ── PAGE HERO ── */}
			<div style={{
				position: "relative", overflow: "hidden",
				padding: "clamp(32px,5vw,56px) 16px clamp(24px,4vw,40px)",
				borderBottom: "1px solid var(--f1-border-soft)",
				marginBottom: 12,
			}}>
				{/* Grid pattern */}
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(var(--f1-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--f1-grid-line) 1px,transparent 1px)",
					backgroundSize: "64px 64px",
					WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
					maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
				}} />
				{/* Green ambient glow */}
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					background: "radial-gradient(ellipse 60% 50% at 20% 40%,rgba(0,212,132,.04) 0%,transparent 60%)",
				}} />
				<div style={{ position: "relative", zIndex: 1 }}>
					{/* Eyebrow */}
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
						<div style={{ width: 16, height: 1, background: "#00d484", flexShrink: 0 }} />
						<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
							Live Session
						</span>
					</div>
					{/* Title */}
					<div style={{ lineHeight: 0.9 }}>
						<div style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)", lineHeight: 0.92 }}>
							Live
						</div>
						<div style={{
							fontSize: "clamp(36px,6vw,72px)", fontWeight: 900,
							letterSpacing: "-.04em", lineHeight: 0.92,
							background: "linear-gradient(120deg,#00d484 0%,#7affd4 50%,#00d484 100%)",
							WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
						}}>
							Timing.
						</div>
					</div>
					<p style={{ marginTop: 12, fontSize: 12, color: "var(--f1-muted)" }}>
						Real-time race data — positions, gaps &amp; telemetry.
					</p>
				</div>
			</div>

			<div className="flex w-full flex-col gap-2 px-2 pb-2">
				<div className="flex w-full flex-col gap-2 2xl:flex-row">
					{/* overflow-x-auto + no-scrollbar: horizontal scroll on small screens */}
					<div className="no-scrollbar overflow-x-auto">
						<div style={{ minWidth: "min(100%,760px)" }}>
							<LeaderBoard />
						</div>
					</div>

					<div className="flex flex-1 2xl:max-h-[50rem]">
						<MapFrame />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-2 md:divide-y-0 lg:grid-cols-3">
					{/* Race Control */}
					<div className="flex h-[30rem] flex-col overflow-hidden rounded-lg border border-zinc-800/60">
						<div className="flex shrink-0 items-center gap-2 border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">📻 Race Control</span>
						</div>
						<div className="no-scrollbar flex-1 overflow-y-auto p-2">
							<RaceControl />
						</div>
					</div>

					{/* Team Radios */}
					<div className="flex h-[30rem] flex-col overflow-hidden rounded-lg border border-zinc-800/60">
						<div className="flex shrink-0 items-center gap-2 border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">🎙️ Team Radios</span>
						</div>
						<div className="no-scrollbar flex-1 overflow-y-auto p-2">
							<TeamRadios />
						</div>
					</div>

					{/* Track Violations */}
					<div className="flex h-[30rem] flex-col overflow-hidden rounded-lg border border-zinc-800/60">
						<div className="flex shrink-0 items-center gap-2 border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">⚠️ Track Violations</span>
						</div>
						<div className="no-scrollbar flex-1 overflow-y-auto p-2">
							<TrackViolations />
						</div>
					</div>
				</div>

				<Footer />
			</div>
		</div>
	);
}
