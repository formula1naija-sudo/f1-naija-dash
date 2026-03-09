"use client";

import LeaderBoard from "@/components/dashboard/LeaderBoard";
import RaceControl from "@/components/dashboard/RaceControl";
import TeamRadios from "@/components/dashboard/TeamRadios";
import TrackViolations from "@/components/dashboard/TrackViolations";
import Map from "@/components/dashboard/Map";
import Footer from "@/components/Footer";

export default function Page() {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex w-full flex-col gap-2 2xl:flex-row">
				<div className="overflow-x-auto">
					<LeaderBoard />
				</div>

				<div className="flex-1 2xl:max-h-[50rem]">
					<Map />
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
	);
}
