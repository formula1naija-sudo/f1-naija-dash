import { NextResponse } from "next/server";

export const revalidate = 300; // cache 5 minutes

export interface NewsPreviewItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
  category: string;
}

function pickCategory(title: string): string {
  const t = title.toLowerCase();
  if (/race|grand prix|gp|qualify|sprint|podium|grid|lap|pit/.test(t)) return "Race Weekend";
  if (/hamilton|verstappen|norris|leclerc|piastri|russell|alonso|sainz|driver/.test(t)) return "Driver";
  if (/ferrari|mclaren|red bull|mercedes|williams|alpine|haas|aston|sauber|audi|cadillac|team/.test(t)) return "Team";
  return "General";
}

function extractCdata(tag: string, xml: string): string {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`));
  return plain ? plain[1].trim() : "";
}

async function fetchRSS(url: string, source: string): Promise<NewsPreviewItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: NewsPreviewItem[] = [];
    const matches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
    for (const m of matches) {
      if (items.length >= 3) break;
      const chunk = m[1];
      const title = extractCdata("title", chunk);
      const link  = extractCdata("link",  chunk) || (chunk.match(/<link>(.*?)<\/link>/)?.[1] ?? "#");
      const pubDate = extractCdata("pubDate", chunk) || (chunk.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "");
      if (title) items.push({ title, source, link, pubDate, category: pickCategory(title) });
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  // Try BBC first, fall back to The Race
  let items = await fetchRSS("https://feeds.bbci.co.uk/sport/formula1/rss.xml", "BBC Sport");
  if (items.length < 3) {
    const extra = await fetchRSS("https://www.racefans.net/feed/", "RaceFans");
    items = [...items, ...extra].slice(0, 3);
  }
  return NextResponse.json({ items: items.slice(0, 3) });
}
