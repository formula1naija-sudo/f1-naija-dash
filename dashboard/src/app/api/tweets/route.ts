import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PUSH_URL = (process.env.NEXT_PUBLIC_PUSH_SERVICE_URL ?? "").replace(/\/$/, "");

interface Tweet {
  id: string;
  text: string;
  created_at: string;
}

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
  if (!PUSH_URL) {
    return NextResponse.json(
      { error: "Push service not configured", tweets: [] },
      { status: 200 },
    );
  }

  try {
    const res = await fetch(`${PUSH_URL}/tweets`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Push service ${res.status}`, tweets: [] }, { status: 200 });
    }

    const data = (await res.json()) as { tweets: Tweet[]; cached?: boolean; error?: string };
    const tweets = (data.tweets ?? []).filter((t) => !isNewsTweet || t);

    return NextResponse.json({ tweets, cached: data.cached ?? false });
  } catch (err) {
    return NextResponse.json(
      { error: String(err), tweets: [] },
      { status: 200 },
    );
  }
}
