"use client";

import { useMemo } from "react";
import { useDataStore } from "@/stores/useDataStore";

import NumberDiff from "@/components/NumberDiff";
import WATClock from "@/components/WATClock";
import Image from "next/image";

export default function Standings() {
	const driverStandings = useDataStore((state) => state.state?.ChampionshipPrediction?.Drivers);
	const teamStandings = useDataStore((state) => state.state?.ChampionshipPrediction?.Teams);
	const drivers = useDataStore((state) => state.state?.DriverList);
	const isRace = useDataStore((state) => state.state?.SessionInfo?.Type === "Race");

	// Build team-name → TeamColour map from the live DriverList
	const teamColorMap = useMemo<Record<string, string>>(() => {
		if (!drivers) return {};
		const map: Record<string, string> = {};
		Object.values(drivers).forEach(d => {
			if (d.TeamName && d.TeamColour) map[d.TeamName] = d.TeamColour;
		});
		return map;
	}, [drivers]);

	return (
		<div className="flex h-full flex-col">
			{/* ── PAGE HERO ── */}
			<div style={{
				position: "relative", overflow: "hidden", flexShrink: 0,
				padding: "clamp(24px,4vw,40px) 16px clamp(20px,3vw,32px)",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}>
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(var(--f1-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--f1-grid-line) 1px,transparent 1px)",
					backgroundSize: "64px 64px",
					WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
					maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
				}} />
				<div style={{ position: "relative", zIndex: 1 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
						<div style={{ width: 16, height: 1, background: "#f5a724", flexShrink: 0 }} />
						<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#f5a724" }}>
							Live Prediction
						</span>
					</div>
					<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
						<div style={{ lineHeight: 0.92 }}>
							<span style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)" }}>Race </span>
							<span style={{
								fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em",
								background: "linear-gradient(120deg,#f5a724 0%,#ffd580 50%,#00d484 100%)",
								WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
							}}>Standings.</span>
						</div>
						<WATClock showDate />
					</div>
				</div>
			</div>

			{/* ── CONTENT ── */}
			{!isRace ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-1">
					<p className="font-semibold" style={{ color: "var(--f1-text)" }}>Championship standings unavailable</p>
					<p className="text-sm" style={{ color: "var(--f1-muted)" }}>Only available during a live race session</p>
				</div>
			) : (
				<div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-zinc-800 overflow-auto lg:grid-cols-2 lg:divide-x lg:divide-y-0">

					{/* ── Driver Championship ── */}
					<div className="p-4">
						<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
							<div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2, flexShrink: 0 }} />
							<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
								Driver Championship
							</h2>
						</div>

						<div className="divide flex flex-col divide-y divide-zinc-800">
							{!driverStandings &&
								new Array(20).fill("").map((_, index) => <SkeletonItem key={`driver.loading.${index}`} />)}

							{driverStandings && drivers &&
								Object.values(driverStandings)
									.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
									.map((driver) => {
										const driverDetails = drivers[driver.RacingNumber];
										if (!driverDetails) return null;
										const teamHex = driverDetails.TeamColour ? `#${driverDetails.TeamColour}` : "#3f3f46";

										return (
											<div
												key={driver.RacingNumber}
												style={{
													position: "relative",
													display: "grid",
													gridTemplateColumns: "2rem 2rem auto 4rem 4rem",
													padding: "8px 8px 8px 20px",
													alignItems: "center",
													borderBottom: "1px solid rgba(255,255,255,0.04)",
												}}
											>
												{/* Team colour left accent */}
												<div style={{
													position: "absolute", left: 0, top: 0, bottom: 0,
													width: 3, borderRadius: "12px 0 0 12px",
													background: teamHex,
												}} />
												<NumberDiff old={driver.CurrentPosition} current={driver.PredictedPosition} />
												<p>{driver.PredictedPosition}</p>
												<p style={{ display: "flex", alignItems: "center", gap: 6 }}>
													<span style={{
														display: "inline-block", width: 8, height: 8, borderRadius: "50%",
														background: teamHex, flexShrink: 0,
													}} />
													{driverDetails.FirstName} {driverDetails.LastName}
												</p>
												<p style={{ fontVariantNumeric: "tabular-nums" }}>{driver.PredictedPoints}</p>
												<NumberDiff old={driver.PredictedPoints} current={driver.CurrentPoints} />
											</div>
										);
									})}
						</div>
					</div>

					{/* ── Constructor Championship ── */}
					<div className="p-4">
						<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
							<div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2, flexShrink: 0 }} />
							<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
								Constructor Championship
							</h2>
						</div>

						<div className="divide flex flex-col divide-y divide-zinc-800">
							{!teamStandings && new Array(10).fill("").map((_, index) => <SkeletonItem key={`team.loading.${index}`} />)}

							{teamStandings &&
								Object.values(teamStandings)
									.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
									.map((team) => {
										const teamHex = teamColorMap[team.TeamName] ? `#${teamColorMap[team.TeamName]}` : "#3f3f46";
										return (
											<div
												key={team.TeamName}
												style={{
													position: "relative",
													display: "grid",
													gridTemplateColumns: "2rem 2rem 2rem auto 4rem 4rem",
													padding: "8px 8px 8px 20px",
													alignItems: "center",
													borderBottom: "1px solid rgba(255,255,255,0.04)",
												}}
											>
												{/* Team colour left accent */}
												<div style={{
													position: "absolute", left: 0, top: 0, bottom: 0,
													width: 3, borderRadius: "12px 0 0 12px",
													background: teamHex,
												}} />
												<NumberDiff old={team.CurrentPosition} current={team.PredictedPosition} />
												<p>{team.PredictedPosition}</p>
												<Image
													src={`/team-logos/${team.TeamName.replaceAll(" ", "-").toLowerCase()}.${"svg"}`}
													alt={team.TeamName}
													width={24}
													height={24}
													className="overflow-hidden rounded-lg"
												/>
												<p>{team.TeamName}</p>
												<p style={{ fontVariantNumeric: "tabular-nums" }}>{team.PredictedPoints}</p>
												<NumberDiff old={team.PredictedPoints} current={team.CurrentPoints} />
											</div>
										);
									})}
						</div>
					</div>

				</div>
			)}

			</div>
	);
}

const SkeletonItem = () => {
	return (
		<div
			className="grid gap-2 p-2"
			style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem 4rem" }}
		>
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-16 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-8 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-8 animate-pulse rounded-md bg-zinc-800" />
		</div>
	);
};
