import type { Stint } from "@/types/state.type";

type Props = {
	stints: Stint[] | undefined;
};

const compoundConfig: Record<string, { letter: string; color: string; bg: string; border: string }> = {
	soft: { letter: "S", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.5)" },
	medium: { letter: "M", color: "#f5a724", bg: "rgba(245,167,36,0.12)", border: "rgba(245,167,36,0.5)" },
	hard: { letter: "H", color: "#a1a1aa", bg: "rgba(161,161,170,0.12)", border: "rgba(161,161,170,0.4)" },
	intermediate: { letter: "I", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.5)" },
	wet: { letter: "W", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.5)" },
};

export default function DriverTire({ stints }: Props) {
	const currentStint = stints ? stints[stints.length - 1] : null;
	const compound = currentStint?.Compound?.toLowerCase() ?? "";
	const cfg = compoundConfig[compound];

	if (!currentStint) {
		return (
			<div style={{ display: "flex", alignItems: "center", gap: 5 }}>
				<div
					style={{
						width: 20, height: 20, borderRadius: "50%",
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						animation: "pulse 1.5s infinite",
					}}
				/>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
			{/* Compound circle */}
			<div
				style={{
					width: 20, height: 20, borderRadius: "50%",
					display: "flex", alignItems: "center", justifyContent: "center",
					background: cfg?.bg ?? "rgba(113,113,122,0.12)",
					border: `1px solid ${cfg?.border ?? "rgba(113,113,122,0.4)"}`,
					fontSize: 9, fontWeight: 900,
					color: cfg?.color ?? "#71717a",
					flexShrink: 0,
					letterSpacing: 0,
				}}
			>
				{cfg?.letter ?? "?"}
			</div>

			{/* Lap count */}
			<div>
				<p style={{ fontSize: 11, fontWeight: 700, lineHeight: 1, color: "var(--f1-text)", whiteSpace: "nowrap" }}>
					L {currentStint.TotalLaps ?? 0}{currentStint.New ? "" : <span style={{ color: "#52525b" }}>*</span>}
				</p>
			</div>
		</div>
	);
}
