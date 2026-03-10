type Props = {
	on: boolean;
	possible: boolean;
	inPit: boolean;
	pitOut: boolean;
};

export default function DriverDRS({ on, possible, inPit, pitOut }: Props) {
	const pit = inPit || pitOut;

	const style: React.CSSProperties = pit
		? {
				border: "1px solid rgba(245,167,36,0.6)",
				color: "#f5a724",
				background: "rgba(245,167,36,0.08)",
			}
		: on
			? {
					border: "1px solid rgba(0,212,132,0.7)",
					color: "#00d484",
					background: "rgba(0,212,132,0.12)",
				}
			: possible
				? {
						border: "1px solid rgba(245,167,36,0.4)",
						color: "rgba(245,167,36,0.6)",
						background: "transparent",
					}
				: {
						border: "1px solid rgba(63,63,70,0.7)",
						color: "#3f3f46",
						background: "transparent",
					};

	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				height: 22,
				width: 44,
				borderRadius: 4,
				fontSize: 9,
				fontWeight: 800,
				fontFamily: "monospace",
				letterSpacing: ".06em",
				flexShrink: 0,
				...style,
			}}
		>
			{pit ? "PIT" : "DRS"}
		</span>
	);
}
