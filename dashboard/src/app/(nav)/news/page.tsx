"use client";

import { useEffect, useRef, useState } from "react";

type NotifStatus = "idle" | "subscribed" | "denied" | "unsupported" | "ios-pwa-required";

declare global {
	interface Window {
		twttr?: { widgets: { load: (el?: Element | null) => void } };
	}
}

export default function NewsPage() {
	const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const load = () => {
			if (window.twttr?.widgets && containerRef.current) {
				window.twttr.widgets.load(containerRef.current);
			}
		};
		if (window.twttr?.widgets) {
			load();
		} else if (!document.getElementById("twitter-wjs")) {
			const s = document.createElement("script");
			s.id = "twitter-wjs";
			s.src = "https://platform.twitter.com/widgets.js";
			s.async = true;
			s.onload = load;
			document.head.appendChild(s);
		}
	}, []);

	// Notification status detection
	useEffect(() => {
		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		if (isIOS && !isStandalone) { setNotifStatus("ios-pwa-required"); return; }
		if (!("Notification" in window)) setNotifStatus("unsupported");
		else if (Notification.permission === "granted") setNotifStatus("subscribed");
		else if (Notification.permission === "denied") setNotifStatus("denied");
	}, []);

	async function subscribeToNotifications() {
		if (!("Notification" in window) || !("serviceWorker" in navigator)) { setNotifStatus("unsupported"); return; }
		const permission = await Notification.requestPermission();
		if (permission !== "granted") { setNotifStatus("denied"); return; }
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
			});
			await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
			setNotifStatus("subscribed");
		} catch { setNotifStatus("denied"); }
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
		} catch { /* ignore */ }
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
			{/* Header */}
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
					<button onClick={subscribeToNotifications} className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-green-400">
						Enable Alerts
					</button>
				)}
				{notifStatus === "subscribed" && (
					<button onClick={unsubscribeFromNotifications} className="text-sm font-medium text-green-400 transition-colors hover:text-zinc-400" title="Click to turn off notifications">
						{"✓"} Alerts on
					</button>
				)}
				{notifStatus === "denied" && <span className="text-sm text-zinc-500">Notifications blocked</span>}
				{notifStatus === "unsupported" && <span className="text-sm text-zinc-500">Push not supported</span>}
				{notifStatus === "ios-pwa-required" && (
					<span className="text-xs text-right max-w-[140px] leading-tight text-zinc-400">Add to Home Screen for alerts</span>
				)}
			</div>

			{/* iOS PWA instruction */}
			{notifStatus === "ios-pwa-required" && (
				<div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
					<p className="text-sm font-semibold text-white mb-2">{"📱"} Get alerts on iPhone / iPad</p>
					<p className="text-xs text-zinc-400 leading-relaxed">
						iOS only supports push notifications for apps added to your home screen. In Safari, tap the{" "}
						<span className="font-semibold text-zinc-300">Share</span> button {"⬆️"}, then choose{" "}
						<span className="font-semibold text-zinc-300">&quot;Add to Home Screen&quot;</span>. Open the app from your home screen {"—"} alerts will work automatically.
					</p>
				</div>
			)}

			{/* Twitter Timeline — rendered by widgets.js in user's browser */}
			<div ref={containerRef}>
				<a
					className="twitter-timeline"
					data-theme="dark"
					data-dnt="true"
					href="https://twitter.com/f1_naija"
				>
					Tweets by @f1_naija
				</a>
			</div>

			<p className="pb-4 text-center text-xs text-zinc-700">
				Powered by F1 Naija ·{" "}
				<a href="https://twitter.com/f1_naija" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500">@f1_naija</a>
			</p>
		</div>
	);
}
