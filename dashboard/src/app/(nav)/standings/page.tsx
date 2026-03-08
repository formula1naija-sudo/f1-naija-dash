"use client";

import { useState, useEffect } from "react";

type DriverStanding = {
	position: string;
	points: string;
	wins: string;
	Driver: {
		driverId: string;
		givenName: string;
		familyName: string;
		code: string;
		nationality: string;
	};
	Constructors: {
		constructorId: string;
		name: string;
		nationality: string;
	}[];
};

type ConstructorStanding = {
	position: string;
	points: string;
	wins: string;
	Constructor: {
		constructorId: string;
		name: string;
		nationality: string;
	};
};

type RetiredDriver = {
	name: string;
	nationality: string;
	seasons: string;
	championships: number;
	wins: number;
	note?: string;
};

type RetiredTeam = {
	name: string;
	country: string;
	activePeriod: string;
	championships: number;
	note?: string;
};

const RETIRED_DRIVERS: RetiredDriver[] = [
	{ name: "Sebastian Vettel",    nationality: "🇩🇪", seasons: "2007–2022", championships: 4, wins: 53, note: "4× World Champion (2010–2013)" },
	{ name: "Kimi Räikkönen",      nationality: "🇫🇮", seasons: "2001–2021", championships: 1, wins: 21, note: "2007 World Champion" },
	{ name: "Daniel Ricciardo",    nationality: "🇦🇺", seasons: "2011–2024", championships: 0, wins: 8,  note: "8 race victories" },
	{ name: "Valtteri Bottas",     nationality: "🇫🇮", seasons: "2013–2024", championships: 0, wins: 10, note: "10 race victories" },
	{ name: "Mick Schumacher",     nationality: "🇩🇪", seasons: "2021–2022", championships: 0, wins: 0  },
	{ name: "Antonio Giovinazzi",  nationality: "🇮🇹", seasons: "2019–2021", championships: 0, wins: 0  },
	{ name: "Nikita Mazepin",      nationality: "🇷🇺", seasons: "2021",      championships: 0, wins: 0  },
	{ name: "Nicholas Latifi",     nationality: "🇨🇦", seasons: "2020–2022", championships: 0, wins: 0  },
	{ name: "Robert Kubica",       nationality: "🇵🇱", seasons: "2006–2021", championships: 0, wins: 1, note: "Comeback driver after 2011 injury" },
	{ name: "Romain Grosjean",     nationality: "🇫🇷", seasons: "2009–2020", championships: 0, wins: 0  },
	{ name: "Kevin Magnussen",     nationality: "🇩🇰", seasons: "2014–2023", championships: 0, wins: 0  },
];

const RETIRED_TEAMS: RetiredTeam[] = [
	{ name: "Lotus F1 Team",     country: "🇬🇧", activePeriod: "2010–2015", championships: 0, note: "Became Renault in 2016" },
	{ name: "Force India",       country: "🇮🇳", activePeriod: "2008–2018", championships: 0, note: "Became Racing Point in 2018" },
	{ name: "Racing Point",      country: "🇬🇧", activePeriod: "2019–2020", championships: 0, note: "Became Aston Martin in 2021" },
	{ name: "Toro Rosso",        country: "🇮🇹", activePeriod: "2006–2019", championships: 0, note: "Became AlphaTauri in 2020" },
	{ name: "AlphaTauri",        country: "🇮🇹", activePeriod: "2020–2023", championships: 0, note: "Became RB / Racing Bulls in 2024" },
	{ name: "Renault F1 Team",   country: "🇫🇷", activePeriod: "2016–2020", championships: 0, note: "Became Alpine in 2021" },
	{ name: "Alfa Romeo Racing", country: "🇨🇭", activePeriod: "2019–2023", championships: 0, note: "Became Kick Sauber in 2024" },
	{ name: "Manor / MRT",       country: "🇬🇧", activePeriod: "2010–2016", championships: 0, note: "Folded after 2016 season" },
	{ name: "HRT",               country: "🇪🇸", activePeriod: "2010–2012", championships: 0, note: "Folded after 2012 season" },
	{ name: "Caterham",          country: "🇬🇧", activePeriod: "2010–2014", championships: 0, note: "Folded during 2014 season" },
];

const teamColors: { [key: string]: string } = {
	red_bull:      "#3671C6",
	mclaren:       "#FF8700",
	ferrari:       "#E8002D",
	mercedes:      "#27F4D2",
	aston_martin:  "#229971",
	alpine:        "#0093CC",
	rb:            "#6692FF",
	racing_bulls:  "#6692FF",
	haas:          "#B6BABD",
	williams:      "#64C4FF",
	sauber:        "#52E252",
	kick_sauber:   "#52E252",
	cadillac:      "#C8102E",
};

function getTeamColor(constructorId: string): string {
	return teamColors[constructorId] || "#666666";
}

export default function StandingsPage() {
	const [drivers, setDrivers] = useState<DriverStanding[]>([]);
	const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"drivers" | "constructors" | "retired">("drivers");
	const [season, setSeason] = useState<string>("");
	const [round, setRound] = useState<string>("");

	useEffect(() => {
		const fetchStandings = async () => {
			try {
				const [driverRes, constructorRes] = await Promise.all([
					fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json"),
					fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json"),
				]);

				if (driverRes.ok) {
					const driverData = await driverRes.json();
					const standingsList = driverData?.MRData?.StandingsTable?.StandingsLists?.[0];
					if (standingsList) {
						setDrivers(standingsList.DriverStandings || []);
						setSeason(standingsList.season || "");
						setRound(standingsList.round || "");
					}
				}

				if (constructorRes.ok) {
					const constructorData = await constructorRes.json();
					const standingsList = constructorData?.MRData?.StandingsTable?.StandingsLists?.[0];
					if (standingsList) {
						setConstructors(standingsList.ConstructorStandings || []);
					}
				}
			} catch {
				// Silently fail
			} finally {
				setLoading(false);
			}
		};

		fetchStandings();
	}, []);

	if (loading) {
		return (
			<div className="mx-auto max-w-2xl py-10">
				<div className="mb-6 h-8 w-64 animate-pulse rounded bg-zinc-800" />
				<div className="flex flex-col gap-2">
					{Array.from({ length: 10 }).map((_, i) => (
						<div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-800" />
					))}
				</div>
			</div>
		);
	}

	if (drivers.length === 0 && constructors.length === 0 && activeTab !== "retired") {
		return (
			<div className="flex h-64 flex-col items-center justify-center">
				<p className="text-lg">Championship standings unavailable</p>
				<p className="text-sm text-zinc-500">Check back once the season is underway</p>
			</div>
		);
	}

	const maxDriverPoints = parseFloat(drivers[0]?.points || "1");
	const maxConstructorPoints = parseFloat(constructors[0]?.points || "1");

	return (
		<div className="mx-auto max-w-2xl py-10">
			{/* Header */}
			<div className="mb-8">
				<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-500">
					{season ? `${season} Season${round ? ` — After Round ${round}` : ""}` : "Championship"}
				</p>
				<h1 className="text-3xl font-bold">Championship Standings</h1>
				<p className="mt-2 text-sm text-zinc-500">
					Auto-updated after every race
				</p>
			</div>

			{/* Tabs */}
			<div className="mb-6 flex gap-2 flex-wrap">
				<button
					onClick={() => setActiveTab("drivers")}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
						activeTab === "drivers"
							? "bg-emerald-600 text-white"
							: "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
					}`}
				>
					Drivers
				</button>
				<button
					onClick={() => setActiveTab("constructors")}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
						activeTab === "constructors"
							? "bg-emerald-600 text-white"
							: "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
					}`}
				>
					Constructors
				</button>
				<button
					onClick={() => setActiveTab("retired")}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
						activeTab === "retired"
							? "bg-zinc-600 text-white"
							: "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
					}`}
				>
					Retired
				</button>
			</div>

			{/* Driver Standings */}
			{activeTab === "drivers" && (
				<div>
					<div className="mb-2 grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:grid-cols-[2.5rem_3px_1fr_8rem_4rem_3.5rem]">
						<span>Pos</span>
						<span />
						<span>Driver</span>
						<span className="hidden sm:block">Team</span>
						<span className="text-right">Pts</span>
						<span className="text-right">Wins</span>
					</div>

					<div className="flex flex-col gap-1.5">
						{drivers.map((d) => {
							const teamId = d.Constructors?.[0]?.constructorId || "";
							const teamName = d.Constructors?.[0]?.name || "";
							const teamColor = getTeamColor(teamId);
							const barWidth = (parseFloat(d.points) / maxDriverPoints) * 100;
							const isTopThree = parseInt(d.position) <= 3;

							return (
								<div
									key={d.Driver.driverId}
									className={`relative grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 overflow-hidden rounded-lg px-3 py-3 sm:grid-cols-[2.5rem_3px_1fr_8rem_4rem_3.5rem] ${
										isTopThree
											? "border border-emerald-900/30 bg-emerald-950/10"
											: "border border-white/5 bg-white/[0.025]"
									}`}
								>
									<div
										className="absolute top-0 left-0 h-full opacity-[0.07]"
										style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
									/>
									<span className={`relative z-10 text-center text-sm font-bold ${
										isTopThree ? "text-emerald-400" : "text-zinc-500"
									}`}>
										{d.position}
									</span>
									<div
										className="relative z-10 h-6 w-[3px] rounded-full"
										style={{ backgroundColor: teamColor }}
									/>
									<div className="relative z-10 min-w-0">
										<span className="text-sm text-zinc-400">{d.Driver.givenName} </span>
										<span className="text-sm font-bold text-white">{d.Driver.familyName}</span>
									</div>
									<span className="relative z-10 hidden truncate text-xs text-zinc-500 sm:block">
										{teamName}
									</span>
									<span className="relative z-10 text-right font-mono text-sm font-bold text-white">
										{d.points}
									</span>
									<span className="relative z-10 text-right font-mono text-sm text-zinc-400">
										{d.wins}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Constructor Standings */}
			{activeTab === "constructors" && (
				<div>
					<div className="mb-2 grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
						<span>Pos</span>
						<span />
						<span>Constructor</span>
						<span className="text-right">Pts</span>
						<span className="text-right">Wins</span>
					</div>

					<div className="flex flex-col gap-1.5">
						{constructors.map((c) => {
							const teamColor = getTeamColor(c.Constructor.constructorId);
							const barWidth = (parseFloat(c.points) / maxConstructorPoints) * 100;
							const isTopThree = parseInt(c.position) <= 3;

							return (
								<div
									key={c.Constructor.constructorId}
									className={`relative grid grid-cols-[2.5rem_3px_1fr_4rem_3.5rem] items-center gap-3 overflow-hidden rounded-lg px-3 py-3 ${
										isTopThree
											? "border border-emerald-900/30 bg-emerald-950/10"
											: "border border-white/5 bg-white/[0.025]"
									}`}
								>
									<div
										className="absolute top-0 left-0 h-full opacity-[0.07]"
										style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
									/>
									<span className={`relative z-10 text-center text-sm font-bold ${
										isTopThree ? "text-emerald-400" : "text-zinc-500"
									}`}>
										{c.position}
									</span>
									<div
										className="relative z-10 h-6 w-[3px] rounded-full"
										style={{ backgroundColor: teamColor }}
									/>
									<span className="relative z-10 text-sm font-bold text-white">
										{c.Constructor.name}
									</span>
									<span className="relative z-10 text-right font-mono text-sm font-bold text-white">
										{c.points}
									</span>
									<span className="relative z-10 text-right font-mono text-sm text-zinc-400">
										{c.wins}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Retired Tab */}
			{activeTab === "retired" && (
				<div className="space-y-8">
					{/* Retired Drivers */}
					<div>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
							Retired Drivers
						</h2>
						<div className="flex flex-col gap-1.5">
							{RETIRED_DRIVERS.map((d) => (
								<div
									key={d.name}
									className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-3"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="text-base">{d.nationality}</span>
											<span className="text-sm font-bold text-white">{d.name}</span>
											{d.championships > 0 && (
												<span className="rounded-full bg-yellow-900/60 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
													{d.championships}× WDC
												</span>
											)}
										</div>
										{d.note && (
											<p className="mt-0.5 text-xs text-zinc-600">{d.note}</p>
										)}
									</div>
									<div className="text-right flex-shrink-0">
										<p className="text-xs text-zinc-600">{d.seasons}</p>
										<p className="text-xs text-zinc-500">{d.wins} {d.wins === 1 ? 'win' : 'wins'}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Retired / Rebranded Teams */}
					<div>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
							Retired &amp; Rebranded Teams
						</h2>
						<div className="flex flex-col gap-1.5">
							{RETIRED_TEAMS.map((t) => (
								<div
									key={t.name}
									className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-3"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="text-base">{t.country}</span>
											<span className="text-sm font-bold text-white">{t.name}</span>
										</div>
										{t.note && (
											<p className="mt-0.5 text-xs text-zinc-600">{t.note}</p>
										)}
									</div>
									<p className="flex-shrink-0 text-xs text-zinc-600">{t.activePeriod}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
