"use client";
import { useEffect, useState, useCallback } from "react";

type NewsItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
};

type Profile = {
  name: string;
  screen_name: string;
  description: string;
  followers: number;
  tweets: number;
};

type NotifStatus = "idle" | "subscribed" | "denied" | "unsupported" | "ios-pwa-required";

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const SOURCE_COLORS: Record<string, string> = {
  "BBC Sport":       "bg-red-900 text-red-300",
  "RaceFans":        "bg-blue-900 text-blue-300",
  "The Race":        "bg-yellow-900 text-yellow-300",
  "Motorsport.com":  "bg-purple-900 text-purple-300",
  "Autosport":       "bg-orange-900 text-orange-300",
  "Planet F1":       "bg-green-900 text-green-300",
  "Motorsport Week": "bg-teal-900 text-teal-300",
  "ESPN F1":         "bg-red-950 text-red-400",
  "GPblog":          "bg-indigo-900 text-indigo-300",
  "GPfans":          "bg-sky-900 text-sky-300",
  "RacingNews365":   "bg-amber-900 text-amber-300",
  "Speedcafe":       "bg-lime-900 text-lime-300",
  "Crash.net":       "bg-rose-900 text-rose-300",
  "Formu1a.uno":     "bg-violet-900 text-violet-300",
  "Formula Passion": "bg-pink-900 text-pink-300",
  "AMUS":            "bg-gray-800 text-gray-300",
  "Motorsport Total":"bg-cyan-900 text-cyan-300",
  "Soymotor":        "bg-yellow-950 text-yellow-400",
  "F1i":             "bg-blue-950 text-blue-400",
  "Formule1.nl":     "bg-orange-950 text-orange-400",
  "AutoRacer IT":    "bg-emerald-900 text-emerald-300",
};

function NewsCard({ item }: { item: NewsItem }) {
  const colorClass = SOURCE_COLORS[item.source] ?? "bg-zinc-800 text-zinc-300";
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="rounded-xl border border-zinc-800 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            {item.source}
          </span>
          <span className="text-xs text-zinc-600 whitespace-nowrap">{timeAgo(item.pubDate)}</span>
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-green-400 transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{item.description}</p>
        )}
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-20 rounded-full bg-zinc-800" />
        <div className="h-3 w-12 rounded bg-zinc-800" />
      </div>
      <div className="h-4 w-full rounded bg-zinc-800 mb-1" />
      <div className="h-4 w-3/4 rounded bg-zinc-800 mb-2" />
      <div className="h-3 w-full rounded bg-zinc-800" />
    </div>
  );
}

function NewsTicker({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;
  // Top 8 headlines only — fixed 6s cycle for maximum speed
  const tickerSource = items.slice(0, 8);
  const tickerItems = [...tickerSource, ...tickerSource];
  const duration = 6; // fixed 6s — ~800px/s fast live-ticker feel

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 py-3 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-green-500 text-black text-xs font-bold px-3 py-1 mr-4 rounded-full z-10">
          LIVE
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{ animation: `marquee ${duration}s linear infinite` }}
          >
            {tickerItems.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-300 hover:text-green-400 transition-colors flex-shrink-0"
              >
                <span className="text-zinc-600 mr-2">●</span>
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-xl border border-zinc-800 p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-400 text-xl font-bold text-black">
          F1
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-base font-bold text-white">{profile.name}</span>
          <p className="text-sm text-zinc-500 mb-2">@{profile.screen_name}</p>
          <p className="text-sm leading-relaxed text-zinc-300">{profile.description}</p>
          <div className="mt-3 flex gap-4 text-sm text-zinc-500">
            <span><strong className="text-white">{fmt(profile.followers)}</strong> followers</span>
            <span><strong className="text-white">{fmt(profile.tweets)}</strong> posts</span>
          </div>
        </div>
      </div>
      <a
        href="https://twitter.com/f1_naija"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 border border-zinc-700 py-3 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800"
      >
        Open @f1_naija on X →
      </a>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchData = useCallback(async () => {
    try {
      const [newsRes, profileRes] = await Promise.allSettled([
        fetch("/api/news"),
        fetch("https://api.fxtwitter.com/f1_naija"),
      ]);
      if (newsRes.status === "fulfilled" && newsRes.value.ok) {
        const data = await newsRes.value.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setNewsItems(data.items);
          setError(null);
          setVisibleCount(PAGE_SIZE);
        }
      }
      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        const data = await profileRes.value.json();
        if (data.user) {
          setProfile({
            name: data.user.name,
            screen_name: data.user.screen_name,
            description: data.user.description,
            followers: data.user.followers,
            tweets: data.user.tweets,
          });
        }
      }
    } catch {
      setError("Could not load news. Check back shortly.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifStatus("unsupported");
      return;
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
    if (isIOS && !isStandalone) { setNotifStatus("ios-pwa-required"); return; }
    if (Notification.permission === "granted") setNotifStatus("subscribed");
    else if (Notification.permission === "denied") setNotifStatus("denied");
  }, []);

  const handleNotifToggle = async () => {
    if (notifStatus === "subscribed") {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      }
      setNotifStatus("idle");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { setNotifStatus("denied"); return; }
    setNotifStatus("subscribed");
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
    } catch (e) { console.error("Push subscription error:", e); }
  };

  const visibleItems = newsItems.slice(0, visibleCount);
  const hasMore = visibleCount < newsItems.length;

  return (
    <div className="pb-8 text-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">F1 News</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Latest from BBC, Autosport, The Race, Planet F1 &amp; more
            </p>
          </div>
          {notifStatus !== "unsupported" && notifStatus !== "ios-pwa-required" && (
            <button
              onClick={handleNotifToggle}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors border ${
                notifStatus === "subscribed"
                  ? "bg-green-950 border-green-800 text-green-400"
                  : notifStatus === "denied"
                  ? "bg-zinc-900 border-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
              disabled={notifStatus === "denied"}
            >
              {notifStatus === "subscribed" ? "✓ Alerts on" : notifStatus === "denied" ? "Blocked" : "🔔 Alerts"}
            </button>
          )}
        </div>

        {!loading && newsItems.length > 0 && <NewsTicker items={newsItems} />}
        {profile && <ProfileCard profile={profile} />}

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <div className="rounded-xl border border-zinc-800 p-6 text-center text-zinc-500">
              <p>{error}</p>
              <button onClick={fetchData} className="mt-3 text-sm text-green-400 hover:underline">Try again</button>
            </div>
          ) : visibleItems.length > 0 ? (
            <>
              {visibleItems.map((item, i) => <NewsCard key={i} item={item} />)}
              {hasMore && (
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 py-3 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
                >
                  Show {Math.min(PAGE_SIZE, newsItems.length - visibleCount)} more stories
                </button>
              )}
              {visibleCount > PAGE_SIZE && (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="w-full rounded-xl border border-zinc-800 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  ↑ Collapse
                </button>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-zinc-800 p-6 text-center text-zinc-500">
              No news available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
                          }
