import { NextResponse } from "next/server";

// Cache Twitter results for 60 s — force-dynamic would override the
// per-fetch revalidate:60 and hit the API on every single request.
export const revalidate = 60;

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Try Twitter API v2 search/recent — works on free tier for from: queries
async function fetchFromTwitterSearch(): Promise<Array<{ id: string; text: string; created_at: string }> | null> {
  if (!BEARER_TOKEN) return null;
  try {
    const url = new URL("https://api.twitter.com/2/tweets/search/recent");
    url.searchParams.set("query", "from:f1_naija -is:retweet -is:reply");
    url.searchParams.set("max_results", "10");
    url.searchParams.set("tweet.fields", "created_at,text");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Twitter search error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    return (data.data as Array<{ id: string; text: string; created_at: string }>) ?? null;
  } catch (err) {
    console.error("Twitter search fetch error:", err);
    return null;
  }
}

export async function GET() {
  const tweets = await fetchFromTwitterSearch();

  if (tweets && tweets.length > 0) {
    return NextResponse.json({ tweets });
  }

  return NextResponse.json({ tweets: [], error: "Tweet API unavailable" });
}
