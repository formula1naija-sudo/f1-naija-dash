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

/**
 * Normalise session labels so they're consistently formatted:
 *   "Practice1" → "Practice 1"  (add space before trailing digit)
 *   "SprintQualifying" → "Sprint Qualifying"
 *   "SprintShootout"   → "Sprint Qualifying"  (legacy alias)
 */
function normaliseSessionKind(kind: string): string {
	// Add space between word and trailing digit: "Practice1" → "Practice 1"
	let k = kind.replace(/([A-Za-z])(\d)$/, "$1 $2");
	// Normalise sprint-qualifying variants
	if (k.toLowerCase() === "sprintqualifying" || k.toLowerCase() === "sprint qualifying") k = "Sprint Qualifying";
	if (k.toLowerCase() === "sprintshootout")   k = "Sprint Qualifying";
	return k;
}

/**
 * Apply known manual overrides to patch upstream iCal quirks:
 *   - Spain 2026: iCal feed only emits the Qualifying entry (June 13-13).
 *     Inject the full weekend so users see the complete schedule.
 */
function patchSchedule(rounds: Round[]): Round[] {
	return rounds.map(round => {
		// Patch Spain 2026 if the entry is suspiciously thin
		if (
			round.countryName === "Spain" &&
			round.sessions.length <= 2 &&
			round.start.startsWith("2026-06")
		) {
			const sessions: Session[] = [
				{ kind: "Practice 1",  start: "2026-06-12T11:30:00Z", end: "2026-06-12T12:30:00Z" },
				{ kind: "Practice 2",  start: "2026-06-12T15:00:00Z", end: "2026-06-12T16:00:00Z" },
				{ kind: "Practice 3",  start: "2026-06-13T10:30:00Z", end: "2026-06-13T11:30:00Z" },
				{ kind: "Qualifying",  start: "2026-06-13T14:00:00Z", end: "2026-06-13T15:00:00Z" },
				{ kind: "Race",        start: "2026-06-14T13:00:00Z", end: "2026-06-14T15:00:00Z" },
			];
			return {
				...round,
				start: "2026-06-12T11:30:00Z",
				end:   "2026-06-14T15:00:00Z",
				sessions,
			};
		}
		return round;
	});
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

		const raw: Round[] = await res.json();

		// 1. Normalise session kind labels (e.g. "Practice1" → "Practice 1")
		const normalised = raw.map(round => ({
			...round,
			sessions: round.sessions.map(s => ({ ...s, kind: normaliseSessionKind(s.kind) })),
		}));

		// 2. Guard against iCal feed quirks — remove duplicate country entries
		//    (e.g. two "Spain" rounds) keeping whichever has more sessions.
		const deduped = deduplicateRounds(normalised);

		// 3. Apply manual patches for known upstream data gaps
		const patched = patchSchedule(deduped);

		return Response.json(patched);
	} catch {
		return Response.json({ error: "Failed to fetch schedule" }, { status: 500 });
	}
}
