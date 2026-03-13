import { useCallback, useEffect, useRef, useState } from "react";

import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { env } from "@/env";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
	const [connected, setConnected] = useState<boolean>(false);
	const sseRef = useRef<EventSource | null>(null);

	// openSSE is stable across renders — used both inside the effect and
	// exposed as `reconnect` so the UI can trigger a manual retry.
	const openSSE = useCallback(() => {
		sseRef.current?.close();

		const sse = new EventSource(`${env.NEXT_PUBLIC_LIVE_URL}/api/realtime`);
		sseRef.current = sse;

		sse.onerror = () => setConnected(false);
		sse.onopen  = () => setConnected(true);

		sse.addEventListener("initial", (message) => {
			handleInitial(JSON.parse(message.data));
		});

		sse.addEventListener("update", (message) => {
			handleUpdate(JSON.parse(message.data));
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		openSSE();

		// Mobile browsers (especially iOS) kill SSE connections in background tabs.
		// Force-reconnect the moment the tab becomes visible so users always see
		// fresh live data without needing to reload the page manually.
		const onVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				sseRef.current?.readyState === EventSource.CLOSED
			) {
				openSSE();
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			sseRef.current?.close();
		};
	}, [openSSE]);

	return { connected, reconnect: openSSE };
};
