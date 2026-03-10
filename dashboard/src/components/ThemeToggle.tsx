'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'f1-naija-theme';

function getSystemPrefersDark(): boolean {
	if (typeof window === 'undefined') return true;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme: Theme) {
	const isDark = theme === 'system' ? getSystemPrefersDark() : theme === 'dark';
	document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === 'undefined') return 'system';
		return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system';
	});
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		applyTheme(theme);
		setMounted(true);

		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			const current = (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system';
			if (current === 'system') applyTheme('system');
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const cycleTheme = () => {
		const next: Theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
		setTheme(next);
		localStorage.setItem(STORAGE_KEY, next);
		applyTheme(next);
	};

	if (!mounted) return null;

	const isDark = theme === 'system' ? getSystemPrefersDark() : theme === 'dark';

	return (
		<button
			onClick={cycleTheme}
			title={`Theme: ${theme} — click to cycle Dark / Light / Auto`}
			aria-label="Toggle theme"
			style={{
				position: 'fixed',
				bottom: 64,
				left: 16,
				zIndex: 50,
				display: 'flex',
				alignItems: 'center',
				gap: 6,
				borderRadius: 999,
				background: 'var(--f1-panel)',
				border: '1px solid var(--f1-border)',
				padding: '5px 12px 5px 8px',
				cursor: 'pointer',
				backdropFilter: 'blur(12px)',
				WebkitBackdropFilter: 'blur(12px)',
				transition: 'background .18s, border-color .18s',
			}}
		>
			{isDark ? (
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--f1-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
				</svg>
			) : (
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--f1-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="4" />
					<line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
			)}
			<span style={{ fontSize: 11, fontWeight: 600, color: 'var(--f1-text)', letterSpacing: '.04em' }}>
				{theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}
			</span>
		</button>
	);
}
