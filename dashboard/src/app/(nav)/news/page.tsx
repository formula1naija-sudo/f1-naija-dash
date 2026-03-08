"use client";

import { useEffect, useState } from "react";

type NotifStatus = "idle" | "subscribed" | "denied" | "unsupported" | "ios-pwa-required";

export default function NewsPage() {
	const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");
	const [iframeLoaded, setIframeLoaded] = useState(false);

	// Notification status detection
	useEffect(() => {
		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;

		if (isIOS && !isStandalone) {
			setNotifStatus("ios-pwa-required");
			return;
		}

		if (!("Notification" in window)) {
			setNotifStatus("unsupported");
		} else if (Notification.permission === "granted") {
			setNotifStatus("subscribed");
		} else if (Notification.permission === "denied") {
			setNotifStatus("denied");
		}
	}, []);

	async function subscribeToNotifications() {
		if (!("Notification" in window) || !("serviceWorker" in navigator)) {
			setNotifStatus("unsupported");
			return;
		}
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			setNotifStatus("denied");
			return;
		}
		try {
			const reg = await navigator.serviceWorker.ready;
			const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: vapidKey,
			});
			await fetch("/api/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(sub),
			});
			setNotifStatus("subscribed");
		} catch (err) {
			console.error("Push subscribe error:", err);
			setNotifStatus("denied");
		}
	}

	async function unsubscribeFromNotifications() {
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				await fetch("/api/subscribe", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ endpoint: sub.endpoint }),
				});
				await sub.unsubscribe();
			}
			setNotifStatus("idle");
		} catch (err) {
			console.error("Unsubscribe error:", err);
		}
	}

	// Twitter syndication embed URL — loads directly in user's browser, bypasses server IP blocks
	const embedUrl =
		"https://syndication.twitter.com/srv/timeline-profile/screen-name/f1_naija" +
		"?lang=en&dnt=true&theme=dark&chrome=noheader%2Cnofooter%2Cnoborders%2Ctransparent&maxHeight=800px";

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl text-white">News</h1>
					<p className="mt-0.5 text-sm text-zinc-500">
						Live F1 updates from{" "}
						<a
							href="https://twitter.com/f1_naija"
							target="_blank"
							rel="noopener noreferrer"
							className="text-zinc-400 transition-colors hover:text-white"
						>
							@f1_naija
						</a>
					</p>
				</div>

				{notifStatus === "idle" && (
					<button
						onClick={subscribeToNotifications}
						className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-green-400"
					>
						Enable Alerts
					</button>
				)}
				{notifStatus === "subscribed" && (
					<button
						onClick={unsubscribeFromNotifications}
						className="text-sm font-medium text-green-400 transition-colors hover:text-zinc-400"
						title="Click to turn off notifications"
					>
						{"✓"} Alerts on
					</button>
				)}
				{notifStatus === "denied" && (
					<span className="text-sm text-zinc-500">Notifications blocked</span>
				)}
				{notifStatus === "unsupported" && (
					<span className="text-sm text-zinc-500">Push not supported</span>
				)}
				{notifStatus === "ios-pwa-required" && (
					<span className="text-xs text-right max-w-[140px] leading-tight text-zinc-400">
						Add to Home Screen for alerts
					</span>
				)}
			</div>

			{/* iOS PWA instruction */}
			{notifStatus === "ios-pwa-required" && (
				<div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
					<p className="text-sm font-semibold text-white mb-2">{"📱"} Get alerts on iPhone / iPad</p>
					<p className="text-xs text-zinc-400 leading-relaxed">
						iOS only supports push notifications for apps added to your home screen. In Safari, tap the{" "}
						<span className="font-semibold text-zinc-300">Share</span> button {"⬆️"}, then choose{" "}
						<span className="font-semibold text-zinc-300">&quot;Add to Home Screen&quot;</span>. Open the
						app from your home screen {"—"} alerts will work automatically.
					</p>
				</div>
			)}

			{/* Twitter timeline embed — loads in user's browser directly from Twitter */}
			<div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black min-h-[400px]">
				{!iframeLoaded && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex flex-col items-center gap-3 text-zinc-500">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-green-400" />
							<span className="text-sm">Loading tweets...</span>
						</div>
					</div>
				)}
				<iframe
					src={embedUrl}
					className="w-full border-0"
					style={{ minHeight: "600px", background: "transparent" }}
					onLoad={() => setIframeLoaded(true)}
					title="F1 Naija tweets"
					scrolling="no"
				/>
			</div>

			<p className="pb-4 text-center text-xs text-zinc-700">
				Powered by F1 Naija · <a href="https://twitter.com/f1_naija" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500">@f1_naija</a>
			</p>
		</div>
	);
}
