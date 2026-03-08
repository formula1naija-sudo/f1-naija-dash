import { env } from "@/env";

export async function GET() {
	try {
		const res = await fetch(env.API_URL + "/api/schedule", {
			cache: "no-store",
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
