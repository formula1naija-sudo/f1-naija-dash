import Link from "next/link";

import Button from "@/components/ui/Button";

export default function NotFound() {
	return (
		<div className="container mx-auto max-w-5xl px-4">
			<section aria-label="Page not found" className="flex h-screen w-full flex-col items-center justify-center gap-6 text-center">
				<p className="text-8xl font-bold" style={{ color: "var(--f1-text)" }}>404</p>

				<div>
					<h1 className="text-4xl font-bold" style={{ color: "var(--f1-text)", marginBottom: 8 }}>
						<span lang="pcm">Omo, this page don lost.</span>
					</h1>
					<p className="text-sm" style={{ color: "var(--f1-muted)" }} lang="pcm">
						We no fit find wetin you dey look for — e fit don move or never exist.
					</p>
				</div>

				<Link href="/">
					<Button className="rounded-xl! border-2 border-zinc-700 bg-transparent! p-4 font-medium">
						Go back home
					</Button>
				</Link>
			</section>
		</div>
	);
}
