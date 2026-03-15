import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageInitial, MessageUpdate } from "@/types/message.type";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
	const [connected, setConnected] = useState<boolean>(false);
	const sseRef = useRef<EventSource | null>(null);

	// Keep callback refs in sync so openSSE always calls the latest version
	// without needing to recreate the EventSource on every render.
	const handleInitialRef = useRef(handleInitial);
	const handleUpdateRef = useRef(handleUpdate);
	useEffect(() => { handleInitialRef.current = handleInitial; }, [handleInitial]);
	useEffect(() => { handleUpdateRef.current = handleUpdate; }, [handleUpdate]);

	// openSSE is stable across renders — used both inside the effect and
	// exposed as `reconnect` so the UI can trigger a manual retry.
	// Reads callbacks through refs, so the empty dep array is safe (no stale closures).
	const openSSE = useCallback(() => {
		sseRef.current?.close();

		const sse = new EventSource('/api/realtime');
		sseRef.current = sse;

		sse.onerror = () => setConnected(false);
		sse.onopen = () => setConnected(true);

		sse.addEventListener("initial", (message) => {
			handleInitialRef.current(JSON.parse(message.data));
		});

		sse.addEventListener("update", (message) => {
			handleUpdateRef.current(JSON.parse(message.data));
		});
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
