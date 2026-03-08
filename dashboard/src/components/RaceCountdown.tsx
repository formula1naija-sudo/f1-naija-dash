"use client";

import { useState, useEffect } from "react";

type Session = {
	kind: string;
	start: string;
	end: string;
};

type Round = {
	name: string;
	countryName: string;
	start: string;
	end: string;
	sessions: Session[];
	over: boolean;
};

function formatWAT(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		return date.toLocaleString("en-NG", {
			timeZone: "Africa/Lagos",
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return dateStr;
	}
}

function getSessionLabel(kind: string): string {
	const labels: { [key: string]: string } = {
		"Practice 1": "FP1",
		"Practice 2": "FP2",
		"Practice 3": "FP3",
		"Sprint Qualifying": "SQ",
		"Sprint": "SPRINT",
		"Qualifying": "QUALI",
		"Race": "RACE",
	};
	return labels[kind] || kind;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
	return (
		<div className="flex flex-col items-center">
			<div className="min-w-[60px] rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center font-mono text-3xl font-extrabold text-white sm:min-w-[68px] sm:text-4xl">
				{String(value).padStart(2, "0")}
			</div>
			<span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
				{label}
			</span>
		</div>
	);
}

export default function RaceCountdown() {
	const [nextRace, setNextRace] = useState<Round | null>(null);
	const [roundIndex, setRoundIndex] = useState<number>(0);
	const [totalRounds, setTotalRounds] = useState<number>(0);
	const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const fetchSchedule = async () => {
			try {
				const res = await fetch("/api/schedule");
				if (!res.ok) throw new Error("Failed to fetch");
				const schedule: Round[] = await res.json();
				setTotalRounds(schedule.length);
				const next = schedule.find((round) => !round.over);
				if (next) {
					const idx = schedule.indexOf(next) + 1;
					setNextRace(next);
					setRoundIndex(idx);
				}
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		};
		fetchSchedule();
	}, []);

	useEffect(() => {
		if (!nextRace) return;
		const raceSession = nextRace.sessions.find(
			(s) => s.kind === "Race" || s.kind === "Sprint"
		);
		const targetSession = raceSession || nextRace.sessions[0];
		if (!targetSession) return;
		const targetDate = new Date(targetSession.start).getTime();
		const update = () => {
			const diff = targetDate - Date.now();
			if (diff <= 0) {
				setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
				return;
			}
			setTimeLeft({
				days: Math.floor(diff / (1000 * 60 * 60 * 24)),
				hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
				mins: Math.floor((diff / (1000 * 60)) % 60),
				secs: Math.floor((diff / 1000) % 60),
			});
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [nextRace]);

	if (loading) {
		return (
			<div className="mx-auto mb-10 w-full max-w-lg animate-pulse rounded-2xl border border-zinc-800 p-8">
				<div className="mb-4 h-4 w-32 rounded bg-zinc-800" />
				<div className="mb-6 h-6 w-64 rounded bg-zinc-800" />
				<div className="flex justify-center gap-3">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-16 w-16 rounded-xl bg-zinc-800" />
					))}
				</div>
			</div>
		);
	}

	if (error || !nextRace) {
		return null;
	}

	return (
		<div className="mx-auto mb-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-gradient-to-b from-white/[0.02] to-transparent p-6 sm:p-8">
			<div className="mb-6">
				<p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
					Next Race — Round {roundIndex}/{totalRounds}
				</p>
				<h3 className="text-xl font-bold text-white sm:text-2xl">
					{nextRace.name}
				</h3>
				<p className="mt-1 text-sm text-zinc-500">
					{nextRace.countryName}
				</p>
			</div>
			<div className="mb-7 flex justify-center gap-2 sm:gap-3">
				<CountdownUnit value={timeLeft.days} label="Days" />
				<span className="self-start pt-3 text-2xl font-light text-zinc-700">:</span>
				<CountdownUnit value={timeLeft.hours} label="Hours" />
				<span className="self-start pt-3 text-2xl font-light text-zinc-700">:</span>
				<CountdownUnit value={timeLeft.mins} label="Mins" />
				<span className="self-start pt-3 text-2xl font-light text-zinc-700">:</span>
				<CountdownUnit value={timeLeft.secs} label="Secs" />
			</div>
			<div>
				<p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
					Session times (WAT 🇳🇬)
				</p>
				<div className="flex flex-col gap-1.5">
					{nextRace.sessions.map((session, i) => {
						const isRace = session.kind === "Race" || session.kind === "Sprint";
						return (
							<div
								key={i}
								className={"flex items-center justify-between rounded-lg px-3.5 py-2 text-sm " + (isRace ? "border border-emerald-700/30 bg-emerald-900/15" : "border border-white/5 bg-white/[0.03]")}
							>
								<div className="flex items-center gap-3">
									<span className={"min-w-[52px] text-xs font-bold " + (isRace ? "text-emerald-400" : "text-zinc-200")}>
										{getSessionLabel(session.kind)}
									</span>
								</div>
								<span className={"font-mono text-xs " + (isRace ? "text-emerald-400" : "text-zinc-400")}>
									{formatWAT(session.start)}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
