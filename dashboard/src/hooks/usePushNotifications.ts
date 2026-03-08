import { useEffect, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";

interface PreviousState {
  trackStatus: string | null;
  sessionName: string | null;
  sessionActive: boolean;
  fastestLapDriver: string | null;
  positions: Record<string, number>;
  retired: Set<string>;
  knockedOut: Set<string>;
  segmentIndex: number;
}

function notify(title: string, body: string, icon = "/pwa-icon.png") {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon });
  } catch {
    // silently ignore if notifications unavailable
  }
}

export function usePushNotifications() {
  const liveData = useDataStore((s) => s.liveData);
  const prev = useRef<PreviousState>({
    trackStatus: null,
    sessionName: null,
    sessionActive: false,
    fastestLapDriver: null,
    positions: {},
    retired: new Set(),
    knockedOut: new Set(),
    segmentIndex: -1,
  });

  useEffect(() => {
    if (!liveData) return;

    const p = prev.current;
    const {
      TrackStatus,
      SessionInfo,
      DriverList,
      TimingData,
      SessionStatus,
      WeatherData,
      RaceControlMessages,
    } = liveData;

    // ── Track status ──────────────────────────────────────────────
    const trackStatus = TrackStatus?.Status ?? null;
    if (trackStatus && trackStatus !== p.trackStatus) {
      if (trackStatus === "4") notify("🟡 Safety Car", "Safety Car has been deployed");
      else if (trackStatus === "6") notify("🔴 Red Flag", "Session has been red flagged");
      else if (trackStatus === "5") notify("🟠 Virtual Safety Car", "VSC is now active");
      else if (trackStatus === "1" && p.trackStatus && p.trackStatus !== "1")
        notify("🟢 Track Clear", "Green flag — racing resumed");
      p.trackStatus = trackStatus;
    }

    // ── Session start / end ───────────────────────────────────────
    const sessionName = SessionInfo?.Name ?? null;
    const sessionActive = SessionStatus?.Status === "Started";
    if (sessionName !== p.sessionName && sessionName) {
      notify("🏁 Session Starting", sessionName);
      p.sessionName = sessionName;
    }
    if (!p.sessionActive && sessionActive) {
      notify("🏁 Session Live", `${sessionName ?? "Session"} is now underway`);
    }
    if (p.sessionActive && !sessionActive && SessionStatus?.Status === "Finished") {
      notify("🏁 Session Finished", `${sessionName ?? "Session"} has ended`);
    }
    p.sessionActive = sessionActive;

    // ── Rainfall ──────────────────────────────────────────────────
    if (WeatherData?.Rainfall === "1" && WeatherData?.Rainfall !== (p as any).rainfall) {
      notify("🌧️ Rain!", "Rain detected at the circuit");
    }
    (p as any).rainfall = WeatherData?.Rainfall;

    // ── Fastest lap ───────────────────────────────────────────────
    if (TimingData?.Lines) {
      const lines = TimingData.Lines as Record<string, any>;
      for (const [num, line] of Object.entries(lines)) {
        if (line.BestLapTime?.OverallFastest && num !== p.fastestLapDriver) {
          const name = DriverList?.[num]?.FullName ?? `Car #${num}`;
          notify("⚡ Fastest Lap", `${name} sets the fastest lap`);
          p.fastestLapDriver = num;
        }
      }
    }

    // ── Position changes & retirements ────────────────────────────
    if (TimingData?.Lines && DriverList) {
      const lines = TimingData.Lines as Record<string, any>;
      for (const [num, line] of Object.entries(lines)) {
        const pos: number = Number(line.Position ?? 0);
        const name = DriverList[num]?.FullName ?? `Car #${num}`;
        const prevPos = p.positions[num];

        // Overtake into top 10 with ≤2 place gain
        if (pos > 0 && pos <= 10 && prevPos && prevPos !== pos) {
          const gain = prevPos - pos;
          if (gain > 0 && gain <= 2) {
            notify("🔄 Overtake", `${name} moves up to P${pos}`);
          }
        }

        // Retirement
        if (line.Retired && !p.retired.has(num)) {
          notify("❌ Retirement", `${name} has retired from the race`);
          p.retired.add(num);
        }

        if (pos > 0) p.positions[num] = pos;
      }
    }

    // ── Qualifying knockouts (segment change) ─────────────────────
    if (TimingData?.NumPitStops !== undefined) {
      // Use segment index as proxy for Q1/Q2/Q3 boundary
      const segIdx: number = (liveData as any).SessionData?.StatusSeries?.length ?? -1;
      if (segIdx !== p.segmentIndex && p.segmentIndex !== -1) {
        const partNames = ["Q1", "Q2", "Q3"];
        const part = partNames[segIdx] ?? `Part ${segIdx + 1}`;
        notify("🏎️ Qualifying", `${part} is now underway`);
      }
      p.segmentIndex = segIdx;
    }

    // ── Race control — rain / safety car messages ─────────────────
    if (RaceControlMessages?.Messages) {
      const msgs = RaceControlMessages.Messages as any[];
      const lastMsg = msgs[msgs.length - 1];
      const lastSeen = (p as any).lastRCM;
      if (lastMsg && lastMsg.Utc !== lastSeen) {
        const txt: string = lastMsg.Message ?? "";
        if (/safety car/i.test(txt) || /red flag/i.test(txt) || /rain/i.test(txt)) {
          notify("📻 Race Control", txt.slice(0, 80));
        }
        (p as any).lastRCM = lastMsg.Utc;
      }
    }
  }, [liveData]);
}
