import { NextResponse } from "next/server";

// TODO: Replace with your @f1_naija numeric Twitter User ID.
// Go to https://commentpicker.com/twitter-id.php, enter "f1_naija" to find it.
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

export async function GET() {
  const token = process.env.TWITTER_BEARER_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Twitter bearer token not configured", tweets: [] },
      { status: 200 }
    );
  }

  try {
    const url = new URL(`https://api.twitter.com/2/users/${TWITTER_USER_ID}/tweets`);
    url.searchParams.set("max_results", "20");
    url.searchParams.set("tweet.fields", "created_at,text");
    url.searchParams.set("exclude", "retweets");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Twitter API error:", res.status, await res.text());
      return NextResponse.json({ error: "Failed to fetch tweets", tweets: [] }, { status: 200 });
    }

    const data = await res.json();
    const allTweets: { id: string; text: string; created_at: string }[] = data.data ?? [];
    const newsTweets = allTweets.filter((t) => isNewsTweet(t.text));

    return NextResponse.json({ tweets: newsTweets });
  } catch (err) {
    console.error("Tweets route error:", err);
    return NextResponse.json({ error: "Internal server error", tweets: [] }, { status: 200 });
  }
}
