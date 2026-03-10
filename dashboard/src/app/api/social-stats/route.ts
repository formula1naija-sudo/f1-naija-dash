import { NextResponse } from "next/server";

// ── Static fallback counts (update these manually when needed) ────────────────
// Only used when the live fetch fails or for platforms with no public API.
const FALLBACK: Record<string, number> = {
  twitter:   6637,
  instagram: 5352,
  threads:   3000,
  tiktok:    0,
  facebook:  0,
};

// ── Fetch Twitter/X follower count from public syndication API ────────────────
async function fetchTwitterFollowers(screenName: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${screenName}`,
      { next: { revalidate: 3600 } }, // cache for 1 hour
    );
    if (!res.ok) return null;
    const data = await res.json() as Array<{ followers_count?: number }>;
    return data?.[0]?.followers_count ?? null;
  } catch {
    return null;
  }
}

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET() {
  const twitterLive = await fetchTwitterFollowers("f1_naija");

  const stats = {
    twitter:   twitterLive   ?? FALLBACK.twitter,
    instagram: FALLBACK.instagram,
    threads:   FALLBACK.threads,
    tiktok:    FALLBACK.tiktok,
    facebook:  FALLBACK.facebook,
    // total community size for the stat bar
    fantasy:   200,
    impressions: "1M+",
    // indicates whether the Twitter count is live or from cache
    twitterLive: twitterLive !== null,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
