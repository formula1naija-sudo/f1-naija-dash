import type { CarsData, Positions, State } from "@/types/state.type";

import { useDataStore } from "@/stores/useDataStore";

type Fns = {
	updateState: (state: State) => void;
	updatePosition: (pos: Positions) => void;
	updateCarData: (car: CarsData) => void;
};

export const useStores = (): Fns => {
	// Select only the stable action functions — NOT the full store object.
	// Subscribing to the whole store (useDataStore()) would cause DashboardLayout
	// to re-render on every SSE tick (5×/sec). Actions are stable Zustand refs
	// and never change, so these selectors never trigger a re-render.
	const setState    = useDataStore((s) => s.setState);
	const setPositions = useDataStore((s) => s.setPositions);
	const setCarsData  = useDataStore((s) => s.setCarsData);

	return {
		updateState:    setState,
		updatePosition: setPositions,
		updateCarData:  setCarsData,
	};
};
