"use client";
import Image from "next/image";
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
  avatar_url?: string;
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

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  "BBC Sport":        { bg: "rgba(220,38,38,.15)",   text: "#f87171" },
  "RaceFans":         { bg: "rgba(59,130,246,.15)",  text: "#93c5fd" },
  "The Race":         { bg: "rgba(234,179,8,.15)",   text: "#fde047" },
  "Motorsport.com":  { bg: "rgba(168,85,247,.15)",  text: "#d8b4fe" },
  "Autosport":        { bg: "rgba(249,115,22,.15)",  text: "#fdba74" },
  "Planet F1":        { bg: "rgba(0,212,132,.15)",   text: "#00d484" },
  "ESPN F1":          { bg: "rgba(220,38,38,.15)",   text: "#f87171" },
  "GPblog":           { bg: "rgba(99,102,241,.15)",  text: "#a5b4fc" },
  "GPfans":           { bg: "rgba(14,165,233,.15)",  text: "#7dd3fc" },
};

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const src = SOURCE_COLORS[item.source] ?? { bg: "rgba(255,255,255,.06)", text: "#5a6888" };
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block", WebkitTapHighlightColor: "transparent" }}
    >
      <div style={{
        background: featured ? "rgba(0,212,132,.04)" : "rgba(255,255,255,.02)",
        border: "1px solid",
        borderColor: featured ? "rgba(0,212,132,.18)" : "rgba(255,255,255,.06)",
        borderRadius: 12,
        padding: featured ? "20px" : "14px 16px",
        transition: "border-color .2s, transform .2s",
        height: "100%",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,212,132,.3)";
        if (featured) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = featured ? "rgba(0,212,132,.18)" : "rgba(255,255,255,.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: src.bg, color: src.text, letterSpacing: ".04em", whiteSpace: "nowrap",
          }}>{item.source}</span>
          <span style={{ fontSize: 10, color: "#3a4560", whiteSpace: "nowrap" }}>{timeAgo(item.pubDate)}</span>
        </div>
        <h3 style={{
          fontSize: featured ? "clamp(15px,2.5vw,18px)" : 13,
          fontWeight: featured ? 800 : 600,
          letterSpacing: "-.01em",
          lineHeight: 1.45,
          color: "#edf2ff",
          margin: "0 0 8px",
        }}>
          {item.title}
        </h3>
        {item.description && (
          <p style={{
            fontSize: 12, color: "#5a6888", lineHeight: 1.6, margin: 0,
            display: "-webkit-box", WebkitLineClamp: featured ? 3 : 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{item.description}</p>
        )}
        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: featured ? "#00d484" : "#3a4560" }}>
          Read more →
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,.02)",
      border: "1px solid rgba(255,255,255,.05)",
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <div style={{ height: 20, width: 80, borderRadius: 20, background: "rgba(255,255,255,.06)" }} />
        <div style={{ height: 12, width: 40, borderRadius: 4, background: "rgba(255,255,255,.04)" }} />
      </div>
      <div style={{ height: 14, width: "100%", borderRadius: 4, background: "rgba(255,255,255,.06)", marginBottom: 6 }} />
      <div style={{ height: 14, width: "80%", borderRadius: 4, background: "rgba(255,255,255,.04)", marginBottom: 10 }} />
      <div style={{ height: 10, width: "60%", borderRadius: 4, background: "rgba(255,255,255,.03)" }} />
    </div>
  );
}

function NewsTicker({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;
  const tickerItems = [...items, ...items];
  const totalChars = items.reduce((sum, item) => sum + item.title.length, 0);
  const duration = Math.max(30, totalChars * 0.012);

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      borderRadius: 10,
      border: "1px solid rgba(0,212,132,.15)",
      background: "rgba(0,212,132,.04)",
      height: 42, display: "flex", alignItems: "center",
      marginBottom: 28,
    }}>
      <style>{`
        @keyframes newsTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div style={{
        flexShrink: 0, background: "#00d484", color: "#04060e",
        fontSize: 9, fontWeight: 800, padding: "4px 12px",
        letterSpacing: ".1em", textTransform: "uppercase",
        borderRadius: "0 20px 20px 0",
        zIndex: 2, whiteSpace: "nowrap",
      }}>LIVE</div>
      <div style={{ overflow: "hidden", flex: 1, padding: "0 16px" }}>
        <div style={{
          display: "flex", gap: 32, whiteSpace: "nowrap",
          animation: `newsTicker ${duration}s linear infinite`,
        }}>
          {tickerItems.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#5a6888", textDecoration: "none", flexShrink: 0 }}>
              <span style={{ color: "#00d484", marginRight: 8 }}>●</span>
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

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
            avatar_url: data.user.avatar_url,
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
    const interval = setInterval(fetchData, 2 * 60_000);
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
    <div style={{ background: "#04060e", color: "#edf2ff", minHeight: "100vh" }}>
      <style>{`
        @keyframes newsFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .news-fade-1 { animation: newsFadeUp .5s ease .1s both; }
        .news-fade-2 { animation: newsFadeUp .5s ease .25s both; }
        .news-fade-3 { animation: newsFadeUp .5s ease .4s both; }
      `}</style>

      {/* ── PAGE HERO ─────────────────────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(40px,7vw,72px) 0 clamp(32px,5vw,52px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 80% 40%,rgba(0,212,132,.04) 0%,transparent 60%)",
        }} />
        <div style={{
          position: "absolute", bottom: -20, right: -10,
          fontSize: "clamp(80px,13vw,180px)", fontWeight: 900,
          letterSpacing: "-.02em", color: "rgba(255,255,255,.011)",
          lineHeight: 1, pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none",
        }}>NEWS</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="news-fade-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 16, height: 1, background: "#00d484" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#00d484" }}>
              Latest · F1 Global Feed
            </span>
          </div>

          <div className="news-fade-2" style={{ lineHeight: .9 }}>
            <div style={{ fontSize: "clamp(40px,6vw,84px)", fontWeight: 900, letterSpacing: "-.04em", color: "#edf2ff", lineHeight: .92 }}>
              F1 News
            </div>
            <div style={{
              fontSize: "clamp(40px,6vw,84px)", fontWeight: 900,
              letterSpacing: "-.04em", lineHeight: .92,
              background: "linear-gradient(120deg,#00d484 0%,#00f0a0 50%,#f5a724 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Straight Up.
            </div>
          </div>

          <div className="news-fade-3" style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "#5a6888", margin: 0 }}>
              BBC, Autosport, The Race, Planet F1 &amp; more — all in one place.
            </p>
            {notifStatus !== "unsupported" && notifStatus !== "ios-pwa-required" && (
              <button
                onClick={handleNotifToggle}
                disabled={notifStatus === "denied"}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  letterSpacing: ".04em", cursor: notifStatus === "denied" ? "not-allowed" : "pointer",
                  border: "1px solid",
                  borderColor: notifStatus === "subscribed" ? "rgba(0,212,132,.4)" : "rgba(255,255,255,.1)",
                  background: notifStatus === "subscribed" ? "rgba(0,212,132,.08)" : "rgba(255,255,255,.04)",
                  color: notifStatus === "subscribed" ? "#00d484" : notifStatus === "denied" ? "#3a4560" : "#edf2ff",
                  minHeight: 40, WebkitTapHighlightColor: "transparent",
                }}
              >
                {notifStatus === "subscribed" ? "✓ Alerts on" : notifStatus === "denied" ? "Blocked" : "🔔 Alerts"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div style={{ padding: "28px 0 80px" }}>

        {/* Ticker */}
        {!loading && newsItems.length > 0 && <NewsTicker items={newsItems} />}

        {/* @f1_naija Profile card */}
        {profile && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 16,
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 12, padding: "18px 20px", marginBottom: 24,
            flexWrap: "wrap",
          }}>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name}
                width={52}
                height={52}
                style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "2px solid rgba(0,212,132,.3)" }}
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#008751,#00d484)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 900, color: "#04060e",
              }}>F1</div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#edf2ff" }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: "#5a6888", marginBottom: 8 }}>@{profile.screen_name}</div>
              <p style={{ fontSize: 12, color: "#8090b0", lineHeight: 1.6, margin: "0 0 10px" }}>{profile.description}</p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#5a6888" }}>
                <span><strong style={{ color: "#edf2ff" }}>{fmt(profile.followers)}</strong> followers</span>
                <span><strong style={{ color: "#edf2ff" }}>{fmt(profile.tweets)}</strong> posts</span>
              </div>
            </div>
            <a
              href="https://twitter.com/f1_naija" target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.04)", color: "#edf2ff",
                textDecoration: "none", whiteSpace: "nowrap",
                minHeight: 40, WebkitTapHighlightColor: "transparent",
                alignSelf: "flex-start",
              }}
            >
              Open @f1_naija →
            </a>
          </div>
        )}

        {/* News grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 12, padding: "60px 20px", color: "#5a6888", textAlign: "center",
          }}>
            <div style={{ fontSize: 36 }}>📡</div>
            <p style={{ fontSize: 14 }}>{error}</p>
            <button
              onClick={fetchData}
              style={{
                padding: "9px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: "1px solid rgba(0,212,132,.3)", background: "rgba(0,212,132,.08)",
                color: "#00d484", cursor: "pointer", minHeight: 40,
              }}
            >Try again</button>
          </div>
        ) : visibleItems.length > 0 ? (
          <>
            {/* Featured */}
            <div style={{ marginBottom: 16 }}>
              <NewsCard item={visibleItems[0]} featured />
            </div>

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 10, marginBottom: 12,
            }}>
              {visibleItems.slice(1).map((item, i) => (
                <NewsCard key={i} item={item} />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                style={{
                  width: "100%", marginTop: 8,
                  padding: "13px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.02)", color: "#5a6888",
                  cursor: "pointer", transition: "all .2s",
                  minHeight: 48, WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#edf2ff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#5a6888")}
              >
                Load {Math.min(PAGE_SIZE, newsItems.length - visibleCount)} more stories
              </button>
            )}
            {visibleCount > PAGE_SIZE && (
              <button
                onClick={() => setVisibleCount(PAGE_SIZE)}
                style={{
                  width: "100%", marginTop: 6,
                  padding: "10px", borderRadius: 10, fontSize: 11,
                  border: "1px solid rgba(255,255,255,.05)",
                  background: "transparent", color: "#3a4560",
                  cursor: "pointer",
                  minHeight: 44, WebkitTapHighlightColor: "transparent",
                }}
              >
                ↑ Collapse
              </button>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#5a6888" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏎️</div>
            <p>No news available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
