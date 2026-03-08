import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Module-level cache for the resolved user ID (survives across requests in same serverless instance)
let cachedUserId: string | null = (() => {
  const env = process.env.TWITTER_USER_ID;
  return env && env !== "REPLACE_WITH_USER_ID" ? env : null;
})();

async function resolveUserId(token: string): Promise<string | null> {
  if (cachedUserId) return cachedUserId;

  try {
    const res = await fetch("https://api.twitter.com/2/users/by/username/f1_naija", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error("User lookup failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    cachedUserId = data.data?.id ?? null;
    console.log("Resolved @f1_naija user ID:", cachedUserId);
    return cachedUserId;
  } catch (err) {
    console.error("User ID lookup error:", err);
    return null;
  }
}

export async function GET() {
  if (!BEARER_TOKEN) {
    return NextResponse.json({ tweets: [], error: "Twitter bearer token not configured" });
  }

  try {
    const userId = await resolveUserId(BEARER_TOKEN);
    if (!userId) {
      return NextResponse.json({ tweets: [], error: "Could not resolve @f1_naija user ID" });
    }

    const url = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
    url.searchParams.set("max_results", "20");
    url.searchParams.set("tweet.fields", "created_at,text");
    url.searchParams.set("exclude", "retweets,replies");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Twitter API error:", res.status, errorText);
      return NextResponse.json({ tweets: [], error: `Twitter API error: ${res.status}` });
    }

    const data = await res.json();
    const tweets: { id: string; text: string; created_at: string }[] = data.data ?? [];

    return NextResponse.json({ tweets });
  } catch (err) {
    console.error("Tweets route error:", err);
    return NextResponse.json({ tweets: [], error: "Internal server error" });
  }
}
