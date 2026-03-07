import { NextResponse } from "next/server";

// Force dynamic rendering — fetches live data from Twitter API
export const dynamic = "force-dynamic";

const TWITTER_USER_ID = process.env.TWITTER_USER_ID ?? "REPLACE_WITH_USER_ID";

function isNewsTweet(text: string): boolean {
  const startsWithReply = text.startsWith("@");
  const isNewsFormat =
    text.startsWith("\u{1F4F0}") ||
    text.startsWith("\u{1F4F8}") ||
    text.includes("#F1") ||
    text.includes("#AusGP") ||
    text.includes("#F1Naija");
  return isNewsFormat && !startsWithReply;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
}

interface TwitterResponse {
  data?: TwitterTweet[];
  errors?: { message: string }[];
}

export async function GET() {
  const rawToken = process.env.TWITTER_BEARER_TOKEN;
  if (!rawToken) {
    return NextResponse.json(
      { error: "Twitter bearer token not configured", tweets: [] },
      { status: 200 }
    );
  }

  // URL-decode the token in case it was stored with percent-encoded chars
  // (e.g. %2F -> /, %3D -> =)
  const token = rawToken.includes("%") ? decodeURIComponent(rawToken) : rawToken;

  try {
    const url = new URL(
      `https://api.twitter.com/2/users/${TWITTER_USER_ID}/tweets`
    );
    url.searchParams.set("max_results", "20");
    url.searchParams.set("tweet.fields", "created_at,text");
    url.searchParams.set("exclude", "retweets");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Twitter API error:", res.status, errText);
      return NextResponse.json(
        { error: `Twitter API ${res.status}`, detail: errText, tweets: [] },
        { status: 200 }
      );
    }

    const data = (await res.json()) as TwitterResponse;
    const allTweets: TwitterTweet[] = data.data ?? [];
    const newsTweets = allTweets.filter((t) => isNewsTweet(t.text));
    return NextResponse.json({ tweets: newsTweets });
  } catch (err) {
    console.error("Tweets route error:", err);
    return NextResponse.json(
      { error: "Internal server error", tweets: [] },
      { status: 200 }
    );
  }
}
