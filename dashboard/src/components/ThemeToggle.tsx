'use client';

import { useEffect, useState } from 'react';

type BrightnessMode = 'day' | 'night' | 'system';

const STORAGE_KEY = 'f1-naija-brightness';

function getSystemPrefersDark(): boolean {
	if (typeof window === 'undefined') return true;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyMode(mode: BrightnessMode) {
	const el = document.documentElement;
	if (mode === 'day') {
		el.style.filter = 'brightness(1.3)';
	} else if (mode === 'night') {
		el.style.filter = 'brightness(0.6)';
	} else {
		// system: bright if device prefers light, normal if device prefers dark
		el.style.filter = getSystemPrefersDark() ? '' : 'brightness(1.3)';
	}
}

export default function ThemeToggle() {
	const [mode, setMode] = useState<BrightnessMode>('system');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY) as BrightnessMode | null;
		const initial = saved ?? 'system';
		setMode(initial);
		applyMode(initial);
		setMounted(true);

		// Listen for system preference changes when in system mode
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			const current = (localStorage.getItem(STORAGE_KEY) as BrightnessMode) ?? 'system';
			if (current === 'system') applyMode('system');
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	const cycleMode = () => {
		const next: BrightnessMode = mode === 'day' ? 'night' : mode === 'night' ? 'system' : 'day';
		setMode(next);
		localStorage.setItem(STORAGE_KEY, next);
		applyMode(next);
	};

	if (!mounted) return null;

	const icon = mode === 'day' ? '☀️' : mode === 'night' ? '🌙' : '📱';
	const label = mode === 'day' ? 'Day' : mode === 'night' ? 'Night' : 'Auto';

	return (
		<button
			onClick={cycleMode}
			title={`Brightness: ${label} — click to cycle Day / Night / Auto`}
			className="fixed bottom-16 left-4 z-50 flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-zinc-700/80 active:scale-95"
		>
			<span>{icon}</span>
			<span>{label}</span>
		</button>
	);
}
