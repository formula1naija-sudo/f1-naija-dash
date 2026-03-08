"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

import { useSidebarStore } from "@/stores/useSidebarStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import ConnectionStatus from "@/components/ConnectionStatus";
import DelayInput from "@/components/DelayInput";
import SidenavButton from "@/components/SidenavButton";
import DelayTimer from "@/components/DelayTimer";

type NavItem = { href: string; name: string; icon: React.FC };

// ─── Icons ──────────────────────────────────────────────────────────────────
// Defined as function declarations (hoisted) so they can be referenced
// in the nav-item arrays before the function bodies appear in source.

function GridIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<rect x="3" y="3" width="7" height="7" rx="1.5" />
			<rect x="14" y="3" width="7" height="7" rx="1.5" />
			<rect x="3" y="14" width="7" height="7" rx="1.5" />
			<rect x="14" y="14" width="7" height="7" rx="1.5" />
		</svg>
	);
}

function MapIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
			<line x1="9" y1="3" x2="9" y2="18" />
			<line x1="15" y1="6" x2="15" y2="21" />
		</svg>
	);
}

function TrophyIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
			<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
			<path d="M4 22h16" />
			<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
			<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
			<path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
		</svg>
	);
}

function CloudIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
		</svg>
	);
}

function HomeIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
			<polyline points="9 22 9 12 15 12 15 22" />
		</svg>
	);
}

function NewspaperIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
			<path d="M18 14h-8" />
			<path d="M15 18h-5" />
			<path d="M10 6h8v4h-8V6z" />
		</svg>
	);
}

function CalendarIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
	);
}

function SettingsIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	);
}

function HelpIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth={2.5} />
		</svg>
	);
}

function XIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function InstagramIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
			<rect x="2" y="2" width="20" height="20" rx="5" />
			<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
			<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" strokeWidth={2.5} />
		</svg>
	);
}

function TikTokIcon() {
	return (
		<svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
			<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
		</svg>
	);
}

const liveTimingItems: NavItem[] = [
	{ href: "/dashboard", name: "Dashboard", icon: GridIcon },
	{ href: "/dashboard/track-map", name: "Track Map", icon: MapIcon },
	{ href: "/dashboard/standings", name: "Standings", icon: TrophyIcon },
	{ href: "/dashboard/weather", name: "Weather", icon: CloudIcon },
];

const exploreItems: NavItem[] = [
	{ href: "/", name: "Home", icon: HomeIcon },
	{ href: "/news", name: "News", icon: NewspaperIcon },
	{ href: "/schedule", name: "Schedule", icon: CalendarIcon },
];

const moreItems: NavItem[] = [
	{ href: "/dashboard/settings", name: "Settings", icon: SettingsIcon },
	{ href: "/help", name: "Help", icon: HelpIcon },
];

const socialItems: NavItem[] = [
	{ href: "https://x.com/f1_naija", name: "X (Twitter)", icon: XIcon },
	{ href: "https://www.instagram.com/f1_naija/", name: "Instagram", icon: InstagramIcon },
	{ href: "https://www.tiktok.com/@f1.naija", name: "TikTok", icon: TikTokIcon },
];

type Props = {
	connected: boolean;
};

export default function Sidebar({ connected }: Props) {
	const { opened, pinned } = useSidebarStore();
	const close = useSidebarStore((state) => state.close);
	const open = useSidebarStore((state) => state.open);
	const pin = useSidebarStore((state) => state.pin);
	const unpin = useSidebarStore((state) => state.unpin);
	const oledMode = useSettingsStore((state) => state.oledMode);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) pin();
			else unpin();
		};
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, [pin, unpin]);

	return (
		<div>
			<motion.div
				className="hidden md:block"
				style={{ width: 216 }}
				animate={{ width: pinned ? 216 : 8 }}
			/>
			<AnimatePresence>
				{opened && (
					<motion.div
						onTouchEnd={() => close()}
						className="fixed top-0 right-0 bottom-0 left-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					/>
				)}
			</AnimatePresence>
			<motion.div
				className="no-scrollbar fixed top-0 bottom-0 left-0 z-40 flex overflow-y-auto"
				onHoverStart={!pinned ? () => open() : undefined}
				onHoverEnd={!pinned ? () => close() : undefined}
				animate={{ x: !pinned && !opened ? "-100%" : "0%" }}
				initial={{ x: "-100%" }}
				transition={{ type: "spring", bounce: 0.1 }}
			>
				<nav
					className={clsx("m-2 flex w-52 flex-col p-2", {
						"rounded-lg border border-zinc-800": !pinned,
						"bg-black": oledMode,
						"bg-zinc-950": !oledMode,
					})}
				>
					{/* Top controls */}
					<div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
						<div className="flex items-center gap-2">
							<DelayInput saveDelay={500} />
							<DelayTimer />
							<ConnectionStatus connected={connected} />
						</div>
						<SidenavButton className="hidden md:flex" onClick={() => (pinned ? unpin() : pin())} />
						<SidenavButton className="md:hidden" onClick={() => close()} />
					</div>

					{/* Brand */}
					<div className="px-2 pb-3">
						<span className="text-sm font-bold tracking-widest text-red-500">F1 NAIJA</span>
					</div>

					{/* Live Timing */}
					<SectionLabel>Live Timing</SectionLabel>
					<div className="flex flex-col gap-0.5">
						{liveTimingItems.map((item) => (
							<Item key={item.href} item={item} />
						))}
					</div>

					{/* Explore */}
					<SectionLabel className="mt-3">Explore</SectionLabel>
					<div className="flex flex-col gap-0.5">
						{exploreItems.map((item) => (
							<Item key={item.href} item={item} />
						))}
					</div>

					{/* More */}
					<SectionLabel className="mt-3">More</SectionLabel>
					<div className="flex flex-col gap-0.5">
						{moreItems.map((item) => (
							<Item key={item.href} item={item} />
						))}
					</div>

					{/* Spacer — pushes socials to bottom */}
					<div className="flex-1" />

					{/* Social */}
					<div className="border-t border-zinc-800 pt-2 mt-2">
						<SectionLabel>Follow Us</SectionLabel>
						<div className="flex flex-col gap-0.5 mt-1">
							{socialItems.map((item) => (
								<Item key={item.href} item={item} external />
							))}
						</div>
					</div>
				</nav>
			</motion.div>
		</div>
	);
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<p className={clsx("px-2 pb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500", className)}>
			{children}
		</p>
	);
}

type ItemProps = {
	item: NavItem;
	external?: boolean;
};

const Item = ({ item, external }: ItemProps) => {
	const active = usePathname() === item.href;
	const close = useSidebarStore((state) => state.close);
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			target={external ? "_blank" : undefined}
			rel={external ? "noopener noreferrer" : undefined}
			onClick={() => close()}
		>
			<div
				className={clsx(
					"flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
					active
						? "bg-zinc-800 text-white"
						: "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
				)}
			>
				<Icon />
				<span>{item.name}</span>
			</div>
		</Link>
	);
};

