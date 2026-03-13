"use client";

import { useEffect, useRef, useState, startTransition } from "react";

import type { CarData, CarsData, Position, Positions, State } from "@/types/state.type";
import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { inflate } from "@/lib/inflate";
import { utcToLocalMs } from "@/lib/utcToLocalMs";

import { useSettingsStore } from "@/stores/useSettingsStore";

import { useBuffer } from "@/hooks/useBuffer";
import { useStatefulBuffer } from "@/hooks/useStatefulBuffer";

const UPDATE_MS = 200;

type Props = {
	updateState: (state: State) => void;
	updatePosition: (pos: Positions) => void;
	updateCarData: (car: CarsData) => void;
};

export const useDataEngine = ({ updateState, updatePosition, updateCarData }: Props) => {
	const buffers = {
		ExtrapolatedClock: useStatefulBuffer(),
		TopThree: useStatefulBuffer(),
		TimingStats: useStatefulBuffer(),
		TimingAppData: useStatefulBuffer(),
		WeatherData: useStatefulBuffer(),
		TrackStatus: useStatefulBuffer(),
		SessionStatus: useStatefulBuffer(),
		DriverList: useStatefulBuffer(),
		RaceControlMessages: useStatefulBuffer(),
		SessionInfo: useStatefulBuffer(),
		SessionData: useStatefulBuffer(),
		LapCount: useStatefulBuffer(),
		TimingData: useStatefulBuffer(),
		TeamRadio: useStatefulBuffer(),
		ChampionshipPrediction: useStatefulBuffer(),
	};

	const carBuffer = useBuffer<CarsData>();
	const posBuffer = useBuffer<Positions>();

	const [maxDelay, setMaxDelay] = useState<number>(0);

	const delayRef = useRef<number>(0);

	useEffect(() => {
		const unsub = useSettingsStore.subscribe(
			(state) => state.delay,
			(delay) => (delayRef.current = delay),
			{ fireImmediately: true },
		);
		return unsub;
	}, []);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleInitial = ({ CarDataZ: carZ, PositionZ: posZ, ...initial }: MessageInitial) => {
		updateState(initial);

		Object.keys(buffers).forEach((key) => {
			const data = initial[key as keyof typeof initial];
			const buffer = buffers[key as keyof typeof buffers];
			if (data) buffer.push(data);
		});

		if (carZ) {
			try {
				const carData = inflate<CarData>(carZ);
				updateCarData(carData.Entries[0].Cars);

				for (const entry of carData.Entries) {
					carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
				}
			} catch (e) {
				console.error("[useDataEngine] Failed to decompress carZ (initial):", e);
			}
		}

		if (posZ) {
			try {
				const position = inflate<Position>(posZ);
				updatePosition(position.Position[0].Entries);

				for (const entry of position.Position) {
					posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
				}
			} catch (e) {
				console.error("[useDataEngine] Failed to decompress posZ (initial):", e);
			}
		}
	};

	const handleUpdate = ({ CarDataZ: carZ, PositionZ: posZ, ...update }: MessageUpdate) => {
		Object.keys(buffers).forEach((key) => {
			const data = update[key as keyof typeof update];
			const buffer = buffers[key as keyof typeof buffers];
			if (data) buffer.push(data);
		});

		if (carZ) {
			try {
				const carData = inflate<CarData>(carZ);
				for (const entry of carData.Entries) {
					carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
				}
			} catch (e) {
				console.error("[useDataEngine] Failed to decompress carZ (update):", e);
			}
		}

		if (posZ) {
			try {
				const position = inflate<Position>(posZ);
				for (const entry of position.Position) {
					posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
				}
			} catch (e) {
				console.error("[useDataEngine] Failed to decompress posZ (update):", e);
			}
		}
	};

	const handleCurrentState = () => {
		const delay = delayRef.current;

		// ── Step 1: collect the next data frame from buffers (pure reads, no React) ──
		const newStateFrame: Record<string, State[keyof State]> = {};
		let newCarFrame: CarsData | null = null;
		let newPosFrame: Positions | null = null;

		if (delay === 0) {
			Object.keys(buffers).forEach((key) => {
				const buffer = buffers[key as keyof typeof buffers];
				const latest = buffer.latest() as State[keyof State];
				if (latest) newStateFrame[key] = latest;
			});

			newCarFrame = carBuffer.latest();
			newPosFrame = posBuffer.latest();
		} else {
			const delayedTimestamp = Date.now() - delay * 1000;

			Object.keys(buffers).forEach((key) => {
				const buffer = buffers[key as keyof typeof buffers];
				const delayed = buffer.delayed(delayedTimestamp) as State[keyof State];
				if (delayed) newStateFrame[key] = delayed;
				setTimeout(() => buffer.cleanup(delayedTimestamp), 0);
			});

			newCarFrame = carBuffer.delayed(delayedTimestamp);
			if (newCarFrame) setTimeout(() => carBuffer.cleanup(delayedTimestamp), 0);

			newPosFrame = posBuffer.delayed(delayedTimestamp);
			if (newPosFrame) setTimeout(() => posBuffer.cleanup(delayedTimestamp), 0);
		}

		// ── Step 2: push to React as a background transition ─────────────────────────
		// startTransition marks these 200ms data ticks as non-urgent. React keeps the
		// current UI visible while preparing the next render in the background, which
		// eliminates visible flicker and lets user interactions (scroll, tap) stay
		// responsive even while live data is streaming in.
		startTransition(() => {
			updateState(newStateFrame);
			if (newCarFrame) updateCarData(newCarFrame);
			if (newPosFrame) updatePosition(newPosFrame);
		});

		// ── Step 3: update maxDelay synchronously (it's UI metadata, not bulk data) ──
		// Filter out 0-delay buffers (no timed data yet), then find the minimum.
		// Without the empty-array guard, Math.min(...[]) returns Infinity, which
		// would make the delay display show "∞" until the first timed frames arrive.
		const delayValues = Object.values(buffers)
			.map((buffer) => buffer.maxDelay())
			.filter((d) => d > 0);
		setMaxDelay(delayValues.length > 0 ? Math.min(...delayValues) : 0);
	};

	useEffect(() => {
		intervalRef.current = setInterval(handleCurrentState, UPDATE_MS);
		return () => (intervalRef.current ? clearInterval(intervalRef.current) : void 0);
		// TODO investigate if this might have performance issues
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		handleUpdate,
		handleInitial,
		maxDelay,
	};
};
