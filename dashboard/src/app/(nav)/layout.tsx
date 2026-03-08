import { type ReactNode } from "react";
import Link from "next/link";

import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

type Props = {
	children: ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<>
			<AdBanner />

			<nav className="sticky top-0 left-0 z-10 flex h-12 w-full items-center justify-between gap-4 border-b border-zinc-800 p-2 px-4 backdrop-blur-lg">
				<div className="flex gap-4">
					<Link className="transition duration-100 active:scale-95" href="/">
						Home
					</Link>
					<Link className="transition duration-100 active:scale-95" href="/dashboard">
						Dashboard
					</Link>
					<Link className="transition duration-100 active:scale-95" href="/schedule">
						Schedule
					</Link>
					<Link className="transition duration-100 active:scale-95" href="/news">
						News
					</Link>
					<Link className="transition duration-100 active:scale-95" href="/standings">
						Standings
					</Link>
					<Link className="transition duration-100 active:scale-95" href="/help">
						Help
					</Link>
				</div>

				<div className="hidden items-center gap-4 pr-2 sm:flex">
					<Link
						className="flex items-center gap-2 transition duration-100 active:scale-95"
						href="https://x.com/f1naija"
						target="_blank"
					>
						<span>X / Twitter</span>
					</Link>

					<Link
						className="flex items-center gap-2 transition duration-100 active:scale-95"
						href="https://instagram.com/f1naija"
						target="_blank"
					>
						<span>Instagram</span>
					</Link>
				</div>
			</nav>

			<main className="container mx-auto max-w-screen-lg px-4">
				{children}

				<Footer />
			</main>
		</>
	);
}
