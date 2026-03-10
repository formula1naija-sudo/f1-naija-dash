import { env } from "@/env";

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

		const data = await res.json();
		return Response.json(data);
	} catch {
		return Response.json({ error: "Failed to fetch schedule" }, { status: 500 });
	}
}
