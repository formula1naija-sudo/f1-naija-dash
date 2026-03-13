'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDataEngine } from '@/hooks/useDataEngine';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useStores } from '@/hooks/useStores';
import { useSocket } from '@/hooks/useSocket';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useDataStore } from '@/stores/useDataStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Sidebar from '@/components/Sidebar';
import SidenavButton from '@/components/SidenavButton';
import SessionInfo from '@/components/SessionInfo';
import WeatherInfo from '@/components/WeatherInfo';
import TrackInfo from '@/components/TrackInfo';
import DelayInput from '@/components/DelayInput';
import DelayTimer from '@/components/DelayTimer';
import ConnectionStatus from '@/components/ConnectionStatus';
import ThemeToggle from '@/components/ThemeToggle';
// Non-critical components: lazy-loaded to keep first-paint bundle lean
const WhatsAppShare  = dynamic(() => import('@/components/WhatsAppShare'),  { ssr: false });
const Watermark      = dynamic(() => import('@/components/Watermark'),      { ssr: false });
const OneSignalInit  = dynamic(() => import('@/components/OneSignalInit'),  { ssr: false });
const PushPrompt     = dynamic(() => import('@/components/PushPrompt'),     { ssr: false });

type NextRace = { name: string; countryName: string; start: string };

type ScheduleResult = { nextRace: NextRace | null; isInRaceWeekend: boolean };

function useNextRace(): ScheduleResult {
  const [result, setResult] = useState<ScheduleResult>({ nextRace: null, isInRaceWeekend: false });
  useEffect(() => {
    fetch('/api/schedule')
      .then(r => r.ok ? r.json() : null)
      .then((rounds: Array<{ countryName: string; name: string; start: string; end: string }> | null) => {
        if (!rounds) return;
        const now = Date.now();

        // Are we currently inside a race weekend?
        // A weekend spans from the first session (round.start) to the last session (round.end).
        // We stay in "weekend mode" until the whole round ends — not just until a session ends —
        // so the live timing screen stays visible between sessions (e.g. after qualifying,
        // before the race). Only after the entire weekend finishes do we show "No live session".
        const inWeekend = rounds.some(
          r => new Date(r.start).getTime() <= now && new Date(r.end).getTime() >= now
        );

        const next = rounds.find(r => new Date(r.end).getTime() > now);
        setResult({
          isInRaceWeekend: inWeekend,
          nextRace: next ? { name: next.name, countryName: next.countryName, start: next.start } : null,
        });
      })
      .catch(() => null);
  }, []);
  return result;
}

function useCountdown(targetDate: string | null) {
  const [parts, setParts] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setParts({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        mins: Math.floor((diff % 3_600_000) / 60_000),
        secs: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return parts;
}

const NotificationPrompt = dynamic(() => import('@/components/NotificationPrompt'), { ssr: false });

type Props = {
  children: ReactNode;
};

// Routes that should always render their content regardless of live session status
const ALWAYS_SHOW_ROUTES = ['/dashboard/settings', '/dashboard/standings'];

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const stores = useStores();
  const { handleInitial, handleUpdate, maxDelay } = useDataEngine(stores);
  const { connected, reconnect } = useSocket({ handleInitial, handleUpdate });
  const delay = useSettingsStore((state) => state.delay);
  const syncing = delay > maxDelay;
  useWakeLock();
  usePushNotifications(); // single notification hub — covers all events
  // Run immediately — not lazy-loaded, fires on every WebSocket update
  const ended           = useDataStore(({ state }) => state?.SessionStatus?.Status === 'Ends');
  // Show the no-session state when the WebSocket has loaded data but no session is active.
  // 'Started' = live session running; everything else means nothing to watch right now.
  const sessionStatus   = useDataStore(({ state }) => state?.SessionStatus?.Status);
  const dataLoaded      = useDataStore(({ state }) => state !== undefined);
  const noActiveSession = connected && dataLoaded && sessionStatus !== 'Started';
  const alwaysShow      = ALWAYS_SHOW_ROUTES.some(r => pathname.startsWith(r));
  // Fetch schedule once — gives us both countdown data and weekend status.
  // During a race weekend, we keep the live timing screen visible even between
  // sessions (e.g. after FP3, before Qualifying). Only after the entire weekend
  // ends do we show "No live session — e don finish".
  const { nextRace, isInRaceWeekend } = useNextRace();
  const showNoSession   = !alwaysShow && !isInRaceWeekend && (noActiveSession || (syncing && !ended));

  return (
    <>
      {/* h-screen (100vh) instead of h-dvh (100dvh): 100dvh is unsupported on
          iOS Safari < 15.4 and falls back to height:auto, collapsing the flex
          container to 0px. h-screen renders on all iOS versions. */}
      <div className="flex h-screen w-full md:pt-2 md:pr-2 md:pb-2">
        <Sidebar key="sidebar" connected={connected} />
        <WhatsAppShare />
        <Watermark />
        <NotificationPrompt />
        <OneSignalInit />
        <PushPrompt />
{/* min-h-0: iOS Safari flex bug — without it, flex children can't shrink
            below their content size, breaking the overflow-auto scroll region */}
        <motion.div layout="size" className="flex h-full min-h-0 w-full flex-1 flex-col md:gap-2">
          <DesktopStaticBar show={!showNoSession} />
          <MobileStaticBar show={!showNoSession} connected={connected} />
          <div
            className={
              !showNoSession
                ? 'no-scrollbar min-h-0 w-full flex-1 overflow-auto md:rounded-lg'
                : 'hidden'
            }
          >
            <MobileDynamicBar />
            {!connected ? <ConnectingState onRetry={reconnect} /> : children}
          </div>
          <div
            className={
              showNoSession
                ? 'flex min-h-0 h-full flex-1 flex-col items-center justify-center md:rounded-lg md:border'
                : 'hidden'
            }
            style={{ borderColor: 'var(--f1-border)' }}
          >
            <NoSessionState nextRace={nextRace} />
          </div>
        </motion.div>
      </div>
      <ThemeToggle />
    </>
  );
}

const HOW_TO_WATCH = [
  { provider: 'DStv',  channel: 'SuperSport F1 · Ch. 215', href: null },
  { provider: 'F1 TV', channel: 'f1tv.formula1.com',       href: 'https://f1tv.formula1.com' },
];

function NoSessionState({ nextRace }: { nextRace: NextRace | null }) {
  const countdown = useCountdown(nextRace?.start ?? null);

  return (
    <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 480, width: '100%' }}>
      {/* Icon */}
      <div style={{ fontSize: 48, marginBottom: 20 }}>🏎️</div>

      {/* Heading */}
      <h2 lang="pcm" style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, letterSpacing: '-.02em', color: 'var(--f1-text)', marginBottom: 8 }}>
        No live session — e don finish
      </h2>
      <p lang="pcm" style={{ fontSize: 13, color: 'var(--f1-muted)', lineHeight: 1.6, marginBottom: 32 }}>
        Live timing, gaps, and telemetry go show here when race weekend dey. Come back when the action starts!
      </p>

      {/* Next race countdown */}
      {nextRace && (
        <div style={{
          background: 'rgba(0,212,132,.06)', border: '1px solid rgba(0,212,132,.2)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#00d484', marginBottom: 8 }}>
            Next up
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-.02em', color: 'var(--f1-text)', marginBottom: 16 }}>
            {nextRace.countryName} Grand Prix
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {([
              { v: countdown.days,  l: 'Days'  },
              { v: countdown.hours, l: 'Hours' },
              { v: countdown.mins,  l: 'Mins'  },
              { v: countdown.secs,  l: 'Secs'  },
            ] as { v: number; l: string }[]).map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center', minWidth: 52 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--f1-text)', letterSpacing: '-.03em', lineHeight: 1 }}>
                  {String(v).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--f1-muted)', marginTop: 4 }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to watch in Nigeria */}
      <div style={{
        background: 'var(--f1-panel)', border: '1px solid var(--f1-border)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 20, textAlign: 'left',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--f1-muted)', marginBottom: 12 }}>
          📺 How to watch in Nigeria
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HOW_TO_WATCH.map(item => (
            <div key={item.provider} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--f1-text)' }}>{item.provider}</span>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#00d484', textDecoration: 'none' }}>{item.channel}</a>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--f1-muted)' }}>{item.channel}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/schedule"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'var(--f1-panel)', border: '1px solid var(--f1-border)',
            color: 'var(--f1-text)', textDecoration: 'none', letterSpacing: '.02em',
          }}
        >
          📅 View Full Schedule
        </Link>
        <Link
          href="/community"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'rgba(0,212,132,.1)', border: '1px solid rgba(0,212,132,.25)',
            color: '#00d484', textDecoration: 'none', letterSpacing: '.02em',
          }}
        >
          🇳🇬 Join the Community
        </Link>
      </div>
    </div>
  );
}

// ── ConnectingState ───────────────────────────────────────────────────────────
// Replaces the old static skeleton with a timed, escalating UX:
//   0 – 8 s   → animated skeleton (fast connection expected)
//   8 – 20 s  → skeleton + "Connecting…" banner (Railway may be waking up)
//   > 20 s    → friendly error panel + manual retry button
function ConnectingState({ onRetry }: { onRetry: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRetry = useCallback(() => {
    startRef.current = Date.now();
    setElapsed(0);
    onRetry();
  }, [onRetry]);

  // > 20s — show full error panel
  if (elapsed >= 20) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-8" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>📡</div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--f1-text)', marginBottom: 6 }}>
            Taking longer than expected
          </p>
          <p style={{ fontSize: 13, color: 'var(--f1-muted)', maxWidth: 340, lineHeight: 1.6 }}>
            The live timing service may be starting up — this can take up to 30 seconds on a cold start.
          </p>
        </div>
        <button
          onClick={handleRetry}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#00d484', color: '#04060e',
            fontSize: 13, fontWeight: 800, letterSpacing: '.03em',
            fontFamily: 'inherit',
          }}
        >
          ↻ Retry connection
        </button>
        <p style={{ fontSize: 11, color: '#52525b' }}>
          If it keeps failing, check back in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* 8–20s: show a subtle "connecting" banner above the skeleton */}
      {elapsed >= 8 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(245,167,36,.08)', border: '1px solid rgba(245,167,36,.2)',
          marginBottom: 4,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#f5a724', flexShrink: 0,
            animation: 'pulse 1.4s infinite',
          }} />
          <p style={{ fontSize: 12, color: '#f5a724', fontWeight: 600, margin: 0 }}>
            Connecting to live service… ({elapsed}s) — service may be starting up
          </p>
        </div>
      )}
      {/* Always render the skeleton */}
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-10 w-1/3 rounded-lg bg-zinc-800" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800" />
            <div className="h-8 flex-1 rounded-lg bg-zinc-800" />
            <div className="h-8 w-16 rounded-lg bg-zinc-800" />
            <div className="h-8 w-20 rounded-lg bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileDynamicBar() {
  return (
    <div className="flex flex-col md:hidden" style={{ borderBottom: "1px solid var(--f1-border)" }}>
      <div className="p-2">
        <SessionInfo />
      </div>
      <div className="p-2">
        <WeatherInfo />
      </div>
    </div>
  );
}

function MobileStaticBar({ show, connected }: { show: boolean; connected: boolean }) {
  const open = useSidebarStore((state) => state.open);
  return (
    <div className="flex w-full items-center justify-between overflow-hidden p-2 md:hidden" style={{ borderBottom: "1px solid var(--f1-border)" }}>
      <div className="flex items-center gap-2">
        <SidenavButton key="mobile" onClick={() => open()} />
        {/* Back to main site */}
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 6, height: 32,
            background: "rgba(0,212,132,.08)", border: "1px solid rgba(0,212,132,.2)",
            fontSize: 11, fontWeight: 700, color: "#00d484",
            textDecoration: "none", letterSpacing: ".02em", flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
          aria-label="Back to F1 Naija"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="#00d484" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          F1 Naija
        </Link>
        <DelayInput saveDelay={500} />
        <DelayTimer />
        <ConnectionStatus connected={connected} />
      </div>
      {show && <TrackInfo />}
    </div>
  );
}

function DesktopStaticBar({ show }: { show: boolean }) {
  const pinned = useSidebarStore((state) => state.pinned);
  const pin = useSidebarStore((state) => state.pin);
  return (
    <div className="hidden w-full flex-row justify-between overflow-hidden rounded-lg p-2 md:flex" style={{ border: "1px solid var(--f1-border)" }}>
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {!pinned && <SidenavButton key="desktop" className="shrink-0" onClick={() => pin()} />}
          <motion.div key="session-info" layout="position">
            <SessionInfo />
          </motion.div>
        </AnimatePresence>
        {/* Back to main site */}
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 6, height: 30,
            background: "rgba(0,212,132,.06)", border: "1px solid rgba(0,212,132,.18)",
            fontSize: 11, fontWeight: 700, color: "#00d484",
            textDecoration: "none", letterSpacing: ".02em", flexShrink: 0,
            transition: "border-color .15s, background .15s",
          }}
          aria-label="Back to F1 Naija"
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,132,.4)"; e.currentTarget.style.background = "rgba(0,212,132,.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,212,132,.18)"; e.currentTarget.style.background = "rgba(0,212,132,.06)"; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="#00d484" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          F1 Naija
        </Link>
        {/* Help link */}
        <Link
          href="/help"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 6, height: 30,
            background: "var(--f1-panel)", border: "1px solid var(--f1-border)",
            fontSize: 11, fontWeight: 700, color: "var(--f1-muted)",
            textDecoration: "none", letterSpacing: ".02em", flexShrink: 0,
            transition: "border-color .15s, color .15s",
          }}
          aria-label="Dashboard help"
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--f1-border-mid)"; e.currentTarget.style.color = "var(--f1-text)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--f1-border)"; e.currentTarget.style.color = "var(--f1-muted)"; }}
        >
          ❓ Help
        </Link>
      </div>
      <div className="hidden md:items-center lg:flex">{show && <WeatherInfo />}</div>
      <div className="flex justify-end">{show && <TrackInfo />}</div>
    </div>
  );
}
