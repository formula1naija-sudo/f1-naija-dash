"use client";

import { useEffect, type ReactNode } from "react";

import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	children: ReactNode;
};

export default function OledModeProvider({ children }: Props) {
	const oledMode = useSettingsStore((state) => state.oledMode);

	useEffect(() => {
		// OLED mode only applies in dark theme — pure black background
		const isLight = document.documentElement.getAttribute("data-theme") === "light";
		if (!isLight) {
			document.documentElement.classList.toggle("bg-black", oledMode);
			document.documentElement.classList.toggle("bg-zinc-950", !oledMode);
		} else {
			document.documentElement.classList.remove("bg-black", "bg-zinc-950");
		}
	}, [oledMode]);

	return children;
}
