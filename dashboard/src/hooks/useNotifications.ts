"use client";

import { useEffect, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";

type PreviousState = {
	trackStatus: string | undefined;
	sessionStatus: string | undefined;
	driverPositions: { [key: string]: string };
	retiredDrivers: Set<string>;
	fastestLap: { driver: string; time: string } | null;
	rainfall: string | undefined;
	sessionPart: number | undefined;
	knockedOut: Set<string>;
	raceControlCount: number;
};

const ICON_PATH = "/tag-logo.png";

function sendNotification(title: string, body: string) {
	if (typeof window === "undefined") return;
	if (!("Notification" in window)) return; // iOS < 16.4 has no Notification API
	if (Notification.permission !== "granted") return;

	try {
		new Notification(title, {
			body,
			icon: ICON_PATH,
			badge: ICON_PATH,
			silent: false,
		});
	} catch {
		// Notification failed silently
	}
}

function getSessionType(type: string | undefined): "race" | "qualifying" | "practice" | "unknown" {
	if (!type) return "unknown";
	const t = type.toLowerCase();
	if (t.includes("race") || t.includes("sprint")) return "race";
	if (t.includes("qualifying") || t.includes("shootout")) return "qualifying";
	if (t.includes("practice")) return "practice";
	return "unknown";
}

function getDriverName(
	racingNumber: string,
	driverList: { [key: string]: { Tla: string; FullName: string } } | undefined
): string {
	if (!driverList || !driverList[racingNumber]) return racingNumber;
	return driverList[racingNumber].Tla;
}

export function useNotifications() {
	const prevState = useRef<PreviousState>({
		trackStatus: undefined,
		sessionStatus: undefined,
		driverPositions: {},
		retiredDrivers: new Set(),
		fastestLap: null,
		rainfall: undefined,
		sessionPart: undefined,
		knockedOut: new Set(),
		raceControlCount: 0,
	});

	const initialised = useRef(false);

	// Request permission on mount
	useEffect(() => {
		if (typeof window === "undefined") return;
		if ("Notification" in window && Notification.permission === "default") {
			Notification.requestPermission();
		}
	}, []);

	// Subscribe to data store
	useEffect(() => {
		const unsubscribe = useDataStore.subscribe((store) => {
			const state = store.state;
			if (!state) return;

			const prev = prevState.current;
			const sessionType = getSessionType(state.SessionInfo?.Type);
			const driverList = state.DriverList;

			// Skip notifications on first data load to avoid spam
			if (!initialised.current) {
				// Populate initial state
				prev.trackStatus = state.TrackStatus?.Status;
				prev.sessionStatus = state.SessionStatus?.Status;
				prev.rainfall = state.WeatherData?.Rainfall;
				prev.sessionPart = state.TimingData?.SessionPart ?? undefined;
				prev.raceControlCount = state.RaceControlMessages?.Messages?.length ?? 0;

				if (state.TimingData?.Lines) {
					Object.entries(state.TimingData.Lines).forEach(([num, driver]) => {
						prev.driverPositions[num] = driver.Position;
						if (driver.Retired) prev.retiredDrivers.add(num);
						if (driver.KnockedOut) prev.knockedOut.add(num);
					});
				}

				// Find initial fastest lap
				if (state.TimingStats?.Lines) {
					let fastest = { driver: "", time: "", pos: 999 };
					Object.entries(state.TimingStats.Lines).forEach(([num, driver]) => {
						if (driver.PersonalBestLapTime?.Position === 1 && driver.PersonalBestLapTime?.Value) {
							fastest = { driver: num, time: driver.PersonalBestLapTime.Value, pos: 1 };
						}
					});
					if (fastest.driver) {
						prev.fastestLap = { driver: fastest.driver, time: fastest.time };
					}
				}

				initialised.current = true;
				return;
			}

			// ==========================================
			// ALL SESSIONS: Track status changes
			// ==========================================
			const newTrackStatus = state.TrackStatus?.Status;
			if (newTrackStatus && newTrackStatus !== prev.trackStatus) {
				switch (newTrackStatus) {
					case "4":
						sendNotification("🟡 Safety Car", "Safety Car deployed");
						break;
					case "5":
						sendNotification("🔴 RED FLAG", "Session has been red flagged");
						break;
					case "6":
						sendNotification("🟡 VSC Deployed", "Virtual Safety Car deployed");
						break;
					case "7":
						sendNotification("🟢 VSC Ending", "Virtual Safety Car ending");
						break;
					case "1":
						if (prev.trackStatus === "4" || prev.trackStatus === "5" || prev.trackStatus === "6") {
							sendNotification("🟢 Track Clear", "Green flag — session resumed");
						}
						break;
				}
				prev.trackStatus = newTrackStatus;
			}

			// ==========================================
			// ALL SESSIONS: Session status changes
			// ==========================================
			const newSessionStatus = state.SessionStatus?.Status;
			if (newSessionStatus && newSessionStatus !== prev.sessionStatus) {
				if (newSessionStatus === "Started" && !prev.sessionStatus) {
					if (sessionType === "race") {
						sendNotification("🏁 LIGHTS OUT!", "Race is live — F1 live and direct!");
					} else if (sessionType === "qualifying") {
						sendNotification("🏁 GO GO GO!", "Qualifying is live");
					} else {
						sendNotification("🏁 Session Live", "Practice session has started");
					}
				}
				if (newSessionStatus === "Ends" || newSessionStatus === "Finished") {
					if (sessionType === "race") {
						sendNotification("🏁 CHEQUERED FLAG", "Race is over!");
					} else if (sessionType === "qualifying") {
						sendNotification("🏁 Session Over", "Qualifying has ended");
					} else {
						sendNotification("🏁 Session Over", "Practice session has ended");
					}
				}
				prev.sessionStatus = newSessionStatus;
			}

			// ==========================================
			// ALL SESSIONS: Rain detection
			// ==========================================
			const newRainfall = state.WeatherData?.Rainfall;
			if (newRainfall && newRainfall !== prev.rainfall) {
				if (newRainfall === "1" && prev.rainfall !== "1") {
					sendNotification("🌧️ Rain Detected", "It's starting to rain at the track!");
				}
				prev.rainfall = newRainfall;
			}

			// ==========================================
			// ALL SESSIONS: Fastest lap
			// ==========================================
			if (state.TimingStats?.Lines) {
				Object.entries(state.TimingStats.Lines).forEach(([num, driver]) => {
					if (
						driver.PersonalBestLapTime?.Position === 1 &&
						driver.PersonalBestLapTime?.Value &&
						(!prev.fastestLap ||
							prev.fastestLap.driver !== num ||
							prev.fastestLap.time !== driver.PersonalBestLapTime.Value)
					) {
						const name = getDriverName(num, driverList);
						const time = driver.PersonalBestLapTime.Value;

						if (sessionType === "race") {
							sendNotification("⚡ Fastest Lap", `${name} sets fastest lap — ${time}`);
						} else if (sessionType === "qualifying") {
							sendNotification("⚡ Provisional Pole!", `${name} goes P1 — ${time}`);
						} else {
							sendNotification("⚡ Fastest Lap", `${name} tops the timesheet — ${time}`);
						}

						prev.fastestLap = { driver: num, time };
					}
				});
			}

			// ==========================================
			// RACE ONLY: Overtakes (position changes of 1-2 places)
			// ==========================================
			if (sessionType === "race" && state.TimingData?.Lines) {
				Object.entries(state.TimingData.Lines).forEach(([num, driver]) => {
					const oldPos = prev.driverPositions[num];
					const newPos = driver.Position;

					if (oldPos && newPos && oldPos !== newPos) {
						const oldPosNum = parseInt(oldPos);
						const newPosNum = parseInt(newPos);
						const change = oldPosNum - newPosNum;

						// Only notify on gains of 1-2 positions (likely overtakes, not pit stops)
						// Only for top 10 to avoid spam
						if (change >= 1 && change <= 2 && newPosNum <= 10 && !driver.PitOut) {
							const name = getDriverName(num, driverList);

							// Find who they overtook
							const overtaken = Object.entries(state.TimingData!.Lines).find(
								([, d]) => d.Position === String(oldPosNum) && d.RacingNumber !== num
							);

							if (overtaken) {
								const overtakenName = getDriverName(overtaken[0], driverList);
								sendNotification(
									`🏎️ Overtake — P${newPos}!`,
									`${name} passes ${overtakenName} for P${newPos}`
								);
							} else {
								sendNotification(
									`🏎️ Position Change`,
									`${name} moves up to P${newPos}`
								);
							}
						}
					}

					prev.driverPositions[num] = newPos;
				});
			} else if (state.TimingData?.Lines) {
				// For non-race sessions, just track positions silently
				Object.entries(state.TimingData.Lines).forEach(([num, driver]) => {
					prev.driverPositions[num] = driver.Position;
				});
			}

			// ==========================================
			// RACE ONLY: Retirements (DNF)
			// ==========================================
			if (sessionType === "race" && state.TimingData?.Lines) {
				Object.entries(state.TimingData.Lines).forEach(([num, driver]) => {
					if (driver.Retired && !prev.retiredDrivers.has(num)) {
						const name = getDriverName(num, driverList);
						sendNotification("❌ Retirement", `${name} has retired from the race`);
						prev.retiredDrivers.add(num);
					}
				});
			}

			// ==========================================
			// QUALIFYING ONLY: Knockout alerts
			// ==========================================
			if (sessionType === "qualifying" && state.TimingData?.Lines) {
				// Detect session part change (Q1 → Q2 → Q3)
				const newPart = state.TimingData.SessionPart;
				if (newPart && newPart !== prev.sessionPart) {
					if (newPart > 1) {
						sendNotification(`🏁 Q${newPart} Starting`, `Q${newPart} is about to begin`);
					}
					prev.sessionPart = newPart;
				}

				// Detect newly knocked out drivers
				Object.entries(state.TimingData.Lines).forEach(([num, driver]) => {
					if (driver.KnockedOut && !prev.knockedOut.has(num)) {
						const name = getDriverName(num, driverList);
						sendNotification("🚫 Knocked Out", `${name} has been eliminated`);
						prev.knockedOut.add(num);
					}
				});
			}
		});

		return () => unsubscribe();
	}, []);
}
