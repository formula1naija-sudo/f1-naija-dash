import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import ScrollHint from "@/components/ScrollHint";

export default function Home() {
	return (
		<div>
			<section className="flex h-screen w-full flex-col items-center pt-20 sm:justify-center sm:pt-0">
				<Image src="/tag-logo.png" alt="F1 Naija logo" width={200} height={200} />

				<h1 className="my-20 text-center text-5xl font-bold">
					Real-time Formula 1 <br />
					telemetry and timing
				</h1>

				<p className="mb-10 text-center text-xl text-zinc-400 italic">
					F1 live and direct! 🇳🇬
				</p>

				<div className="flex flex-wrap gap-4">
					<Link href="/dashboard">
						<Button className="rounded-xl! border-2 border-transparent p-4 font-medium">Go to Dashboard</Button>
					</Link>

					<Link href="/schedule">
						<Button className="rounded-xl! border-2 border-zinc-700 bg-transparent! p-4 font-medium">
							Check Schedule
						</Button>
					</Link>
				</div>

				<ScrollHint />
			</section>

			<section className="pb-20">
				<h2 className="mb-4 text-2xl">What&apos;s F1 Naija?</h2>

				<p className="text-md">
					F1 Naija is Nigeria&apos;s leading Formula 1 community. This live dashboard gives you real-time
					telemetry and timing data from Formula 1 races, including leaderboards, tire choices, gaps, lap times,
					sector times and much more. Built for the culture.
				</p>
			</section>

			<section className="pb-20">
				<h2 className="mb-4 text-2xl">How does it work?</h2>

				<p className="text-md">
					During active F1 sessions (practice, qualifying, and race), the dashboard displays live data
					including driver positions, lap times, tire strategies, gaps between drivers, and sector times.
					Outside of sessions, the dashboard will appear empty &mdash; that&apos;s normal.
				</p>
			</section>

			<section className="pb-20">
				<h2 className="mb-4 text-2xl">Follow F1 Naija</h2>

				<p className="text-md">
					Follow us on{" "}
					<a className="text-blue-500" target="_blank" href="https://x.com/f1_naija">
						X (Twitter)
					</a>
					{", "}
					<a className="text-blue-500" target="_blank" href="https://www.instagram.com/f1_naija/">
						Instagram
					</a>
					{" "}and{" "}
					<a className="text-blue-500" target="_blank" href="https://www.tiktok.com/@f1.naija">
						TikTok
					</a>
					{" "}for race reactions, data breakdowns, and F1 content made for Nigerians.
				</p>
			</section>
		</div>
	);
}
