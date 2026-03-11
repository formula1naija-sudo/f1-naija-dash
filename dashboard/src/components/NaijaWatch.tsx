"use client";

/**
 * Naija Watch — Nigerian talent spotlight component.
 *
 * Highlights Nigerian and dual-heritage drivers on the path to Formula 1.
 * Data is static but structured so it can be driven from a CMS or API later.
 */

type Prospect = {
	name: string;
	series: string;
	team: string;
	season: string;
	flag: string;
	note: string;
	accent: string;
};

const PROSPECTS: Prospect[] = [
	{
		name: "Umar Masood",
		series: "Formula Regional Middle East",
		team: "ART Grand Prix",
		season: "2024/25",
		flag: "🇳🇬",
		note: "First full-Nigerian driver racing single-seaters at regional F3 level",
		accent: "#008751",
	},
	{
		name: "Niyi Oluwo",
		series: "F4 UAE Championship",
		team: "TBC",
		season: "2025",
		flag: "🇳🇬",
		note: "Lagos-born talent competing on the Formula 4 ladder",
		accent: "#00d484",
	},
	{
		name: "Nigerian Academy Watch",
		series: "Various junior series",
		team: "—",
		season: "2025+",
		flag: "🇳🇬",
		note: "Monitor f1naija.com for updates on emerging Nigerian karting & F4 prospects",
		accent: "#f5a724",
	},
];

export default function NaijaWatch() {
	return (
		<div style={{ padding: "14px 16px" }}>
			{/* Header */}
			<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
				<div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
					<div style={{ width: 3, height: 16, borderRadius: 1, background: "#008751" }} />
					<div style={{ width: 3, height: 16, borderRadius: 1, background: "#ffffff18" }} />
					<div style={{ width: 3, height: 16, borderRadius: 1, background: "#008751" }} />
				</div>
				<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
					Naija Watch 🇳🇬
				</h2>
				<span style={{
					marginLeft: "auto",
					fontSize: 8, fontWeight: 700, letterSpacing: ".1em",
					textTransform: "uppercase", color: "#008751",
					background: "rgba(0,135,81,0.12)",
					border: "1px solid rgba(0,135,81,0.3)",
					padding: "2px 6px", borderRadius: 3,
				}}>
					Road to F1
				</span>
			</div>

			<p style={{ fontSize: 10, color: "var(--f1-muted)", marginBottom: 12, lineHeight: 1.5 }}>
				No Nigerian is yet on the F1 grid — but watch these names climbing the single-seater ladder:
			</p>

			{/* Cards */}
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				{PROSPECTS.map((p) => (
					<div
						key={p.name}
						style={{
							position: "relative",
							padding: "10px 12px 10px 16px",
							borderRadius: 8,
							background: "rgba(255,255,255,0.025)",
							border: "1px solid rgba(255,255,255,0.05)",
							overflow: "hidden",
						}}
					>
						{/* Left colour bar */}
						<div style={{
							position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
							background: p.accent,
							borderRadius: "8px 0 0 8px",
						}} />

						<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
							<span style={{ fontSize: 14 }}>{p.flag}</span>
							<span style={{ fontSize: 12, fontWeight: 800, color: "var(--f1-text)" }}>{p.name}</span>
						</div>

						<div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
							<span style={{
								fontSize: 9, fontWeight: 700, color: p.accent,
								background: `${p.accent}18`,
								border: `1px solid ${p.accent}44`,
								padding: "1px 5px", borderRadius: 3,
							}}>
								{p.series}
							</span>
							<span style={{
								fontSize: 9, fontWeight: 600, color: "var(--f1-muted)",
								background: "rgba(255,255,255,0.04)",
								border: "1px solid rgba(255,255,255,0.07)",
								padding: "1px 5px", borderRadius: 3,
							}}>
								{p.team}
							</span>
							<span style={{
								fontSize: 9, fontWeight: 600, color: "var(--f1-muted)",
								background: "rgba(255,255,255,0.04)",
								border: "1px solid rgba(255,255,255,0.07)",
								padding: "1px 5px", borderRadius: 3,
							}}>
								{p.season}
							</span>
						</div>

						<p style={{ fontSize: 10, color: "#71717a", lineHeight: 1.4 }}>{p.note}</p>
					</div>
				))}
			</div>

			<p style={{ fontSize: 9, color: "#3f3f46", marginTop: 10, lineHeight: 1.4 }}>
				🇳🇬 An F1 car will carry the green-white-green. We dey wait for that day.
			</p>
		</div>
	);
}
