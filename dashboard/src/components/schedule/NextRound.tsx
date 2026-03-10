import { connection } from "next/server";
import { utc } from "moment";

import Countdown from "@/components/schedule/Countdown";
import Round from "@/components/schedule/Round";

import { env } from "@/env";
import type { Round as RoundType } from "@/types/schedule.type";

export const getNext = async () => {
	await connection();

	try {
		const nextReq = await fetch(`${env.API_URL}/api/schedule/next`, {
			cache: "no-store",
		});
		const next: RoundType = await nextReq.json();

		return next;
	} catch (e) {
		console.error("error fetching next round", e);
		return null;
	}
};

export default async function NextRound() {
	const next = await getNext();

	if (!next) {
		return (
			<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 176 }}>
				<p style={{ color: "var(--f1-muted)", fontSize: 13 }}>No upcoming weekend found</p>
			</div>
		);
	}

	const nextSession = next.sessions.filter((s) => utc(s.start) > utc() && s.kind.toLowerCase() !== "race")[0];
	const nextRace = next.sessions.find((s) => s.kind.toLowerCase() == "race");

	return (
		<div style={{
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
			gap: 12,
		}}>
			{nextSession || nextRace ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{nextSession && <Countdown next={nextSession} type="other" />}
					{nextRace    && <Countdown next={nextRace}    type="race"  />}
				</div>
			) : (
				<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
					<p style={{ color: "var(--f1-muted)", fontSize: 13 }}>No upcoming sessions found</p>
				</div>
			)}

			<Round round={next} nextName={next.name} />
		</div>
	);
}
