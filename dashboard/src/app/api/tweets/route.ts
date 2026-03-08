import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseTweetsFromHtml(html: string): Array<{ id: string; text: string; created_at: string }> {
  const tweets: Array<{ id: string; text: string; created_at: string }> = [];
  const itemRe = /<li[^>]+data-tweet-id="(\d+)"[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    const id = m[1];
    const inner = m[2];
    const textMatch = /<p[^>]*class="[^"]*timeline-Tweet-text[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(inner);
    const rawText = textMatch
      ? textMatch[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
      : "";
    const timeMatch = /<time[^>]+datetime="([^"]+)"/.exec(inner) || /data-datetime="([^"]+)"/.exec(inner);
    const created_at = timeMatch ? new Date(timeMatch[1]).toISOString() : new Date().toISOString();
    if (rawText) tweets.push({ id, text: rawText, created_at });
  }
  return tweets;
}

async function fetchFromSyndication(): Promise<Array<{ id: string; text: string; created_at: string }> | null> {
  // Strategy 1: CDN JSONP
  const cdnUrl =
    "https://cdn.syndication.twimg.com/timeline/profile?screen_name=f1_naija&count=20&lang=en&callback=f1nCallback";
  try {
    console.log("Trying CDN syndication JSONP");
    const res = await fetch(cdnUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/javascript, application/javascript, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://twitter.com/",
        Origin: "https://twitter.com",
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    console.log("CDN status:", res.status, "bodyLen:", body.length);
    if (body && body.trim()) {
      const match = body.match(/^[^(]+\(([\s\S]*)\)\s*;?\s*$/);
      const jsonStr = match ? match[1] : body;
      const data = JSON.parse(jsonStr);
      const htmlBody = data.body || "";
      if (htmlBody) {
        const tweets = parseTweetsFromHtml(htmlBody);
        if (tweets.length > 0) {
          console.log("CDN JSONP: got", tweets.length, "tweets");
          return tweets;
        }
      }
    }
  } catch (e) {
    console.log("CDN JSONP error:", e);
  }

  // Strategy 2: syndication.twitter.com
  const synUrl = "https://syndication.twitter.com/srv/timeline-profile/screen-name/f1_naija?lang=en";
  try {
    console.log("Trying syndication.twitter.com");
    const res = await fetch(synUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://twitter.com/",
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    console.log("Syndication status:", res.status, "bodyLen:", body.length);
    if (res.ok && body) {
      const tweets = parseTweetsFromHtml(body);
      if (tweets.length > 0) {
        console.log("Syndication: got", tweets.length, "tweets");
        return tweets;
      }
    }
  } catch (e) {
    console.log("Syndication error:", e);
  }

  return null;
}

async function fetchFromNitter(): Promise<Array<{ id: string; text: string; created_at: string }> | null> {
  const instances = [
    "https://xcancel.com",
    "https://nitter.privacyredirect.com",
    "https://lightbrd.com",
    "https://nitter.poast.org",
    "https://nitter.tiekoetter.com",
    "https://nitter.catsarch.com",
    "https://nitter.space",
  ];
  for (const instance of instances) {
    try {
      console.log("Trying Nitter:", instance);
      const res = await fetch(instance + "/f1_naija/rss", {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) { console.log("Nitter", instance, "HTTP", res.status); continue; }
      const xml = await res.text();
      const items: Array<{ id: string; text: string; created_at: string }> = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const linkM = itemXml.match(/<link>(.*?)<\/link>/);
        const dateM = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
        const descM = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
        const idM = linkM && linkM[1].match(/\/status\/(\d+)/);
        if (!idM) continue;
        const text = (descM ? descM[1] : "")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
          .trim();
        items.push({ id: idM[1], text, created_at: new Date(dateM ? dateM[1] : "").toISOString() });
      }
      if (items.length > 0) {
        console.log("Nitter", instance, "got", items.length, "tweets");
        return items;
      }
    } catch (e) {
      console.log("Nitter", instance, "failed:", e);
    }
  }
  return null;
}

export async function GET() {
  try {
    const tweets = (await fetchFromSyndication()) ?? (await fetchFromNitter());
    if (tweets && tweets.length > 0) {
      return NextResponse.json({ tweets });
    }
    return NextResponse.json({ tweets: [], error: "Could not load tweets — all sources unavailable" });
  } catch (err) {
    console.error("Tweets route error:", err);
    return NextResponse.json({ tweets: [], error: "Internal server error" });
  }
}
