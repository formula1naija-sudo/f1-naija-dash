"use client";

import { useEffect, useRef, useState } from "react";

import maplibregl, { Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { fetchCoords } from "@/lib/geocode";
import { getRainviewer } from "@/lib/rainviewer";

import { useDataStore } from "@/stores/useDataStore";

import Timeline from "./map-timeline";

export function WeatherMap() {
	const meeting = useDataStore((state) => state.state?.SessionInfo?.Meeting);

	const [loading, setLoading] = useState<boolean>(true);

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Map>(null);

	const [playing, setPlaying] = useState<boolean>(false);

	const [frames, setFrames] = useState<{ id: number; time: number }[]>([]);
	const currentFrameRef = useRef<number>(0);

	const handleMapLoad = async () => {
		if (!mapRef.current) return;

		const rainviewer = await getRainviewer();
		if (!rainviewer) return;

		const pathFrames = [...rainviewer.radar.past, ...rainviewer.radar.nowcast];

		for (let i = 0; i < pathFrames.length; i++) {
			const frame = pathFrames[i];

			mapRef.current.addLayer({
				id: `rainviewer-frame-${i}`,
				type: "raster",
				source: {
					type: "raster",
					tiles: [`${rainviewer.host}/${frame.path}/256/{z}/{x}/{y}/8/1_0.webp`],
					tileSize: 256,
				},
				paint: {
					"raster-opacity": 0,
					"raster-fade-duration": 200,
					"raster-resampling": "nearest",
				},
			});
		}

		setFrames(pathFrames.map((frame, i) => ({ time: frame.time, id: i })));
	};

	useEffect(() => {
		if (!mapContainerRef.current || !meeting) return;

		let cancelled = false;
		let libMap: Map | null = null;

		(async () => {
			const [coordsC, coordsA] = await Promise.all([
				fetchCoords(`${meeting.Country.Name}, ${meeting.Location} circuit`),
				fetchCoords(`${meeting.Country.Name}, ${meeting.Location} autodrome`),
			]);

			if (cancelled) return;

			const coords = coordsC || coordsA;

			libMap = new maplibregl.Map({
				container: mapContainerRef.current!,
				style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
				center: coords ? [coords.lon, coords.lat] : undefined,
				zoom: 10,
				canvasContextAttributes: {
					antialias: true,
				},
			});

			mapRef.current = libMap;

			libMap.on("load", async () => {
				if (cancelled) return;
				setLoading(false);

				if (coords) {
					new Marker().setLngLat([coords.lon, coords.lat]).addTo(libMap!);
				}

				await handleMapLoad();
			});
		})();

		return () => {
			cancelled = true;
			libMap?.remove();
			mapRef.current = null;
		};
	}, [meeting]);

	const setFrame = (idx: number) => {
		mapRef.current?.setPaintProperty(`rainviewer-frame-${currentFrameRef.current}`, "raster-opacity", 0);
		mapRef.current?.setPaintProperty(`rainviewer-frame-${idx}`, "raster-opacity", 0.8);
		currentFrameRef.current = idx;
	};

	/* Location label: "MELBOURNE · ALBERT PARK" */
	const locationLabel = meeting
		? `${meeting.Location.toUpperCase()} · ${meeting.Circuit.ShortName.toUpperCase()}`
		: null;

	return (
		<div className="relative h-full w-full">
			<div ref={mapContainerRef} className="absolute h-full w-full" />

			{/* ── Top-left: location ── */}
			{locationLabel && (
				<div
					style={{
						position: "absolute",
						top: 12,
						left: 12,
						zIndex: 20,
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: ".1em",
						color: "rgba(255,255,255,0.7)",
						background: "rgba(0,0,0,0.55)",
						backdropFilter: "blur(6px)",
						padding: "4px 10px",
						borderRadius: 6,
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				>
					{locationLabel}
				</div>
			)}

			{/* ── Top-right: compass ── */}
			<button
				onClick={() => mapRef.current?.resetNorth()}
				style={{
					position: "absolute",
					top: 12,
					right: 12,
					zIndex: 20,
					display: "flex",
					alignItems: "center",
					gap: 4,
					padding: "4px 10px",
					borderRadius: 6,
					background: "rgba(0,0,0,0.55)",
					backdropFilter: "blur(6px)",
					border: "1px solid rgba(255,255,255,0.08)",
					cursor: "pointer",
					fontSize: 11,
					fontWeight: 700,
					color: "rgba(255,255,255,0.7)",
					letterSpacing: ".06em",
				}}
			>
				N <span style={{ fontSize: 10 }}>↑</span>
			</button>

			{/* ── Bottom: RADAR TIMELINE panel ── */}
			{!loading && frames.length > 0 && (
				<div
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						zIndex: 20,
						margin: 8,
						borderRadius: 10,
						background: "rgba(0,0,0,0.82)",
						backdropFilter: "blur(8px)",
						border: "1px solid rgba(255,255,255,0.07)",
						overflow: "hidden",
					}}
				>
					{/* Panel header */}
					<div
						style={{
							padding: "8px 14px 4px",
							fontSize: 9,
							fontWeight: 700,
							letterSpacing: ".14em",
							textTransform: "uppercase",
							color: "#52525b",
						}}
					>
						Radar Timeline · Past 2h — Nowcast +1h
					</div>

					{/* Timeline + controls */}
					<div style={{ padding: "2px 14px 12px" }}>
						<Timeline
							frames={frames}
							setFrame={setFrame}
							playing={playing}
							setPlaying={setPlaying}
						/>
					</div>
				</div>
			)}

			{loading && (
				<div className="h-full w-full animate-pulse rounded-lg bg-zinc-800" />
			)}
		</div>
	);
}
