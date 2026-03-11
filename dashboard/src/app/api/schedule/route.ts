import { env } from "@/env";

type Session = { kind: string; start: string; end: string };
type Round  = {
	name: string; countryName: string; countryKey: string | null;
	start: string; end: string; sessions: Session[]; over: boolean;
};

/** Deduplicate rounds with the same countryName — keep the one with more sessions. */
function deduplicateRounds(rounds: Round[]): Round[] {
	const seen = new Map<string, Round>();
	for (const round of rounds) {
		const key = round.countryName.toLowerCase();
		const existing = seen.get(key);
		if (!existing || round.sessions.length > existing.sessions.length) {
			seen.set(key, round);
		}
	}
	return Array.from(seen.values()).sort(
		(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
	);
}

export async function GET() {
	try {
		// Cache the schedule for 5 minutes — it only changes when sessions
		// start/end, so there's no need to re-fetch Railway on every request.
		const res = await fetch(env.API_URL + "/api/schedule", {
			next: { revalidate: 300 },
		});

		if (!res.ok) {
			return Response.json({ error: "Failed to fetch schedule" }, { status: 500 });
		}

		const data: Round[] = await res.json();

		// Guard against iCal feed quirks — remove duplicate country entries
		// (e.g. two "Spain" rounds) keeping whichever has more sessions.
		const cleaned = deduplicateRounds(data);

		return Response.json(cleaned);
	} catch {
		return Response.json({ error: "Failed to fetch schedule" }, { status: 500 });
	}
}
