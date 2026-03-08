"use client";

import { useEffect, useState, useCallback } from "react";

type Tweet = {
	id: string;
	text: string;
	created_at: string;
};

type NotifStatus = "idle" | "subscribed" | "denied" | "unsupported" | "ios-pwa-required";

function timeAgo(dateStr: string): string {
	const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

function TweetCard({ tweet }: { tweet: Tweet }) {
	const tweetUrl = `https://twitter.com/f1_naija/status/${tweet.id}`;
	return (
		<a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="block">
			<div className="rounded-xl border border-zinc-800 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900">
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-green-400">
						F1
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<span className="text-sm font-semibold text-white">F1 Naija</span>
							<span className="text-xs text-zinc-500">@f1_naija</span>
							<span className="ml-auto text-xs text-zinc-600">{timeAgo(tweet.created_at)}</span>
						</div>
						<p className="break-words text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
							{tweet.text}
						</p>
					</div>
				</div>
			</div>
		</a>
	);
}

function SkeletonCard() {
	return (
		<div className="animate-pulse rounded-xl border border-zinc-800 p-4">
			<div className="flex gap-3">
				<div className="h-9 w-9 rounded-full bg-zinc-800" />
				<div className="flex-1 space-y-2">
					<div className="h-3 w-1/3 rounded bg-zinc-800" />
					<div className="h-3 w-full rounded bg-zinc-800" />
					<div className="h-3 w-2/3 rounded bg-zinc-800" />
				</div>
			</div>
		</div>
	);
}

export default function NewsPage() {
	const [tweets, setTweets] = useState<Tweet[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");

	const fetchTweets = useCallback(async () => {
		try {
			const res = await fetch("/api/tweets");
			const data = await res.json();
			if (Array.isArray(data.tweets)) {
				setTweets(data.tweets);
				setError(null);
			}
		} catch {
			setError("Could not load news. Check back shortly.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTweets();
		const interval = setInterval(fetchTweets, 60_000);
		return () => clearInterval(interval);
	}, [fetchTweets]);

	useEffect(() => {
		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		if (isIOS && !isStandalone) { setNotifStatus("ios-pwa-required"); return; }
		if (!("Notification" in window)) { setNotifStatus("unsupported"); }
		else if (Notification.permission === "granted") { setNotifStatus("subscribed"); }
		else if (Notification.permission === "denied") { setNotifStatus("denied"); }
	}, []);

	async function subscribeToNotifications() {
		if (!("Notification" in window) || !("serviceWorker" in navigator)) { setNotifStatus("unsupported"); return; }
		const permission = await Notification.requestPermission();
		if (permission !== "granted") { setNotifStatus("denied"); return; }
		try {
			const reg = await navigator.serviceWorker.ready;
			const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
			const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
			await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
			setNotifStatus("subscribed");
		} catch (err) { console.error("Push subscribe error:", err); setNotifStatus("denied"); }
	}

	async function unsubscribeFromNotifications() {
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				await fetch("/api/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
				await sub.unsubscribe();
			}
			setNotifStatus("idle");
		} catch (err) { console.error("Unsubscribe error:", err); }
	}

	const noTweets = !loading && !error && tweets.length === 0;

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl text-white">News</h1>
					<p className="mt-0.5 text-sm text-zinc-500">
						Live F1 updates from{" "}
						<a href="https://twitter.com/f1_naija" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition-colors hover:text-white">
							@f1_naija
						</a>
					</p>
				</div>
				{notifStatus === "idle" && (
					<button onClick={subscribeToNotifications} className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-green-400">Enable Alerts</button>
				)}
				{notifStatus === "subscribed" && (
					<button onClick={unsubscribeFromNotifications} className="text-sm font-medium text-green-400 transition-colors hover:text-zinc-400" title="Click to turn off notifications">{"\u2713"} Alerts on</button>
				)}
				{notifStatus === "denied" && <span className="text-sm text-zinc-500">Notifications blocked</span>}
				{notifStatus === "unsupported" && <span className="text-sm text-zinc-500">Push not supported</span>}
				{notifStatus === "ios-pwa-required" && <span className="text-xs text-right max-w-[140px] leading-tight text-zinc-400">Add to Home Screen for alerts</span>}
			</div>

			{notifStatus === "ios-pwa-required" && (
				<div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
					<p className="text-sm font-semibold text-white mb-2">{"\ud83d\udcf1"} Get alerts on iPhone / iPad</p>
					<p className="text-xs text-zinc-400 leading-relaxed">
						iOS only supports push notifications for apps added to your home screen. In Safari, tap the{" "}
						<span className="font-semibold text-zinc-300">Share</span> button {"\u2b06\ufe0f"}, then choose{" "}
						<span className="font-semibold text-zinc-300">&quot;Add to Home Screen&quot;</span>. Open the app from your home screen {"\u2014"} alerts will work automatically.
					</p>
				</div>
			)}

			{loading && (
				<div className="flex flex-col gap-3">
					{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
				</div>
			)}

			{!loading && error && (
				<div className="py-12 text-center text-zinc-500">
					<p>{error}</p>
					<button onClick={fetchTweets} className="mt-3 text-sm text-green-400 hover:underline">Retry</button>
				</div>
			)}

			{noTweets && (
				<div className="rounded-xl border border-zinc-800 p-8 text-center">
					<p className="text-sm text-zinc-400">
						No tweets yet {"\u2014"} follow{" "}
						<a href="https://twitter.com/f1_naija" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">@f1_naija</a>
						{" "}for live F1 updates.
					</p>
				</div>
			)}

			{!loading && !error && tweets.length > 0 && (
				<div className="flex flex-col gap-3">
					{tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)}
				</div>
			)}

			<p className="pb-4 text-center text-xs text-zinc-700">Auto-refreshes every 60s · Powered by F1 Naija</p>
		</div>
	);
}
