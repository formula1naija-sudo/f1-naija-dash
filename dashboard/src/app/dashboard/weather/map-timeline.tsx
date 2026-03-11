"use client";

import { unix } from "moment";
import { motion, useMotionValue, useDragControls, AnimatePresence } from "motion/react";

import { useState, useRef, useEffect, type RefObject } from "react";

function getProgressFromX<T extends HTMLElement>({
	x,
	containerRef,
}: {
	x: number;
	containerRef: RefObject<T | null>;
}) {
	const bounds = containerRef.current?.getBoundingClientRect();

	if (!bounds) return 0;

	const progress = (x - bounds.x) / bounds.width;
	return clamp(progress, 0, 1);
}

function getXFromProgress<T extends HTMLElement>({
	progress,
	containerRef,
}: {
	progress: number;
	containerRef: RefObject<T | null>;
}) {
	const bounds = containerRef.current?.getBoundingClientRect();

	if (!bounds) return 0;

	return progress * bounds.width;
}

function clamp(number: number, min: number, max: number) {
	return Math.max(min, Math.min(number, max));
}

function useInterval(callback: () => void, delay: number | null) {
	const intervalRef = useRef<null | NodeJS.Timeout>(null);
	const savedCallback = useRef(callback);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const tick = () => savedCallback.current();

		if (typeof delay === "number") {
			intervalRef.current = setInterval(tick, delay);

			return () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
			};
		}
	}, [delay]);

	return intervalRef;
}

type Props = {
	frames: {
		id: number;
		time: number;
	}[];

	setFrame: (id: number) => void;

	playing: boolean;
	setPlaying: (fn: (v: boolean) => boolean) => void;
};

export default function Timeline({ frames, setFrame, playing, setPlaying }: Props) {
	const constraintsRef = useRef<HTMLDivElement | null>(null);
	const fullBarRef = useRef<null | HTMLDivElement>(null);
	const scrubberRef = useRef<null | HTMLButtonElement>(null);

	const scrubberX = useMotionValue(0);
	const currentTimePrecise = useMotionValue(0);
	const dragControls = useDragControls();

	const [dragging, setDragging] = useState<boolean>(false);
	const [time, setTime] = useState<number>(0);

	const startTime = frames[0].time;
	const endTime = frames[frames.length - 1].time;
	const DURATION = endTime - startTime;

	const currentTime = startTime + time;

	/* ── NOW marker position ── */
	// eslint-disable-next-line react-hooks/purity
	const nowUnix = Math.floor(Date.now() / 1000);
	const nowProgress = clamp((nowUnix - startTime) / DURATION, 0, 1);

	/* ── Frame selection ── */
	useEffect(() => {
		const targetTime = startTime + time;
		const nearestFrame = frames.findLast((frame) => frame.time <= targetTime);
		if (nearestFrame) {
			setFrame(nearestFrame.id);
		}
	}, [time, frames, setFrame, startTime]);

	/* ── Playback: advance 10 min every 0.5s ── */
	useInterval(
		() => {
			if (time < DURATION) {
				setTime((t) => t + 10 * 60);
			} else {
				setTime(0);
			}
		},
		playing ? 500 : null,
	);

	/* ── Smooth scrubber animation: advance 12s every 10ms ── */
	useInterval(
		() => {
			if (currentTimePrecise.get() < DURATION) {
				currentTimePrecise.set(currentTimePrecise.get() + 0.2 * 60);
				const newX = getXFromProgress({
					containerRef: fullBarRef,
					progress: currentTimePrecise.get() / DURATION,
				});
				scrubberX.set(newX);
			} else {
				currentTimePrecise.set(0);
				scrubberX.set(0);
			}
		},
		playing ? 10 : null,
	);

	/* ── Skip helpers ── */
	const skip = (deltaSecs: number) => {
		const newTime = clamp(time + deltaSecs, 0, DURATION);
		setTime(newTime);
		currentTimePrecise.set(newTime);
		const newX = getXFromProgress({
			containerRef: fullBarRef,
			progress: newTime / DURATION,
		});
		scrubberX.set(newX);
	};

	/* ── Timeline legend (10 ticks) ── */
	const legendCount = 6;
	const timeInterval = DURATION / (legendCount - 1);

	return (
		<div className="relative w-full select-none">
			{/* ── Scrubber bar ── */}
			<div
				className="relative mt-1"
				onPointerDown={(event) => {
					const newProgress = getProgressFromX({
						containerRef: fullBarRef,
						x: event.clientX,
					});
					dragControls.start(event, { snapToCursor: true });
					const newTime = Math.floor(newProgress * DURATION);
					setTime(newTime);
					currentTimePrecise.set(newTime);
				}}
			>
				{/* Track */}
				<div ref={fullBarRef} className="relative h-1 w-full rounded-full bg-zinc-800">
					{/* Progress fill */}
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							height: "100%",
							width: `${(time / DURATION) * 100}%`,
							background: "linear-gradient(90deg,#00d484,rgba(0,212,132,0.5))",
							borderRadius: 99,
							transition: "width 0.4s linear",
						}}
					/>

					{/* NOW marker */}
					{nowProgress > 0 && nowProgress < 1 && (
						<div
							style={{
								position: "absolute",
								top: -6,
								bottom: -6,
								left: `${nowProgress * 100}%`,
								width: 1,
								background: "#f5a724",
								transform: "translateX(-50%)",
							}}
						>
							<span
								style={{
									position: "absolute",
									top: -16,
									left: "50%",
									transform: "translateX(-50%)",
									fontSize: 8,
									fontWeight: 700,
									color: "#f5a724",
									letterSpacing: ".06em",
									whiteSpace: "nowrap",
								}}
							>
								NOW
							</span>
						</div>
					)}
				</div>

				{/* Scrubber handle */}
				<div className="absolute inset-0" ref={constraintsRef}>
					<motion.button
						className="absolute flex cursor-ew-resize items-center justify-center rounded-full active:cursor-grabbing"
						ref={scrubberRef}
						drag="x"
						dragConstraints={constraintsRef}
						dragControls={dragControls}
						dragElastic={0}
						dragMomentum={false}
						style={{ x: scrubberX }}
						onDrag={() => {
							if (!scrubberRef.current) return;
							const scrubberBounds = scrubberRef.current.getBoundingClientRect();
							const middleOfScrubber = scrubberBounds.x + scrubberBounds.width / 2;
							const newProgress = getProgressFromX({
								containerRef: fullBarRef,
								x: middleOfScrubber,
							});

							setTime(Math.floor(newProgress * DURATION));
							currentTimePrecise.set(newProgress * DURATION);
						}}
						onDragStart={() => setDragging(true)}
						onPointerDown={() => setDragging(true)}
						onPointerUp={() => setDragging(false)}
						onDragEnd={() => setDragging(false)}
					>
						<motion.div
							animate={{ scale: dragging ? 1.2 : 1 }}
							transition={{ type: "tween", duration: 0.15 }}
							initial={false}
							className="-mt-2 h-5 w-2 rounded-full bg-zinc-300"
						/>

						<AnimatePresence>
							{dragging && (
								<motion.p
									className="absolute text-sm font-medium tracking-wide tabular-nums"
									initial={{ y: 12, opacity: 0 }}
									animate={{ y: 20, opacity: 1 }}
									exit={{ y: [20, 12], opacity: 0 }}
								>
									{unix(currentTime).format("HH:mm")}
								</motion.p>
							)}
						</AnimatePresence>
					</motion.button>
				</div>
			</div>

			{/* ── Timestamps legend ── */}
			<div className="mt-4 flex flex-row justify-between">
				{Array.from({ length: legendCount }).map((_, i) => {
					const legendTime = startTime + i * timeInterval;
					const isNow = Math.abs(legendTime - nowUnix) < timeInterval / 2 && i > 0 && i < legendCount - 1;
					return (
						<div
							key={i}
							style={{
								fontSize: 10,
								fontWeight: isNow ? 700 : 500,
								color: isNow ? "#f5a724" : "#52525b",
							}}
						>
							{isNow ? "NOW" : unix(legendTime).format("HH:mm")}
						</div>
					);
				})}
			</div>

			{/* ── Playback controls ── */}
			<div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
				{/* Play / Pause */}
				<button
					onClick={() => setPlaying((v) => !v)}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 6,
						padding: "5px 14px",
						borderRadius: 6,
						background: playing ? "rgba(0,212,132,0.15)" : "rgba(0,212,132,0.1)",
						border: `1px solid ${playing ? "rgba(0,212,132,0.5)" : "rgba(0,212,132,0.2)"}`,
						cursor: "pointer",
						fontSize: 11,
						fontWeight: 700,
						color: "#00d484",
						letterSpacing: ".04em",
					}}
				>
					<span style={{ fontSize: 10 }}>{playing ? "⏸" : "▶"}</span>
					{playing ? "Pause" : "Play"}
				</button>

				{/* ◀◀ -30m */}
				<button
					onClick={() => skip(-30 * 60)}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						padding: "5px 12px",
						borderRadius: 6,
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						cursor: "pointer",
						fontSize: 11,
						fontWeight: 600,
						color: "rgba(255,255,255,0.5)",
						letterSpacing: ".02em",
					}}
				>
					<span style={{ fontSize: 10 }}>⏮</span>
					-30m
				</button>

				{/* ▶▶ +30m */}
				<button
					onClick={() => skip(30 * 60)}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						padding: "5px 12px",
						borderRadius: 6,
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						cursor: "pointer",
						fontSize: 11,
						fontWeight: 600,
						color: "rgba(255,255,255,0.5)",
						letterSpacing: ".02em",
					}}
				>
					+30m
					<span style={{ fontSize: 10 }}>⏭</span>
				</button>
			</div>
		</div>
	);
}
