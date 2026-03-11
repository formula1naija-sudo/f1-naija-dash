"use client";

import SegmentedControls from "@/components/ui/SegmentedControls";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import Input from "@/components/ui/Input";

import FavoriteDrivers from "@/components/settings/FavoriteDrivers";

import DelayInput from "@/components/DelayInput";
import DelayTimer from "@/components/DelayTimer";
import Toggle from "@/components/ui/Toggle";

import { useSettingsStore } from "@/stores/useSettingsStore";
import Footer from "@/components/Footer";

export default function SettingsPage() {
	const settings = useSettingsStore();
	return (
		<div>
			{/* ── PAGE HERO — breaks out of the settings layout padding ── */}
			<div style={{
				position: "relative", overflow: "hidden",
				margin: "-16px -16px 32px -16px",
				padding: "clamp(24px,4vw,40px) 16px clamp(20px,3vw,32px)",
				borderBottom: "1px solid var(--f1-border-soft)",
			}}>
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(var(--f1-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--f1-grid-line) 1px,transparent 1px)",
					backgroundSize: "64px 64px",
					WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
					maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%)",
				}} />
				<div style={{ position: "relative", zIndex: 1 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
						<div style={{ width: 16, height: 1, background: "#9c50f5", flexShrink: 0 }} />
						<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#9c50f5" }}>
							Preferences
						</span>
					</div>
					<div style={{ lineHeight: 0.92 }}>
						<span style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em", color: "var(--f1-text)" }}>Dashboard </span>
						<span style={{
							fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-.04em",
							background: "linear-gradient(120deg,#9c50f5 0%,#c084fc 50%,#00d484 100%)",
							WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
						}}>Settings.</span>
					</div>
				</div>
			</div>

			{/* ── SECTION: Visual ── */}
			<div style={{ marginBottom: 32 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
					<div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2, flexShrink: 0 }} />
					<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
						Visual
					</h2>
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex gap-2">
						<Toggle enabled={settings.carMetrics} setEnabled={(v) => settings.setCarMetrics(v)} />
						<p className="text-zinc-500">Show Car Metrics (RPM, Gear, Speed)</p>
					</div>

					<div className="flex gap-2">
						<Toggle enabled={settings.showCornerNumbers} setEnabled={(v) => settings.setShowCornerNumbers(v)} />
						<p className="text-zinc-500">Show Corner Numbers on Track Map</p>
					</div>

					<div className="flex gap-2">
						<Toggle enabled={settings.tableHeaders} setEnabled={(v) => settings.setTableHeaders(v)} />
						<p className="text-zinc-500">Show Driver Table Header</p>
					</div>

					<div className="flex gap-2">
						<Toggle enabled={settings.showBestSectors} setEnabled={(v) => settings.setShowBestSectors(v)} />
						<p className="text-zinc-500">Show Drivers Best Sectors</p>
					</div>

					<div className="flex gap-2">
						<Toggle enabled={settings.showMiniSectors} setEnabled={(v) => settings.setShowMiniSectors(v)} />
						<p className="text-zinc-500">Show Drivers Mini Sectors</p>
					</div>

					<div className="flex gap-2">
						<Toggle enabled={settings.oledMode} setEnabled={(v) => settings.setOledMode(v)} />
						<p className="text-zinc-500">OLED Mode (Pure Black Background)</p>
					</div>

					<div className="flex gap-2">
						<Toggle enabled={settings.useSafetyCarColors} setEnabled={(v) => settings.setUseSafetyCarColors(v)} />
						<p className="text-zinc-500">Use Safety Car Colors</p>
					</div>
				</div>
			</div>

			{/* ── SECTION: Naija Mode ── */}
			<div style={{ marginBottom: 32 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
					<div style={{ width: 3, height: 16, background: "#008751", borderRadius: 2, flexShrink: 0 }} />
					<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
						Naija Mode 🇳🇬
					</h2>
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex gap-2">
						<Toggle enabled={settings.pidginMode} setEnabled={(v) => settings.setPidginMode(v)} />
						<div>
							<p className="text-zinc-500">Pidgin Commentary Mode</p>
							<p className="text-xs text-zinc-600">Adds Naija Pidgin translations below Race Control messages</p>
						</div>
					</div>
				</div>
			</div>

			{/* ── SECTION: Race Control ── */}
			<div style={{ marginBottom: 32 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
					<div style={{ width: 3, height: 16, background: "#e8001f", borderRadius: 2, flexShrink: 0 }} />
					<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
						Race Control
					</h2>
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex gap-2">
						<Toggle enabled={settings.raceControlChime} setEnabled={(v) => settings.setRaceControlChime(v)} />
						<p className="text-zinc-500">Play Chime on new Race Control Message</p>
					</div>

					{settings.raceControlChime && (
						<div className="flex flex-row items-center gap-2">
							<Input
								value={String(settings.raceControlChimeVolume)}
								setValue={(v) => {
									const numericValue = Number(v);
									if (!isNaN(numericValue)) {
										settings.setRaceControlChimeVolume(numericValue);
									}
								}}
							/>
							<Slider
								className="!w-52"
								value={settings.raceControlChimeVolume}
								setValue={(v) => settings.setRaceControlChimeVolume(v)}
							/>
							<p className="text-zinc-500">Race Control Chime Volume</p>
						</div>
					)}
				</div>
			</div>

			{/* ── SECTION: Favorite Drivers ── */}
			<div style={{ marginBottom: 32 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<div style={{ width: 3, height: 16, background: "#f5a724", borderRadius: 2, flexShrink: 0 }} />
					<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
						Favorite Drivers
					</h2>
				</div>
				<p className="mb-4 text-zinc-500">Select your favorite drivers to highlight them on the dashboard.</p>
				<FavoriteDrivers />
			</div>

			{/* ── SECTION: Speed Metric ── */}
			<div style={{ marginBottom: 32 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<div style={{ width: 3, height: 16, background: "#00d484", borderRadius: 2, flexShrink: 0 }} />
					<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
						Speed Metric
					</h2>
				</div>
				<p className="mb-4 text-zinc-500">Choose the unit in which you want to display speeds.</p>
				<SegmentedControls
					id="speed-unit"
					selected={settings.speedUnit}
					onSelect={settings.setSpeedUnit}
					options={[
						{ label: "km/h", value: "metric" },
						{ label: "mp/h", value: "imperial" },
					]}
				/>
			</div>

			{/* ── SECTION: Delay ── */}
			<div style={{ marginBottom: 32 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
					<div style={{ width: 3, height: 16, background: "#9c50f5", borderRadius: 2, flexShrink: 0 }} />
					<h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--f1-muted)" }}>
						Delay
					</h2>
				</div>
				<p className="mb-4 text-zinc-500">
					Set a delay for the data — displayed the entered amount in seconds behind the live feed.
					You can also set it from the top bar on the Dashboard page.
				</p>
				<div className="flex items-center gap-2">
					<DelayTimer />
					<DelayInput />
					<p className="text-zinc-500">Delay in seconds</p>
				</div>
				<Button className="mt-2 bg-red-500!" onClick={() => settings.setDelay(0)}>
					Reset delay
				</Button>
			</div>

			<Footer />
		</div>
	);
}
