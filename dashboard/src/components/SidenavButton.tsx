"use client";

import clsx from "clsx";
import { motion } from "motion/react";

type Props = {
	className?: string;
	onClick: () => void;
};

export default function SidenavButton({ className, onClick }: Props) {
	return (
		<motion.button
			onClick={onClick}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0, opacity: 0 }}
			whileTap={{ scale: 0.9 }}
			className={clsx("flex size-12 cursor-pointer items-center justify-center text-zinc-400", className)}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			>
				<rect x="2" y="2" width="16" height="16" rx="2" />
				<line x1="7" y1="2" x2="7" y2="18" />
			</svg>
		</motion.button>
	);
}
