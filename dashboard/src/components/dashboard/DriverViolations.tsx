import type { Driver, TimingData } from "@/types/state.type";

import { calculatePosition } from "@/lib/calculatePosition";

import DriverTag from "@/components/driver/DriverTag";

type Props = {
	driver: Driver;
	driverViolations: number;
	maxViolations: number;
	driversTiming: TimingData | undefined;
};

export default function DriverViolations({ driver, driverViolations, maxViolations, driversTiming }: Props) {
	const pct = maxViolations > 0 ? (driverViolations / maxViolations) * 100 : 0;

	return (
		<div className="flex items-center gap-2 px-2 py-2" key={`violation.${driver.RacingNumber}`}>
			<DriverTag className="h-fit shrink-0" teamColor={driver.TeamColour} short={driver.Tla} />

			<div className="flex min-w-0 flex-1 items-center gap-2">
				<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
					<div
						className="h-full rounded-full transition-all duration-500"
						style={{ width: `${pct}%`, background: "#e8001f" }}
					/>
				</div>
				<span className="w-4 shrink-0 text-right text-sm font-semibold" style={{ color: "#e8001f" }}>
					{driverViolations}
				</span>
			</div>

			{driverViolations > 4 && driversTiming && (
				<p className="shrink-0 text-xs text-zinc-500">
					{calculatePosition(Math.round(driverViolations / 5) * 5, driver.RacingNumber, driversTiming)}th
				</p>
			)}
		</div>
	);
}
