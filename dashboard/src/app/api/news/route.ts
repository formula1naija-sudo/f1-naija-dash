import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RSS_FEEDS = [
	// English (existing)
	{ url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",              source: "BBC Sport" },
	{ url: "https://www.racefans.net/feed/",                               source: "RaceFans" },
	{ url: "https://the-race.com/feed/",                                   source: "The Race" },
	{ url: "https://www.motorsport.com/rss/f1/news/",                      source: "Motorsport.com" },
	{ url: "https://www.autosport.com/rss/feed/f1",                        source: "Autosport" },

	// English (new)
	{ url: "https://www.planetf1.com/feed/",                               source: "Planet F1" },
	{ url: "https://www.motorsportweek.com/feed/",                         source: "Motorsport Week" },
	{ url: "https://www.espn.com/espn/rss/f1/news",                        source: "ESPN F1" },
	{ url: "https://www.gpblog.com/en/rss.xml",                            source: "GPblog" },
	{ url: "https://www.gpfans.com/en/rss/",                               source: "GPfans" },
	{ url: "https://racingnews365.com/feed/",                              source: "RacingNews365" },
	{ url: "https://www.speedcafe.com/feed/",                              source: "Speedcafe" },
	{ url: "https://www.crash.net/rss/f1/news",                            source: "Crash.net" },

	// Multilingual
	{ url: "https://www.formula.uno/en/rss.xml",                           source: "Formula.uno" },
	{ url: "https://www.formulapassion.it/feed/",                          source: "Formula Passion" },
	{ url: "https://www.auto-motor-und-sport.de/rss/feed/thema/formel-1/", source: "AMUS" },
	{ url: "https://www.motorsport-total.com/rss/news.xml",                source: "Motorsport Total" },
	{ url: "https://www.soymotor.com/feed/",                               source: "Soymotor" },
	{ url: "https://f1i.com/feed",                                         source: "F1i" },
	{ url: "https://www.formule1.nl/feeds/rss/news",                       source: "Formule1.nl" },
	{ url: "https://www.autoracer.it/feed/",                               source: "AutoRacer IT" },
];
type NewsItem = {
	title: string;
	description: string;
	link: string;
	pubDate: string;
	source: string;
};

function extractTag(xml: string, tag: string): string {
	// CDATA content  e.g.  <title><![CDATA[...]]></title>
	const cdataMatch = new RegExp(
		"<" + tag + "[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/" + tag + ">"
	).exec(xml);
	if (cdataMatch) return cdataMatch[1].trim();

	// Plain text content  e.g.  <title>...</title>
	const plainMatch = new RegExp(
		"<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">"
	).exec(xml);
	if (plainMatch) return plainMatch[1].trim();

	return "";
}

function parseRSS(xml: string, source: string): NewsItem[] {
	const items: NewsItem[] = [];
	const itemRegex = new RegExp("<item>([\\s\\S]+?)<\\/item>", "g");
	let match;
	while ((match = itemRegex.exec(xml)) !== null) {
		const itemXml = match[1];
		const title = extractTag(itemXml, "title");

		// <link> is sometimes empty (Atom) - fall back to <guid>
		let link = extractTag(itemXml, "link");
		if (!link) {
			link = extractTag(itemXml, "guid");
		}

		const description = extractTag(itemXml, "description")
			.replace(new RegExp("<[^>]+>", "g"), "")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.trim()
			.substring(0, 220);

		const pubDate = extractTag(itemXml, "pubDate");

		if (title && link) {
			items.push({ title, description, link, pubDate, source });
		}
	}
	return items;
}
// ---------------------------------------------------------------------------
// Title-based deduplication — strips punctuation, stop words, and word order
// so "Hamilton wins the Australian GP" and "HAMILTON WINS AUSTRALIAN GP!"
// collapse to the same key; only the first (earliest-in-list) entry is kept.
// ---------------------------------------------------------------------------
const STOP_WORDS = new Set([
	"a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "but",
	"is", "was", "are", "were", "has", "have", "with", "by", "from", "up", "as",
	"it", "its", "be", "this", "that", "after", "into", "over", "about", "how",
	"who", "what", "why", "when", "where", "will", "would", "could", "should",
]);

function normTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.split(/\s+/)
		.filter((w) => w.length > 2 && !STOP_WORDS.has(w))
		.sort()
		.join(" ");
}

function deduplicateByTitle(items: NewsItem[]): NewsItem[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = normTitle(item.title);
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

// ---------------------------------------------------------------------------
// F1-only filter — drop stories that are clearly about other series.
// We check the title and description for non-F1 motorsport keywords.
// ---------------------------------------------------------------------------
const NON_F1_PATTERN =
	/\b(indycar|indy\s?500|motogp|moto\s?gp|moto2|moto3|formula\s?[23e]|f2\b|f3\b|formula\s?e\b|formula\s?2\b|formula\s?3\b|wec\b|dtm\b|nascar|supercars|supercup|btcc|wrc\b|rally\b|rallycross|dakar|le\s?mans|24h\s?race|daytona\s?500|imsa|superbike|fia\s+fe|endurance\s+championship)\b/i;

function isF1Relevant(item: NewsItem): boolean {
	const text = `${item.title} ${item.description}`;
	return !NON_F1_PATTERN.test(text);
}

async function fetchFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
	try {
		const res = await fetch(feedUrl, {
			headers: { "User-Agent": "F1Naija-Dashboard/1.0 (+https://f1naija.com)" },
			next: { revalidate: 300 },
		});
		if (!res.ok) return [];
		const xml = await res.text();
		return parseRSS(xml, source);
	} catch {
		return [];
	}
}

export async function GET() {
	const results = await Promise.allSettled(
		RSS_FEEDS.map((f) => fetchFeed(f.url, f.source))
	);

	const allItems: NewsItem[] = [];
	for (const result of results) {
		if (result.status === "fulfilled") {
			// Take up to 5 items per feed so no single source dominates
			allItems.push(...result.value.slice(0, 5));
		}
	}

	// Deduplicate stories with near-identical titles across sources
	const dedupedItems = deduplicateByTitle(allItems);

	// Keep F1-only stories — filter out IndyCar, MotoGP, F2, F3, etc.
	const f1Items = dedupedItems.filter(isF1Relevant);

	// Sort newest first
	f1Items.sort((a, b) => {
		const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
		const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
		return db - da;
	});

	// Prefer last 12 h; fall back to latest 50 if nothing recent
	const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
	const recent = f1Items.filter(
		(item) => !item.pubDate || new Date(item.pubDate).getTime() > twelveHoursAgo
	);
	const finalItems = recent.length >= 3 ? recent : f1Items.slice(0, 50);

	return NextResponse.json({ items: finalItems });
}

