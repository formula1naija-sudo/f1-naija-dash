"use client";

import { useEffect, useState, useRef } from "react";

type NotifStatus = "idle" | "subscribed" | "denied" | "unsupported" | "ios-pwa-required";

export default function NewsPage() {
	const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");
	const embedRef = useRef<HTMLDivElement>(null);
	const [embedLoaded, setEmbedLoaded] = useState(false);
	const [embedError, setEmbedError] = useState(false);

	// Load Twitter embed widget
	useEffect(() => {
		const loadTwitterEmbed = () => {
			if ((window as any).twttr && (window as any).twttr.widgets) {
				(window as any).twttr.widgets.load(embedRef.current);
				setEmbedLoaded(true);
				return;
			}

			const script = document.createElement("script");
			script.src = "https://platform.twitter.com/widgets.js";
			script.async = true;
			script.charset = "utf-8";
			script.onload = () => {
				setEmbedLoaded(true);
			};
			script.onerror = () => {
				setEmbedError(true);
			};
			document.head.appendChild(script);
		};

		loadTwitterEmbed();

		// Timeout: if embed hasn't loaded in 10s, show error
		const timeout = setTimeout(() => {
			if (!embedLoaded) setEmbedError(true);
		}, 10000);

		return () => clearTimeout(timeout);
	}, []);

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

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
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
					<span className="text-xs text-zinc-400 text-right max-w-[140px] leading-tight">
						Add to Home Screen for alerts
					</span>
				)}
			</div>

			{notifStatus === "ios-pwa-required" && (
				<div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
					<p className="text-sm font-semibold text-white mb-2">{"📱"} Get alerts on iPhone / iPad</p>
					<p className="text-xs text-zinc-400 leading-relaxed">
						iOS only supports push notifications for apps added to your home screen. In Safari, tap the{" "}
						<span className="font-semibold text-zinc-300">Share</span> button {"⬆️"}, then choose{" "}
						<span className="font-semibold text-zinc-300">&quot;Add to Home Screen&quot;</span>. Open the app from
						your home screen {"—"} alerts will work automatically.
					</p>
				</div>
			)}

			{/* Twitter Embedded Timeline - loads directly from user's browser */}
			<div ref={embedRef} className="min-h-[600px] rounded-xl overflow-hidden">
				{!embedLoaded && !embedError && (
					<div className="flex flex-col gap-3">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="animate-pulse rounded-xl border border-zinc-800 p-4">
								<div className="flex gap-3">
									<div className="h-9 w-9 rounded-full bg-zinc-800" />
									<div className="flex-1 space-y-2">
										<div className="h-3 w-1/3 rounded bg-zinc-800" />
										<div className="h-3 w-full rounded bg-zinc-800" />
										<div className="h-3 w-2/3 rounded bg-zinc-800" />
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{embedError && (
					<div className="rounded-xl border border-zinc-800 p-8 text-center">
						<p className="text-zinc-400 text-sm mb-3">
							Could not load the tweet feed. You might have an ad blocker preventing Twitter embeds.
						</p>
						<a
							href="https://twitter.com/f1_naija"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-green-400"
						>
							View @f1_naija on X
						</a>
					</div>
				)}

				<a
					className="twitter-timeline"
					data-theme="dark"
					data-chrome="noheader nofooter noborders transparent"
					data-tweet-limit="15"
					href="https://twitter.com/f1_naija?ref_src=twsrc%5Etfw"
				>
					Loading tweets...
				</a>
			</div>

			<p className="pb-4 text-center text-xs text-zinc-700">
				Powered by F1 Naija
			</p>
		</div>
	);
}
