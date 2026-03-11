'use client';

import { type ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useDataEngine } from '@/hooks/useDataEngine';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useStores } from '@/hooks/useStores';
import { useSocket } from '@/hooks/useSocket';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useDataStore } from '@/stores/useDataStore';
import { useNotifications } from '@/hooks/useNotifications';
import Sidebar from '@/components/Sidebar';
import SidenavButton from '@/components/SidenavButton';
import SessionInfo from '@/components/SessionInfo';
import WeatherInfo from '@/components/WeatherInfo';
import TrackInfo from '@/components/TrackInfo';
import DelayInput from '@/components/DelayInput';
import DelayTimer from '@/components/DelayTimer';
import ConnectionStatus from '@/components/ConnectionStatus';
import WhatsAppShare from '@/components/WhatsAppShare';
import Watermark from '@/components/Watermark';
import OneSignalInit from '@/components/OneSignalInit';
import PushPrompt from '@/components/PushPrompt';

type NextRace = { name: string; countryName: string; start: string };

function useNextRace() {
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  useEffect(() => {
    fetch('/api/schedule')
      .then(r => r.ok ? r.json() : null)
      .then((rounds: Array<{ countryName: string; name: string; start: string; end: string }> | null) => {
        if (!rounds) return;
        const now = Date.now();
        const next = rounds.find(r => new Date(r.end).getTime() > now);
        if (next) setNextRace({ name: next.name, countryName: next.countryName, start: next.start });
      })
      .catch(() => null);
  }, []);
  return nextRace;
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

export default function DashboardLayout({ children }: Props) {
  const stores = useStores();
  const { handleInitial, handleUpdate, maxDelay } = useDataEngine(stores);
  const { connected } = useSocket({ handleInitial, handleUpdate });
  const delay = useSettingsStore((state) => state.delay);
  const syncing = delay > maxDelay;
  useWakeLock();
  useNotifications();
  // Run immediately — not lazy-loaded, fires on every WebSocket update
  const ended = useDataStore(({ state }) => state?.SessionStatus?.Status === 'Ends');

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
          <DesktopStaticBar show={!syncing || ended} />
          <MobileStaticBar show={!syncing || ended} connected={connected} />
          <div
            className={
              !syncing || ended
                ? 'no-scrollbar min-h-0 w-full flex-1 overflow-auto md:rounded-lg'
                : 'hidden'
            }
          >
            <MobileDynamicBar />
            {!connected ? <ConnectingSkeleton /> : children}
          </div>
          <div
            className={
              syncing && !ended
                ? 'flex min-h-0 h-full flex-1 flex-col items-center justify-center md:rounded-lg md:border'
                : 'hidden'
            }
            style={{ borderColor: 'var(--f1-border)' }}
          >
            <NoSessionState />
          </div>
        </motion.div>
      </div>
    </>
  );
}

const HOW_TO_WATCH = [
  { provider: 'DStv',    channel: 'SuperSport F1 · Ch. 208' },
  { provider: 'Canal+',  channel: 'Canal+ Sport' },
  { provider: 'F1 TV',   channel: 'f1.com/subscribe' },
  { provider: 'ShowMax', channel: 'showmax.com' },
];

function NoSessionState() {
  const nextRace = useNextRace();
  const countdown = useCountdown(nextRace?.start ?? null);

  return (
    <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 480, width: '100%' }}>
      {/* Icon */}
      <div style={{ fontSize: 48, marginBottom: 20 }}>🏎️</div>

      {/* Heading */}
      <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, letterSpacing: '-.02em', color: 'var(--f1-text)', marginBottom: 8 }}>
        No live session — e don finish
      </h2>
      <p style={{ fontSize: 13, color: 'var(--f1-muted)', lineHeight: 1.6, marginBottom: 32 }}>
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
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 20, textAlign: 'left',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--f1-muted)', marginBottom: 12 }}>
          📺 How to watch in Nigeria
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HOW_TO_WATCH.map(item => (
            <div key={item.provider} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--f1-text)' }}>{item.provider}</span>
              <span style={{ fontSize: 11, color: 'var(--f1-muted)' }}>{item.channel}</span>
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
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
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

function ConnectingSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3 animate-pulse">
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
      </div>
      <div className="hidden md:items-center lg:flex">{show && <WeatherInfo />}</div>
      <div className="flex justify-end">{show && <TrackInfo />}</div>
    </div>
  );
}
